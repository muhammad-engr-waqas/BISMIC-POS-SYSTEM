import React, { useState, useMemo } from 'react';
import { User, Purchase, InventoryItem, Supplier } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { useToast } from '../../components/common/Toast';
import { formatSAR, formatDate, getCurrentDate } from '../../utils/formatters';
import { Plus, Eye, ShoppingCart, Trash2, Calendar, FileText } from 'lucide-react';

export interface PurchasesPageProps {
  currentUser: User;
}

export const PurchasesPage: React.FC<PurchasesPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch-riyadh';
  const toast = useToast();

  const [purchases, setPurchases] = useState<Purchase[]>(() => DataService.getPurchases(branchId));
  const [suppliers] = useState<Supplier[]>(() => DataService.getSuppliers(branchId));
  const [inventory] = useState<InventoryItem[]>(() => DataService.getInventory(branchId));

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<Purchase | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit' | 'bank_transfer'>('card');
  const [itemsList, setItemsList] = useState<
    Array<{ inventoryItemId: string; quantity: number; unitCost: number }>
  >([
    {
      inventoryItemId: inventory[0]?.id || '',
      quantity: 10,
      unitCost: inventory[0]?.costPerUnit || inventory[0]?.purchasePrice || 25,
    },
  ]);

  const refreshPurchases = () => {
    setPurchases(DataService.getPurchases(branchId));
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((po) => {
      const pNum = po.purchaseNumber || po.invoiceNumber || po.id;
      const matchSearch =
        pNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (po.invoiceNumber && po.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [purchases, searchQuery]);

  const totalPurchasesCost = purchases.reduce((sum, po) => sum + (po.totalCost || po.cost || 0), 0);

  const handleAddItemRow = () => {
    const firstItem = inventory[0];
    setItemsList((prev) => [
      ...prev,
      {
        inventoryItemId: firstItem?.id || '',
        quantity: 5,
        unitCost: firstItem?.costPerUnit || firstItem?.purchasePrice || 10,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    setItemsList((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              inventoryItemId: itemId,
              unitCost: item?.costPerUnit || item?.purchasePrice || row.unitCost,
            }
          : row
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setItemsList((prev) =>
      prev.map((row, i) => (i === index ? { ...row, quantity: Math.max(1, qty) } : row))
    );
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    setItemsList((prev) =>
      prev.map((row, i) => (i === index ? { ...row, unitCost: Math.max(0, cost) } : row))
    );
  };

  // Calculations for PO modal
  const poSubtotal = itemsList.reduce((sum, row) => sum + row.quantity * row.unitCost, 0);
  const poTaxAmount = poSubtotal * 0.15; // 15% VAT
  const poGrandTotal = poSubtotal + poTaxAmount;

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    if (!selectedSupplier) {
      toast.error('Please select a valid supplier.');
      return;
    }

    if (itemsList.length === 0) {
      toast.error('Add at least one inventory item to purchase.');
      return;
    }

    const poItems = itemsList.map((row) => {
      const inv = inventory.find((i) => i.id === row.inventoryItemId);
      return {
        inventoryItemId: row.inventoryItemId,
        inventoryItemName: inv?.name || 'Item',
        quantity: row.quantity,
        unit: inv?.unit || 'unit',
        unitCost: row.unitCost,
        totalCost: row.quantity * row.unitCost,
      };
    });

    const firstItem = poItems[0];

    DataService.createPurchase({
      branchId,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      purchaseNumber: `PO-${Date.now().toString().slice(-6)}`,
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
      purchaseDate: getCurrentDate(),
      items: poItems,
      inventoryItemId: firstItem?.inventoryItemId,
      itemName: firstItem?.inventoryItemName,
      quantity: firstItem?.quantity,
      unit: firstItem?.unit,
      unitCost: firstItem?.unitCost,
      subtotal: poSubtotal,
      taxAmount: poTaxAmount,
      totalCost: poGrandTotal,
      paidAmount: paymentMethod === 'credit' ? 0 : poGrandTotal,
      remainingAmount: paymentMethod === 'credit' ? poGrandTotal : 0,
      paymentMethod,
      status: 'received',
    });

    toast.success('Inward purchase invoice logged & inventory stock updated successfully!');
    setIsCreateOpen(false);
    refreshPurchases();
  };

  return (
    <div className="space-y-5">
      {/* Header & Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Inward Purchases
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{purchases.length} Orders</div>
          <span className="text-xs text-slate-400">All recorded goods receipts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Purchases Value
          </span>
          <div className="text-xl font-bold text-sky-700 mt-1">{formatSAR(totalPurchasesCost)}</div>
          <span className="text-xs text-slate-400">Inclusive of 15% VAT</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Suppliers
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1">{suppliers.length} Vendors</div>
          <span className="text-xs text-slate-400">Approved regional suppliers</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search PO #, supplier, invoice..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          New Purchase (PO)
        </Button>
      </div>

      {/* Purchases Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>PO Number</TableHeaderCell>
            <TableHeaderCell>Supplier</TableHeaderCell>
            <TableHeaderCell>Vendor Invoice</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Purchased Items</TableHeaderCell>
            <TableHeaderCell className="text-right">Subtotal</TableHeaderCell>
            <TableHeaderCell className="text-right">VAT (15%)</TableHeaderCell>
            <TableHeaderCell className="text-right">Grand Total</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredPurchases.map((po) => (
            <TableRow key={po.id}>
              <TableCell className="font-mono font-bold text-slate-900">
                {po.purchaseNumber || po.invoiceNumber || po.id}
              </TableCell>

              <TableCell>
                <span className="font-bold text-slate-900">{po.supplierName}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono text-slate-600">{po.invoiceNumber || '-'}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-500">{formatDate(po.purchaseDate)}</span>
              </TableCell>

              <TableCell>
                <div className="text-xs text-slate-700 max-w-xs truncate">
                  {po.items && po.items.length > 0
                    ? po.items.map((i) => `${i.inventoryItemName} (${i.quantity} ${i.unit})`).join(', ')
                    : po.itemName
                    ? `${po.itemName} (${po.quantity} ${po.unit})`
                    : 'Inventory Stock'}
                </div>
              </TableCell>

              <TableCell className="text-right text-xs text-slate-600">
                {formatSAR(po.subtotal || (po.totalCost ? po.totalCost / 1.15 : 0))}
              </TableCell>

              <TableCell className="text-right text-xs text-slate-600">
                {formatSAR(po.taxAmount || (po.totalCost ? (po.totalCost / 1.15) * 0.15 : 0))}
              </TableCell>

              <TableCell className="text-right font-bold text-sky-700">
                {formatSAR(po.totalCost || po.cost || 0)}
              </TableCell>

              <TableCell className="text-right">
                <button
                  onClick={() => {
                    setSelectedPO(po);
                    setIsDetailsOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                  title="View PO Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* CREATE PURCHASE ORDER MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Inward Purchase Order / نیا خریداری بل (PO)"
        size="lg"
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Supplier / سپلائر"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            />

            <Input
              label="Supplier Invoice # / سپلائر انوائس نمبر"
              placeholder="e.g. INV-88910"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />

            <Select
              label="Payment Method / طریقہ ادائیگی"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              options={[
                { value: 'card', label: 'Bank Card / بینک کارڈ' },
                { value: 'cash', label: 'Cash / نقد رقم' },
                { value: 'bank_transfer', label: 'Bank Transfer / آن لائن ٹرانسفر' },
                { value: 'credit', label: 'On Credit / ادھار اکاؤنٹ (Credit)' },
              ]}
            />
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-slate-700">
                Purchased Inventory Items / خریدی گئی اشیاء
              </label>
              <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={handleAddItemRow}>
                Add Item Line
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {itemsList.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <div className="flex-1">
                    <select
                      value={row.inventoryItemId}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 font-medium"
                    >
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.arabicName}) - {inv.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-center font-bold"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Unit Cost"
                      value={row.unitCost}
                      onChange={(e) => handleUnitCostChange(idx, Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-right font-mono"
                    />
                  </div>

                  <div className="w-24 text-right font-bold text-slate-900 pr-1">
                    {(row.quantity * row.unitCost).toFixed(2)} SAR
                  </div>

                  {itemsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary breakdown */}
          <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
            <div className="space-y-0.5 text-xs text-sky-950">
              <div>Subtotal: <strong className="font-mono">{poSubtotal.toFixed(2)} SAR</strong></div>
              <div>VAT (15%): <strong className="font-mono">{poTaxAmount.toFixed(2)} SAR</strong></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-sky-800 font-bold uppercase">Total Payable:</span>
              <div className="text-xl font-black text-sky-900 font-mono">{poGrandTotal.toFixed(2)} SAR</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={ShoppingCart}>
              Confirm Inward PO & Update Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW PO DETAILS MODAL */}
      {selectedPO && (
        <Modal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          title={`Purchase Order: ${selectedPO.purchaseNumber || selectedPO.invoiceNumber || selectedPO.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block font-semibold">Supplier</span>
                <span className="text-sm font-bold text-slate-900">{selectedPO.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Date & Invoice</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(selectedPO.purchaseDate)} ({selectedPO.invoiceNumber || 'No ref'})
                </span>
              </div>
            </div>

            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Item</TableHeaderCell>
                  <TableHeaderCell className="text-center">Qty</TableHeaderCell>
                  <TableHeaderCell className="text-right">Unit Cost</TableHeaderCell>
                  <TableHeaderCell className="text-right">Total</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {selectedPO.items && selectedPO.items.length > 0 ? (
                  selectedPO.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-slate-900">{item.inventoryItemName}</TableCell>
                      <TableCell className="text-center">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">{item.unitCost.toFixed(2)} SAR</TableCell>
                      <TableCell className="text-right font-bold text-sky-700">{item.totalCost.toFixed(2)} SAR</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="font-semibold text-slate-900">{selectedPO.itemName || 'Item'}</TableCell>
                    <TableCell className="text-center">{selectedPO.quantity || 1} {selectedPO.unit || 'unit'}</TableCell>
                    <TableCell className="text-right">{(selectedPO.unitCost || 0).toFixed(2)} SAR</TableCell>
                    <TableCell className="text-right font-bold text-sky-700">{(selectedPO.totalCost || 0).toFixed(2)} SAR</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{(selectedPO.subtotal || (selectedPO.totalCost ? selectedPO.totalCost / 1.15 : 0)).toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Input VAT (15%):</span>
                <span>{(selectedPO.taxAmount || (selectedPO.totalCost ? (selectedPO.totalCost / 1.15) * 0.15 : 0)).toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Cost:</span>
                <span className="text-sky-700">{(selectedPO.totalCost || selectedPO.cost || 0).toFixed(2)} SAR</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
