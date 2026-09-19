import React, { useState, useMemo } from 'react';
import { DataService } from '../../services/storage';
import { Card } from '../../components/common/Card';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { Select } from '../../components/common/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DateFilterType, calculateFinancialSummary } from '../../utils/calculations';
import { formatSAR, formatDate } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Wallet,
  Trash2,
  Users,
  Store,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

export const BranchFinancials: React.FC = () => {
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

  // Branch summaries
  const branchSummaries = useMemo(() => {
    const list = selectedBranchId === 'all'
      ? branches
      : branches.filter((b) => b.id === selectedBranchId);

    return list.map((branch) => {
      const bOrders = allOrders.filter((o) => o.branchId === branch.id);
      const bPurchases = allPurchases.filter((p) => p.branchId === branch.id);
      const bExpenses = allExpenses.filter((e) => e.branchId === branch.id);
      const bWastage = allWastage.filter((w) => w.branchId === branch.id);
      const bPayroll = allPayroll.filter((p) => p.branchId === branch.id);

      const summary = calculateFinancialSummary(
        bOrders,
        bPurchases,
        bExpenses,
        bWastage,
        bPayroll,
        dateFilter,
        customStart,
        customEnd
      );

      return {
        branch,
        summary,
      };
    });
  }, [branches, selectedBranchId, allOrders, allPurchases, allExpenses, allWastage, allPayroll, dateFilter, customStart, customEnd]);

  // Overall totals across the selected branches
  const grandTotals = useMemo(() => {
    return branchSummaries.reduce(
      (acc, curr) => {
        acc.sales += curr.summary.sales;
        acc.purchases += curr.summary.purchases;
        acc.expenses += curr.summary.expenses;
        acc.wastage += curr.summary.wastage;
        acc.salaries += curr.summary.salaries;
        acc.netProfit += curr.summary.netProfit;
        acc.orderCount += curr.summary.orderCount;
        return acc;
      },
      {
        sales: 0,
        purchases: 0,
        expenses: 0,
        wastage: 0,
        salaries: 0,
        netProfit: 0,
        orderCount: 0,
      }
    );
  }, [branchSummaries]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              options={[
                { value: 'all', label: 'All Branches (Consolidated)' },
                ...branches.map((b) => ({
                  value: b.id,
                  label: b.name,
                })),
              ]}
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            />
          </div>

          <DateRangePicker
            selectedFilter={dateFilter}
            onFilterChange={setDateFilter}
            startDate={customStart}
            endDate={customEnd}
            onCustomDateChange={(s, e) => {
              setCustomStart(s);
              setCustomEnd(e);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print Statement
          </Button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Branch-Wise Financial Statement</h2>
            <p className="text-xs font-urdu text-slate-500">برانچ وائز تفصیلی مالیاتی گوشوارہ</p>
            <p className="text-xs text-slate-600 mt-1">
              Scope:{' '}
              <strong>
                {selectedBranchId === 'all'
                  ? 'Consolidated Enterprise (All Branches)'
                  : branches.find((b) => b.id === selectedBranchId)?.name}
              </strong>
            </p>
          </div>
          <div className="text-right text-xs">
            <Badge variant="default" className="uppercase font-bold">
              Period: {dateFilter.replace('_', ' ')}
            </Badge>
            <p className="text-slate-400 mt-1 text-[11px]">Formula: Net Profit = Sales - Purchases - Expenses - Wastage - Salaries</p>
          </div>
        </div>

        {/* Grand Total Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Total Sales (+)</span>
            <p className="text-base font-extrabold text-emerald-700 mt-0.5">{formatSAR(grandTotals.sales)}</p>
            <span className="text-[10px] text-slate-400">{grandTotals.orderCount} Orders</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Purchases (-)</span>
            <p className="text-base font-extrabold text-sky-700 mt-0.5">{formatSAR(grandTotals.purchases)}</p>
            <span className="text-[10px] text-slate-400">Inventory Supply</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Expenses (-)</span>
            <p className="text-base font-extrabold text-amber-700 mt-0.5">{formatSAR(grandTotals.expenses)}</p>
            <span className="text-[10px] text-slate-400">Bills & Operations</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Wastage (-)</span>
            <p className="text-base font-extrabold text-red-700 mt-0.5">{formatSAR(grandTotals.wastage)}</p>
            <span className="text-[10px] text-slate-400">Damaged / Spoiled</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500">Salaries (-)</span>
            <p className="text-base font-extrabold text-purple-700 mt-0.5">{formatSAR(grandTotals.salaries)}</p>
            <span className="text-[10px] text-slate-400">Staff Payroll</span>
          </div>

          <div className={`p-3 rounded-lg border ${grandTotals.netProfit >= 0 ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-red-900 text-white border-red-800'}`}>
            <span className="text-[10px] font-bold uppercase opacity-80">NET PROFIT (=)</span>
            <p className="text-base font-extrabold mt-0.5">{formatSAR(grandTotals.netProfit)}</p>
            <span className="text-[10px] opacity-80 font-urdu">خالص منافع</span>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Branch Name</TableHeaderCell>
              <TableHeaderCell className="text-right">Sales / فروخت (+)</TableHeaderCell>
              <TableHeaderCell className="text-right">Purchases / خریداری (-)</TableHeaderCell>
              <TableHeaderCell className="text-right">Expenses / اخراجات (-)</TableHeaderCell>
              <TableHeaderCell className="text-right">Wastage / ضیاع (-)</TableHeaderCell>
              <TableHeaderCell className="text-right">Salaries / تنخواہیں (-)</TableHeaderCell>
              <TableHeaderCell className="text-right">Net Profit / خالص منافع (=)</TableHeaderCell>
              <TableHeaderCell className="text-center">Margin</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {branchSummaries.map(({ branch, summary }) => {
              const profitMargin = summary.sales > 0 ? (summary.netProfit / summary.sales) * 100 : 0;
              return (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{branch.name}</div>
                    <div className="text-xs font-urdu text-slate-500">{branch.arabicName}</div>
                  </TableCell>

                  <TableCell className="text-right font-semibold text-emerald-700">
                    {formatSAR(summary.sales)}
                  </TableCell>

                  <TableCell className="text-right font-medium text-slate-700">
                    {formatSAR(summary.purchases)}
                  </TableCell>

                  <TableCell className="text-right font-medium text-slate-700">
                    {formatSAR(summary.expenses)}
                  </TableCell>

                  <TableCell className="text-right font-medium text-red-600">
                    {formatSAR(summary.wastage)}
                  </TableCell>

                  <TableCell className="text-right font-medium text-purple-700">
                    {formatSAR(summary.salaries)}
                  </TableCell>

                  <TableCell className="text-right font-bold text-sm">
                    <span className={summary.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                      {formatSAR(summary.netProfit)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge variant={profitMargin >= 20 ? 'success' : profitMargin >= 0 ? 'info' : 'danger'}>
                      {profitMargin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Total Row */}
            <TableRow className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <TableCell>
                <div className="font-black text-slate-900 uppercase">Enterprise Total</div>
                <div className="text-xs font-urdu text-slate-600">مجموعی کل میزان</div>
              </TableCell>
              <TableCell className="text-right font-bold text-emerald-800">{formatSAR(grandTotals.sales)}</TableCell>
              <TableCell className="text-right font-bold text-slate-800">{formatSAR(grandTotals.purchases)}</TableCell>
              <TableCell className="text-right font-bold text-slate-800">{formatSAR(grandTotals.expenses)}</TableCell>
              <TableCell className="text-right font-bold text-red-700">{formatSAR(grandTotals.wastage)}</TableCell>
              <TableCell className="text-right font-bold text-purple-800">{formatSAR(grandTotals.salaries)}</TableCell>
              <TableCell className="text-right font-black text-base text-slate-900">
                <span className={grandTotals.netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                  {formatSAR(grandTotals.netProfit)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="default" className="font-bold">
                  {grandTotals.sales > 0 ? ((grandTotals.netProfit / grandTotals.sales) * 100).toFixed(1) : 0}%
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
