import React, { useState, useMemo } from 'react';
import { User, InventoryItem } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { useToast } from '../../components/common/Toast';
import { formatSAR } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  Package,
  AlertTriangle,
  ArrowUpDown,
  RotateCw,
  CheckCircle,
} from 'lucide-react';

export interface InventoryPageProps {
  currentUser: User;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const toast = useToast();

  const [inventory, setInventory] = useState<InventoryItem[]>(() => DataService.getInventory(branchId));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'healthy'>('all');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Manual stock count adjustment');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    category: 'Meat & Poultry',
    currentStock: 0,
    unit: 'kg',
    minStock: 10,
    costPerUnit: 0,
  });

  const refreshInventory = () => {
    setInventory(DataService.getInventory(branchId));
  };

  const categories = useMemo(() => {
    const cats = new Set(inventory.map((i) => i.category));
    return Array.from(cats);
  }, [inventory]);

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.arabicName.includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const isLow = item.currentStock <= item.minStock;
      const matchStock =
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'low' && isLow) ||
        (stockStatusFilter === 'healthy' && !isLow);

      return matchSearch && matchCat && matchStock;
    });
  }, [inventory, searchQuery, categoryFilter, stockStatusFilter]);

  const lowStockCount = inventory.filter((i) => i.currentStock <= (i.minStock || 0)).length;
  const totalValuation = inventory.reduce(
    (sum, i) => sum + (i.currentStock || 0) * (i.costPerUnit || i.purchasePrice || 0),
    0
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      arabicName: '',
      category: 'Meat & Poultry',
      currentStock: 50,
      unit: 'kg',
      minStock: 15,
      costPerUnit: 25,
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      arabicName: item.arabicName || '',
      category: item.category || 'General',
      currentStock: item.currentStock || 0,
      unit: item.unit || 'unit',
      minStock: item.minStock || 0,
      costPerUnit: item.costPerUnit || item.purchasePrice || 0,
    });
    setIsAddEditOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Item name is required.');
      return;
    }

    if (editingItem) {
      DataService.updateInventoryItem(editingItem.id, {
        name: formData.name,
        arabicName: formData.arabicName || formData.name,
        category: formData.category,
        currentStock: Number(formData.currentStock),
        unit: formData.unit,
        minStock: Number(formData.minStock),
        costPerUnit: Number(formData.costPerUnit),
      });
      toast.success(`"${formData.name}" inventory details updated.`);
    } else {
      DataService.createInventoryItem({
        branchId,
        name: formData.name,
        arabicName: formData.arabicName || formData.name,
        category: formData.category,
        currentStock: Number(formData.currentStock),
        unit: formData.unit,
        minStock: Number(formData.minStock),
        costPerUnit: Number(formData.costPerUnit),
      });
      toast.success(`"${formData.name}" added to inventory.`);
    }

    setIsAddEditOpen(false);
    refreshInventory();
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setItemToAdjust(item);
    setAdjustQuantity(item.currentStock);
    setAdjustReason('Physical inventory audit count');
    setIsAdjustOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToAdjust) return;

    DataService.updateInventoryItem(itemToAdjust.id, {
      currentStock: Number(adjustQuantity),
    });

    toast.success(`Stock for "${itemToAdjust.name}" adjusted to ${adjustQuantity} ${itemToAdjust.unit}.`);
    setIsAdjustOpen(false);
    setItemToAdjust(null);
    refreshInventory();
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Tracked Items</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{inventory.length} Items</h3>
            <span className="text-[10px] text-slate-400 font-urdu">کل رجسٹرڈ آئٹمز (Items)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Low Stock Warnings</span>
            <h3 className="text-xl font-bold text-amber-600 mt-0.5">{lowStockCount} Items</h3>
            <span className="text-[10px] text-slate-400 font-urdu">کم اسٹاک والے آئٹمز (Low Stock)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Stock Valuation</span>
            <h3 className="text-xl font-bold text-emerald-700 mt-0.5">{formatSAR(totalValuation)}</h3>
            <span className="text-[10px] text-slate-400 font-urdu">اسٹاک کی کل مالیت (Valuation)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search raw material..."
            className="w-64"
          />

          <div className="w-44">
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>

          <div className="w-40">
            <Select
              options={[
                { value: 'all', label: 'All Stock Levels' },
                { value: 'low', label: 'Low Stock Only' },
                { value: 'healthy', label: 'Healthy Stock' },
              ]}
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
            />
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add Stock Item
        </Button>
      </div>

      {/* Inventory Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Item & Urdu Name / نام (اردو)</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell className="text-right">Current Stock</TableHeaderCell>
            <TableHeaderCell className="text-right">Min Threshold</TableHeaderCell>
            <TableHeaderCell className="text-right">Unit Cost</TableHeaderCell>
            <TableHeaderCell className="text-right">Total Valuation</TableHeaderCell>
            <TableHeaderCell>Stock Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredItems.map((item) => {
            const isLow = item.currentStock <= (item.minStock || 0);
            const unitCost = item.costPerUnit || item.purchasePrice || 0;
            const itemValuation = (item.currentStock || 0) * unitCost;
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-xs font-urdu text-slate-500">{item.arabicName}</div>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-slate-700">{item.category}</span>
                </TableCell>

                <TableCell className="text-right font-bold text-slate-900">
                  {item.currentStock} <span className="text-slate-500 font-normal text-xs">{item.unit}</span>
                </TableCell>

                <TableCell className="text-right text-slate-600">
                  {item.minStock} {item.unit}
                </TableCell>

                <TableCell className="text-right text-slate-700">{formatSAR(item.costPerUnit)}</TableCell>

                <TableCell className="text-right font-bold text-emerald-800">{formatSAR(itemValuation)}</TableCell>

                <TableCell>
                  <Badge variant={isLow ? 'danger' : 'success'} size="sm">
                    {isLow ? 'Low Stock' : 'Optimal'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenAdjust(item)}
                      className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md cursor-pointer"
                      title="Adjust Stock Quantity"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                      title="Edit Item Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? 'Edit Raw Material Item' : 'Add Inventory Item'}
        size="md"
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Item Name (English)"
              placeholder="e.g. Fresh Chicken Breast"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Item Name (Urdu / اردو نام)"
              placeholder="مثال: چکن بریسٹ / بون لیس گوشت"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: 'Meat & Poultry', label: 'Meat & Poultry' },
                { value: 'Vegetables & Produce', label: 'Vegetables & Produce' },
                { value: 'Dairy & Cheese', label: 'Dairy & Cheese' },
                { value: 'Dry Goods & Rice', label: 'Dry Goods & Rice' },
                { value: 'Bakery & Pita', label: 'Bakery & Pita' },
                { value: 'Beverages & Syrups', label: 'Beverages & Syrups' },
                { value: 'Packaging & Disposables', label: 'Packaging & Disposables' },
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Select
              label="Unit of Measurement"
              options={[
                { value: 'kg', label: 'Kilogram (kg)' },
                { value: 'g', label: 'Gram (g)' },
                { value: 'L', label: 'Liter (L)' },
                { value: 'pcs', label: 'Pieces (pcs)' },
                { value: 'pack', label: 'Pack' },
                { value: 'box', label: 'Box / Carton' },
              ]}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Initial / Current Stock"
              type="number"
              step="0.1"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Min Alert Threshold"
              type="number"
              step="0.1"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Cost per Unit (SAR)"
              type="number"
              step="0.1"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADJUST STOCK MODAL */}
      {itemToAdjust && (
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          title={`Adjust Stock: ${itemToAdjust.name}`}
          subtitle={`Current Recorded: ${itemToAdjust.currentStock} ${itemToAdjust.unit}`}
          size="sm"
        >
          <form onSubmit={handleSaveAdjustment} className="space-y-4">
            <Input
              label={`New Actual Physical Quantity (${itemToAdjust.unit})`}
              type="number"
              step="0.1"
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(parseFloat(e.target.value) || 0)}
              required
              autoFocus
            />

            <Input
              label="Adjustment Reason / Note"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. End of day audit correction"
            />

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" type="button" onClick={() => setIsAdjustOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
