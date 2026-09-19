import React, { useState, useMemo } from 'react';
import { User, PayrollRecord, StaffMember } from '../../types';
import { DataService } from '../../services/storage';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { formatSAR, formatDate, getCurrentDate } from '../../utils/formatters';
import { CreditCard, CheckCircle2, Calculator, Edit2, AlertCircle } from 'lucide-react';

export interface PayrollPageProps {
  currentUser: User;
}

export const PayrollPage: React.FC<PayrollPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch-riyadh';
  const toast = useToast();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-03');
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() =>
    DataService.getPayroll(branchId)
  );

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [bonusInput, setBonusInput] = useState<number>(0);
  const [deductionsInput, setDeductionsInput] = useState<number>(0);

  const refreshPayroll = () => {
    setPayrollRecords(DataService.getPayroll(branchId));
  };

  const filteredRecords = useMemo(() => {
    return payrollRecords.filter((p) => (p.month || p.monthYear) === selectedMonth);
  }, [payrollRecords, selectedMonth]);

  const totalDisbursed = filteredRecords
    .filter((p) => p.status === 'paid' || p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + (p.netSalary || p.paidAmount || 0), 0);

  const totalPending = filteredRecords
    .filter((p) => p.status !== 'paid' && p.paymentStatus !== 'paid')
    .reduce((sum, p) => sum + (p.netSalary || p.paidAmount || 0), 0);

  const handleGeneratePayroll = () => {
    const activeStaff = DataService.getStaff(branchId).filter((s) => s.status === 'active');
    if (activeStaff.length === 0) {
      toast.error('No active staff members found in this branch.');
      return;
    }

    let generatedCount = 0;
    activeStaff.forEach((staff) => {
      const exists = payrollRecords.some(
        (p) => p.staffId === staff.id && (p.month === selectedMonth || p.monthYear === selectedMonth)
      );
      if (!exists) {
        const basic = staff.basicSalary || staff.salary || 0;
        const housing = staff.housingAllowance || staff.allowance || 0;
        const transport = staff.transportAllowance || 0;
        const net = basic + housing + transport;
        DataService.createPayrollRecord({
          branchId,
          staffId: staff.id,
          staffName: staff.name,
          month: selectedMonth,
          basicSalary: basic,
          housingAllowance: housing,
          transportAllowance: transport,
          deductions: 0,
          bonus: 0,
          netSalary: net,
          status: 'pending',
        });
        generatedCount++;
      }
    });

    if (generatedCount > 0) {
      toast.success(`Generated payroll sheet for ${generatedCount} employees for month ${selectedMonth}.`);
      refreshPayroll();
    } else {
      toast.info(`Payroll records already exist for all active staff in ${selectedMonth}.`);
    }
  };

  const handleMarkAsPaid = (record: PayrollRecord) => {
    DataService.updatePayrollRecord(record.id, {
      status: 'paid',
      paidDate: getCurrentDate(),
    });
    toast.success(`Salary of ${formatSAR(record.netSalary || record.paidAmount)} for ${record.staffName} marked as Paid.`);
    refreshPayroll();
  };

  const handleOpenEdit = (record: PayrollRecord) => {
    setEditingRecord(record);
    setBonusInput(record.bonus || 0);
    setDeductionsInput(record.deductions || record.deduction || 0);
    setIsEditOpen(true);
  };

  const handleSaveAdjustments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const basic = editingRecord.basicSalary || 0;
    const housing = editingRecord.housingAllowance || editingRecord.allowance || 0;
    const transport = editingRecord.transportAllowance || 0;

    const net =
      basic +
      housing +
      transport +
      Number(bonusInput) -
      Number(deductionsInput);

    DataService.updatePayrollRecord(editingRecord.id, {
      bonus: Number(bonusInput),
      deductions: Number(deductionsInput),
      netSalary: net,
    });

    toast.success(`Payroll adjustments saved for ${editingRecord.staffName}.`);
    setIsEditOpen(false);
    refreshPayroll();
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Disbursed Salaries
          </span>
          <div className="text-xl font-bold text-emerald-700 mt-1">{formatSAR(totalDisbursed)}</div>
          <span className="text-xs text-slate-400">Total paid for {selectedMonth}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pending / Unpaid Wages
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1">{formatSAR(totalPending)}</div>
          <span className="text-xs text-slate-400">Due for disbursement</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Staff on Sheet
          </span>
          <div className="text-xl font-bold text-purple-700 mt-1">{filteredRecords.length} Employees</div>
          <span className="text-xs text-slate-400">Month: {selectedMonth}</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Payroll Period:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
          />
        </div>

        <Button variant="primary" icon={Calculator} onClick={handleGeneratePayroll}>
          Generate Monthly Payroll Sheet
        </Button>
      </div>

      {/* Payroll Table */}
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Employee</TableHeaderCell>
            <TableHeaderCell className="text-right">Basic</TableHeaderCell>
            <TableHeaderCell className="text-right">Housing</TableHeaderCell>
            <TableHeaderCell className="text-right">Transport</TableHeaderCell>
            <TableHeaderCell className="text-right">Bonus</TableHeaderCell>
            <TableHeaderCell className="text-right">Deductions</TableHeaderCell>
            <TableHeaderCell className="text-right">Net Payable</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {filteredRecords.map((p) => {
            const isPaid = p.status === 'paid' || p.paymentStatus === 'paid';
            const basic = p.basicSalary || 0;
            const housing = p.housingAllowance || p.allowance || 0;
            const transport = p.transportAllowance || 0;
            const bonus = p.bonus || 0;
            const ded = p.deductions || p.deduction || 0;
            const net = p.netSalary || p.paidAmount || 0;

            return (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-slate-900">{p.staffName}</TableCell>

                <TableCell className="text-right font-medium">{formatSAR(basic)}</TableCell>

                <TableCell className="text-right text-xs text-slate-600">
                  {formatSAR(housing)}
                </TableCell>

                <TableCell className="text-right text-xs text-slate-600">
                  {formatSAR(transport)}
                </TableCell>

                <TableCell className="text-right text-xs text-emerald-700">
                  {bonus > 0 ? `+${formatSAR(bonus)}` : '-'}
                </TableCell>

                <TableCell className="text-right text-xs text-red-600">
                  {ded > 0 ? `-${formatSAR(ded)}` : '-'}
                </TableCell>

                <TableCell className="text-right font-bold text-purple-800 font-mono">
                  {formatSAR(net)}
                </TableCell>

                <TableCell>
                  <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                    {isPaid ? 'Paid' : 'Pending'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isPaid && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                          title="Adjust Bonus/Deductions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={CreditCard}
                          onClick={() => handleMarkAsPaid(p)}
                        >
                          Mark Paid
                        </Button>
                      </>
                    )}
                    {isPaid && (
                      <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.paidDate ? formatDate(p.paidDate) : 'Processed'}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ADJUST PAYROLL MODAL */}
      {editingRecord && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Adjust Payroll: ${editingRecord.staffName} (${selectedMonth})`}
        >
          <form onSubmit={handleSaveAdjustments} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Basic Salary:</span>
                <span className="font-semibold">{formatSAR(editingRecord.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Housing Allowance:</span>
                <span className="font-semibold">
                  {formatSAR(editingRecord.housingAllowance || editingRecord.allowance || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transport Allowance:</span>
                <span className="font-semibold">{formatSAR(editingRecord.transportAllowance || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Bonus / بونس یا انعام (SAR)"
                type="number"
                min="0"
                value={bonusInput}
                onChange={(e) => setBonusInput(Number(e.target.value))}
              />

              <Input
                label="Deductions / کٹوتی (SAR)"
                type="number"
                min="0"
                value={deductionsInput}
                onChange={(e) => setDeductionsInput(Number(e.target.value))}
              />
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-900">Calculated Net Payout:</span>
              <span className="text-base font-bold text-purple-950 font-mono">
                {formatSAR(
                  (editingRecord.basicSalary || 0) +
                    (editingRecord.housingAllowance || editingRecord.allowance || 0) +
                    (editingRecord.transportAllowance || 0) +
                    Number(bonusInput) -
                    Number(deductionsInput)
                )}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Adjustments
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
