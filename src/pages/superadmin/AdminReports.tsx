import React, { useState, useMemo } from 'react';
import { DataService } from '../../services/storage';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DateFilterType, isDateInFilter } from '../../utils/calculations';
import { formatSAR, formatDate } from '../../utils/formatters';
import { FileText, Printer, Download, Filter, Receipt, ShoppingBag, Wallet, Trash2, Users } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<
    'vat' | 'sales' | 'purchases' | 'expenses' | 'wastage' | 'payroll'
  >('vat');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const branches = DataService.getBranches();
  const allOrders = DataService.getOrders();
  const allPurchases = DataService.getPurchases();
  const allExpenses = DataService.getExpenses();
  const allWastage = DataService.getWastage();
  const allPayroll = DataService.getPayroll();

  // Filter items by branch & date
  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const matchBranch = selectedBranchId === 'all' || o.branchId === selectedBranchId;
      const matchDate = isDateInFilter(o.date, dateFilter, customStart, customEnd);
      return matchBranch && matchDate && o.status === 'completed';
    });
  }, [allOrders, selectedBranchId, dateFilter, customStart, customEnd]);

  const filteredPurchases = useMemo(() => {
    return allPurchases.filter((p) => {
      const matchBranch = selectedBranchId === 'all' || p.branchId === selectedBranchId;
      const matchDate = isDateInFilter(p.purchaseDate, dateFilter, customStart, customEnd);
      return matchBranch && matchDate;
    });
  }, [allPurchases, selectedBranchId, dateFilter, customStart, customEnd]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      const matchBranch = selectedBranchId === 'all' || e.branchId === selectedBranchId;
      const matchDate = isDateInFilter(e.date, dateFilter, customStart, customEnd);
      return matchBranch && matchDate;
    });
  }, [allExpenses, selectedBranchId, dateFilter, customStart, customEnd]);

  const filteredWastage = useMemo(() => {
    return allWastage.filter((w) => {
      const matchBranch = selectedBranchId === 'all' || w.branchId === selectedBranchId;
      const matchDate = isDateInFilter(w.date, dateFilter, customStart, customEnd);
      return matchBranch && matchDate;
    });
  }, [allWastage, selectedBranchId, dateFilter, customStart, customEnd]);

  const filteredPayroll = useMemo(() => {
    return allPayroll.filter((p) => {
      const matchBranch = selectedBranchId === 'all' || p.branchId === selectedBranchId;
      const pDate = p.paidDate || p.paymentDate || (p.month ? `${p.month}-28` : p.monthYear ? `${p.monthYear}-28` : p.createdAt || '');
      const matchDate = isDateInFilter(pDate, dateFilter, customStart, customEnd);
      return matchBranch && matchDate;
    });
  }, [allPayroll, selectedBranchId, dateFilter, customStart, customEnd]);

  // VAT Summary Calculations
  const vatSummary = useMemo(() => {
    const totalGrossSales = filteredOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalTaxable = filteredOrders.reduce(
      (sum, o) => sum + (o.subtotal - (o.discountAmount || 0) + (o.serviceChargeAmount || 0)),
      0
    );
    const totalVatCollected = filteredOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);

    // Purchases VAT paid (input VAT)
    const totalPurchasesTax = filteredPurchases.reduce((sum, p) => sum + (p.taxAmount || 0), 0);
    const netVatPayable = totalVatCollected - totalPurchasesTax;

    return {
      totalGrossSales,
      totalTaxable,
      totalVatCollected,
      totalPurchasesTax,
      netVatPayable,
    };
  }, [filteredOrders, filteredPurchases]);

  const handlePrint = () => {
    window.print();
  };

  const getBranchName = (bId: string) => {
    return branches.find((b) => b.id === bId)?.name || bId;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              label="Select Report"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              options={[
                { value: 'vat', label: '🇸🇦 ZATCA VAT Return Report' },
                { value: 'sales', label: '🛍️ Itemized Sales Report' },
                { value: 'purchases', label: '📦 Purchases & Inward Orders' },
                { value: 'expenses', label: '🧾 Operational Expenses' },
                { value: 'wastage', label: '🗑️ Inventory Wastage & Loss' },
                { value: 'payroll', label: '👥 Staff Payroll Disbursements' },
              ]}
            />
          </div>

          <div className="w-48">
            <Select
              label="Filter by Branch"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={[
                { value: 'all', label: '🏢 All Branches' },
                ...branches.map((b) => ({ value: b.id, label: b.name })),
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            filter={dateFilter}
            startDate={customStart}
            endDate={customEnd}
            onFilterChange={setDateFilter}
            onStartDateChange={setCustomStart}
            onEndDateChange={setCustomEnd}
          />

          <div className="flex items-center gap-2 pt-5">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" />
              Print / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6 print:p-0 print:border-0">
        {/* Report Header */}
        <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {selectedBranchId === 'all' ? 'All Saudi Branches Consolidated' : getBranchName(selectedBranchId)}
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {reportType === 'vat' && 'Saudi Arabia ZATCA VAT 15% Declaration Summary'}
              {reportType === 'sales' && 'Consolidated Sales Register & Item Breakdown'}
              {reportType === 'purchases' && 'Purchases & Inward Goods Ledger'}
              {reportType === 'expenses' && 'Branch Operational Cost & Expense Statement'}
              {reportType === 'wastage' && 'Kitchen Spoilage & Damaged Stock Audit'}
              {reportType === 'payroll' && 'Staff Wages & Payroll Disbursement Report'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Period: <span className="font-semibold text-slate-700 capitalize">{dateFilter.replace('_', ' ')}</span>{' '}
              {customStart && customEnd ? `(${customStart} to ${customEnd})` : ''} • Generated on {formatDate(new Date().toISOString())}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <Badge variant="success" size="md">Official Audit Ready</Badge>
          </div>
        </div>

        {/* 1. VAT REPORT */}
        {reportType === 'vat' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-50">
                <div className="text-xs text-slate-500 font-semibold uppercase">Total Taxable Sales</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{formatSAR(vatSummary.totalTaxable)}</div>
                <div className="text-[11px] text-slate-400 mt-1">Net of discounts & service fees</div>
              </Card>
              <Card className="bg-emerald-50/60 border-emerald-200">
                <div className="text-xs text-emerald-800 font-semibold uppercase">Output VAT (15% Collected)</div>
                <div className="text-xl font-bold text-emerald-800 mt-1">{formatSAR(vatSummary.totalVatCollected)}</div>
                <div className="text-[11px] text-emerald-600 mt-1">Collected from customers</div>
              </Card>
              <Card className="bg-sky-50/60 border-sky-200">
                <div className="text-xs text-sky-800 font-semibold uppercase">Input VAT (Paid on Purchases)</div>
                <div className="text-xl font-bold text-sky-800 mt-1">{formatSAR(vatSummary.totalPurchasesTax)}</div>
                <div className="text-[11px] text-sky-600 mt-1">Claimable vendor tax</div>
              </Card>
              <Card className="bg-purple-50/60 border-purple-200">
                <div className="text-xs text-purple-800 font-semibold uppercase">Net VAT Due to ZATCA</div>
                <div className="text-xl font-bold text-purple-900 mt-1">{formatSAR(vatSummary.netVatPayable)}</div>
                <div className="text-[11px] text-purple-700 mt-1">Output VAT minus Input VAT</div>
              </Card>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">Supporting Invoices Breakdown ({filteredOrders.length} records)</h3>
            <Table>
              <TableHead>
                <tr>
                  <TableHeaderCell>Invoice #</TableHeaderCell>
                  <TableHeaderCell>Branch</TableHeaderCell>
                  <TableHeaderCell>Date & Time</TableHeaderCell>
                  <TableHeaderCell className="text-right">Subtotal</TableHeaderCell>
                  <TableHeaderCell className="text-right">Discount</TableHeaderCell>
                  <TableHeaderCell className="text-right">Taxable Amount</TableHeaderCell>
                  <TableHeaderCell className="text-right">VAT (15%)</TableHeaderCell>
                  <TableHeaderCell className="text-right">Grand Total</TableHeaderCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => {
                  const taxable = order.subtotal - (order.discountAmount || 0) + (order.serviceChargeAmount || 0);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-bold text-slate-900">{order.orderNumber}</TableCell>
                      <TableCell>{getBranchName(order.branchId)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{order.date} {order.time}</TableCell>
                      <TableCell className="text-right">{formatSAR(order.subtotal)}</TableCell>
                      <TableCell className="text-right text-emerald-700">-{formatSAR(order.discountAmount || 0)}</TableCell>
                      <TableCell className="text-right font-medium">{formatSAR(taxable)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900">{formatSAR(order.taxAmount)}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-700">{formatSAR(order.grandTotal)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 2. SALES REPORT */}
        {reportType === 'sales' && (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Order #</TableHeaderCell>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Cashier</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell className="text-right">Total Amount</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-bold text-slate-900">{o.orderNumber}</TableCell>
                  <TableCell>{getBranchName(o.branchId)}</TableCell>
                  <TableCell className="text-xs text-slate-500">{o.date} {o.time}</TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm">
                      {o.orderType} {o.tableNumber ? `(${o.tableNumber})` : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>{o.cashierName}</TableCell>
                  <TableCell className="text-xs">{o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</TableCell>
                  <TableCell className="capitalize font-medium">{o.paymentMethod}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-700">{formatSAR(o.grandTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 3. PURCHASES REPORT */}
        {reportType === 'purchases' && (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>PO Number</TableHeaderCell>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Supplier</TableHeaderCell>
                <TableHeaderCell>Invoice Ref</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Item Summary</TableHeaderCell>
                <TableHeaderCell className="text-right">Total Cost</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredPurchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-bold text-slate-900">{p.purchaseNumber || p.invoiceNumber || p.id}</TableCell>
                  <TableCell>{getBranchName(p.branchId)}</TableCell>
                  <TableCell className="font-medium">{p.supplierName}</TableCell>
                  <TableCell className="text-xs font-mono">{p.invoiceNumber || '-'}</TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(p.purchaseDate)}</TableCell>
                  <TableCell className="text-xs">
                    {p.items && p.items.length > 0
                      ? p.items.map((i) => `${i.inventoryItemName} (${i.quantity} ${i.unit})`).join(', ')
                      : p.itemName
                      ? `${p.itemName} (${p.quantity} ${p.unit})`
                      : 'Inventory Restock'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-sky-700">{formatSAR(p.totalCost || p.cost || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 4. EXPENSES REPORT */}
        {reportType === 'expenses' && (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Title & Details</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Payment Method</TableHeaderCell>
                <TableHeaderCell>Invoice #</TableHeaderCell>
                <TableHeaderCell className="text-right">Amount</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{getBranchName(e.branchId)}</TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{e.title}</div>
                    {e.notes && <div className="text-xs text-slate-400">{e.notes}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning" size="sm">
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(e.date)}</TableCell>
                  <TableCell className="capitalize">{e.paymentMethod}</TableCell>
                  <TableCell className="font-mono text-xs">{e.invoiceNumber || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-amber-700">{formatSAR(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 5. WASTAGE REPORT */}
        {reportType === 'wastage' && (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Item Name</TableHeaderCell>
                <TableHeaderCell>Quantity Lost</TableHeaderCell>
                <TableHeaderCell>Reason</TableHeaderCell>
                <TableHeaderCell>Reported Date</TableHeaderCell>
                <TableHeaderCell>Reported By</TableHeaderCell>
                <TableHeaderCell className="text-right">Total Loss Cost</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredWastage.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{getBranchName(w.branchId)}</TableCell>
                  <TableCell className="font-bold text-slate-900">{w.inventoryItemName || w.itemName}</TableCell>
                  <TableCell>
                    {w.quantity} {w.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant="danger" size="sm">
                      {w.reason}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(w.date)}</TableCell>
                  <TableCell className="text-xs">{w.reportedBy || w.staffName || 'Kitchen Staff'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">{formatSAR(w.totalCost || w.cost || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 6. PAYROLL REPORT */}
        {reportType === 'payroll' && (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Employee Name</TableHeaderCell>
                <TableHeaderCell>Month</TableHeaderCell>
                <TableHeaderCell className="text-right">Basic Salary</TableHeaderCell>
                <TableHeaderCell className="text-right">Housing Allowance</TableHeaderCell>
                <TableHeaderCell className="text-right">Transport</TableHeaderCell>
                <TableHeaderCell className="text-right">Bonus / Deductions</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Net Paid Salary</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {filteredPayroll.map((pay) => (
                <TableRow key={pay.id}>
                  <TableCell>{getBranchName(pay.branchId)}</TableCell>
                  <TableCell className="font-bold text-slate-900">{pay.staffName}</TableCell>
                  <TableCell className="font-mono text-xs">{pay.month || pay.monthYear}</TableCell>
                  <TableCell className="text-right">{formatSAR(pay.basicSalary)}</TableCell>
                  <TableCell className="text-right">{formatSAR(pay.housingAllowance || pay.allowance || 0)}</TableCell>
                  <TableCell className="text-right">{formatSAR(pay.transportAllowance || 0)}</TableCell>
                  <TableCell className="text-right text-xs">
                    +{formatSAR(pay.bonus || 0)} / -{formatSAR(pay.deductions || pay.deduction || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={pay.status === 'paid' || pay.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {pay.status || pay.paymentStatus || 'paid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-purple-800">{formatSAR(pay.netSalary || pay.paidAmount || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
