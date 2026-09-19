import React, { useState, useMemo } from 'react';
import { User, WastageLog, InventoryItem } from '../../types';
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
import { Plus, Trash2, AlertTriangle, Calendar, UserCheck } from 'lucide-react';

export interface WastagePageProps {
  currentUser: User;
}

export const WastagePage: React.FC<WastagePageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const toast = useToast();

  const [wastage, setWastage] = useState<WastageLog[]>(() => DataService.getWastage(branchId));
  const inventory = useMemo(() => DataService.getInventory(branchId), [branchId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [inventoryItemId, setInventoryItemId] = useState(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(2);
  const [reason, setReason] = useState<'spoilage' | 'expired' | 'damaged' | 'burnt' | 'prep_loss'>('spoilage');
  const [date, setDate] = useState(getCurrentDate());
  const [reportedBy, setReportedBy] = useState(currentUser.name);
  const [notes, setNotes] = useState('');

  const refreshWastage = () => {
    setWastage(DataService.getWastage(branchId));
  };

  const selectedInventoryItem = inventory.find((i) => i.id === inventoryItemId);
  const calculatedCost = (selectedInventoryItem?.costPerUnit || 0) * quantity;

  const filteredWastage = useMemo(() => {
    return wastage.filter((w) => {
      const itemName = w.inventoryItemName || w.itemName || '';
      const rep = w.reportedBy || w.staffName || '';
      const matchSearch =
        itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.notes && w.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchReason = reasonFilter === 'all' || w.reason === reasonFilter;
      return matchSearch && matchReason;
    });
  }, [wastage, searchQuery, reasonFilter]);

  const totalWastageCost = wastage.reduce((sum, w) => sum + (w.totalCost || 0), 0);

  const handleOpenAdd = () => {
    setInventoryItemId(inventory[0]?.id || '');
    setQuantity(2);
    setReason('spoilage');
    setDate(getCurrentDate());
    setReportedBy(currentUser.name);
    setNotes('');
    setIsAddOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryItem) {
      toast.error('Select a valid inventory item.');
      return;
    }
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0.');
      return;
    }

    DataService.createWastageLog({
      branchId,
      inventoryItemId: selectedInventoryItem.id,
      inventoryItemName: selectedInventoryItem.name,
      itemName: selectedInventoryItem.name,
      quantity: Number(quantity),
      unit: selectedInventoryItem.unit,
      costPerUnit: selectedInventoryItem.costPerUnit || selectedInventoryItem.purchasePrice || 0,
      cost: calculatedCost,
      totalCost: calculatedCost,
      reason,
      date,
      reportedBy,
      staffName: reportedBy,
      notes: notes || undefined,
    });

    toast.success('Wastage record logged! Stock has been deducted from inventory.');
    setIsAddOpen(false);
    refreshWastage();
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search wastage items or notes..."
            className="w-64"
          />

          <div className="w-44">
            <Select
              options={[
                { value: 'all', label: 'All Reasons' },
                { value: 'spoilage', label: 'Spoilage' },
                { value: 'expired', label: 'Expired' },
                { value: 'damaged', label: 'Damaged' },
                { value: 'burnt', label: 'Kitchen / Burnt' },
                { value: 'prep_loss', label: 'Prep Loss' },
              ]}
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            Total Wastage Cost: <strong className="text-red-600">{formatSAR(totalWastageCost)}</strong>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Log Wastage
        </Button>
      </div>

      {/* Wastage Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Raw Material Item</TableHeaderCell>
            <TableHeaderCell>Quantity Lost</TableHeaderCell>
            <TableHeaderCell>Loss Reason</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Reported By</TableHeaderCell>
            <TableHeaderCell>Notes</TableHeaderCell>
            <TableHeaderCell className="text-right">Financial Loss</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredWastage.map((w) => {
            const unitCost = w.costPerUnit || (w.totalCost && w.quantity ? w.totalCost / w.quantity : 0);
            return (
              <TableRow key={w.id}>
                <TableCell>
                  <div className="font-bold text-slate-900">{w.inventoryItemName || w.itemName || 'Item'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {unitCost.toFixed(2)} SAR/{w.unit}
                  </div>
                </TableCell>

              <TableCell>
                <span className="font-bold text-slate-800">
                  {w.quantity} {w.unit}
                </span>
              </TableCell>

              <TableCell>
                <Badge variant="danger" size="sm">
                  {w.reason.replace('_', ' ')}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-500">{formatDate(w.date)}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-700">{w.reportedBy}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-500 italic max-w-xs truncate block">{w.notes || '-'}</span>
              </TableCell>

              <TableCell className="text-right font-bold text-red-600">{formatSAR(w.totalCost)}</TableCell>
            </TableRow>
          );
        })}
        </TableBody>
      </Table>

      {/* LOG WASTAGE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log Kitchen / Warehouse Wastage"
        subtitle="Deducts raw materials from inventory and calculates financial loss"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Select Raw Material Item"
            options={inventory.map((i) => ({
              value: i.id,
              label: `${i.name} (Stock: ${i.currentStock} ${i.unit} • ${i.costPerUnit} SAR/${i.unit})`,
            }))}
            value={inventoryItemId}
            onChange={(e) => setInventoryItemId(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Wasted Quantity (${selectedInventoryItem?.unit || 'unit'})`}
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              required
            />
            <Select
              label="Wastage Reason / ضیاع کی وجہ"
              options={[
                { value: 'spoilage', label: 'Spoilage (خراب / گل سڑ جانا)' },
                { value: 'expired', label: 'Expired (تاریخ گزر جانا / Expired)' },
                { value: 'damaged', label: 'Damaged (ٹوٹ پھوٹ / نقصان)' },
                { value: 'burnt', label: 'Kitchen / Burnt (جل جانا / پکانے کی خرابی)' },
                { value: 'prep_loss', label: 'Prep Trimming Loss (کاٹنے اور چھلکے کا ضیاع)' },
              ]}
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Incident Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Reported By (Chef / Supervisor)"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              required
            />
          </div>

          <Input
            label="Explanation / Incident Note"
            placeholder="e.g. Walk-in chiller temperature rose due to power outage"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Loss Calculation Banner */}
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex justify-between items-center text-xs">
            <span className="text-red-900 font-bold">Total Calculated Financial Loss:</span>
            <span className="text-base font-black text-red-700">{formatSAR(calculatedCost)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit">
              Deduct from Stock & Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
