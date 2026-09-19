import React, { useState, useMemo } from 'react';
import { User, Expense } from '../../types';
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
import { Plus, Wallet, Calendar, FileText, DollarSign } from 'lucide-react';

export interface ExpensesPageProps {
  currentUser: User;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const toast = useToast();

  const [expenses, setExpenses] = useState<Expense[]>(() => DataService.getExpenses(branchId));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities & Bills',
    amount: 0,
    date: getCurrentDate(),
    paymentMethod: 'bank_transfer' as 'cash' | 'card' | 'bank_transfer',
    invoiceNumber: '',
    notes: '',
  });

  const refreshExpenses = () => {
    setExpenses(DataService.getExpenses(branchId));
  };

  const categories = [
    'Rent & Lease',
    'Utilities & Bills',
    'Kitchen Supplies & Cleaning',
    'Equipment Maintenance',
    'Marketing & Ads',
    'Licenses & Municipality',
    'Packaging Materials',
    'Other Operational',
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Utilities & Bills',
      amount: 150,
      date: getCurrentDate(),
      paymentMethod: 'card',
      invoiceNumber: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      toast.error('Expense title and amount are required.');
      return;
    }

    DataService.createExpense({
      branchId,
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      invoiceNumber: formData.invoiceNumber || undefined,
      notes: formData.notes || undefined,
    });

    toast.success(`Expense "${formData.title}" recorded successfully.`);
    setIsAddOpen(false);
    refreshExpenses();
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search expense description..."
            className="w-64"
          />

          <div className="w-52">
            <Select
              options={[
                { value: 'all', label: 'All Expense Categories' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            Total Logged: <strong className="text-amber-700">{formatSAR(totalExpenseAmount)}</strong>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Record Expense
        </Button>
      </div>

      {/* Expenses Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Title / Expense Details</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Payment Method</TableHeaderCell>
            <TableHeaderCell>Invoice Ref</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount (SAR)</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredExpenses.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell>
                <div className="font-bold text-slate-900">{exp.title}</div>
                {exp.notes && <div className="text-xs text-slate-400">{exp.notes}</div>}
              </TableCell>

              <TableCell>
                <Badge variant="warning" size="sm">
                  {exp.category}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="text-xs text-slate-500">{formatDate(exp.date)}</span>
              </TableCell>

              <TableCell>
                <span className="text-xs uppercase font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {exp.paymentMethod}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-mono text-slate-500">{exp.invoiceNumber || '-'}</span>
              </TableCell>

              <TableCell className="text-right font-bold text-amber-700">{formatSAR(exp.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ADD EXPENSE MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Operating Expense"
        subtitle="Log operational costs, electricity, water, municipal fees and supplies"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Expense Description / Title"
            placeholder="e.g. SEC Electricity Bill - Branch Meter"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Expense Category"
              options={categories.map((c) => ({ value: c, label: c }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Amount (SAR)"
              type="number"
              step="0.5"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Expense Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Select
              label="Payment Method / طریقہ ادائیگی"
              options={[
                { value: 'cash', label: 'Cash (نقد رقم)' },
                { value: 'card', label: 'Company Card (کمپنی کارڈ)' },
                { value: 'bank_transfer', label: 'Bank Transfer (بینک ٹرانسفر)' },
              ]}
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
            />
            <Input
              label="Invoice / Receipt #"
              placeholder="e.g. BILL-881"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            />
          </div>

          <Input
            label="Additional Notes / Justification"
            placeholder="Optional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
