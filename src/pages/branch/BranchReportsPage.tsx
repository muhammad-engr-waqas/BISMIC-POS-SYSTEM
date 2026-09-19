import React, { useState, useMemo } from 'react';
import { User, Order, PurchaseOrder, Expense, WastageLog, PayrollRecord } from '../../types';
import { DataService } from '../../services/storage';
import { calculateFinancialSummary } from '../../utils/calculations';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { formatSAR, formatPercentage } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Trash2,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Download,
  UtensilsCrossed,
} from 'lucide-react';

export interface BranchReportsPageProps {
  currentUser: User;
}

export const BranchReportsPage: React.FC<BranchReportsPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const branch = DataService.getBranchById(branchId);

  // Date filters
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');

  // Load branch data
  const orders = useMemo(() => DataService.getOrders(branchId), [branchId]);
  const purchases = useMemo(() => DataService.getPurchases(branchId), [branchId]);
  const expenses = useMemo(() => DataService.getExpenses(branchId), [branchId]);
  const wastage = useMemo(() => DataService.getWastage(branchId), [branchId]);
  const payroll = useMemo(() => DataService.getPayroll(branchId), [branchId]);

  // Financial summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(orders, purchases, expenses, wastage, payroll, startDate, endDate);
  }, [orders, purchases, expenses, wastage, payroll, startDate, endDate]);

  // Top Selling Items
  const topItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders
      .filter((o) => o.status === 'completed' && o.date >= startDate && o.date <= endDate)
      .forEach((order) => {
        order.items.forEach((item) => {
          const existing = itemMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
          itemMap.set(item.name, existing);
        });
      });
    return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders, startDate, endDate]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const methods: Record<string, { count: number; total: number }> = {
      card: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
      apple_pay: { count: 0, total: 0 },
      delivery_app: { count: 0, total: 0 },
    };

    orders
      .filter((o) => o.status === 'completed' && o.date >= startDate && o.date <= endDate)
      .forEach((order) => {
        if (!methods[order.paymentMethod]) {
          methods[order.paymentMethod] = { count: 0, total: 0 };
        }
        methods[order.paymentMethod].count += 1;
        methods[order.paymentMethod].total += order.grandTotal;
      });

    return methods;
  }, [orders, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <div className="flex items-center gap-2">
          <Button variant="outline" icon={Printer} onClick={handlePrint}>
            Print Statement
          </Button>
        </div>
      </div>

      {/* P&L Statement Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Branch Profit & Loss Statement
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {branch?.name} {branch?.arabicName && <span className="font-urdu text-slate-600 font-semibold">({branch?.arabicName})</span>}
            </h3>
            <p className="text-xs text-slate-400">Period: {startDate} to {endDate}</p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase">Net Profit Margin</span>
            <div className={`text-2xl font-black ${summary.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatPercentage(summary.profitMargin)}
            </div>
          </div>
        </div>

        {/* Financial Flow Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 pt-4">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-800">Gross Revenue</span>
            <div className="text-base font-bold text-emerald-950 mt-1">{formatSAR(summary.totalSales)}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">{summary.totalOrdersCount} Completed Orders</span>
          </div>

          <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
            <span className="text-[10px] font-bold uppercase text-sky-800">Purchases (COGS)</span>
            <div className="text-base font-bold text-sky-950 mt-1">-{formatSAR(summary.totalPurchases)}</div>
            <span className="text-[10px] text-sky-700 font-semibold">Raw Ingredients Inward</span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[10px] font-bold uppercase text-amber-800">Operating Expenses</span>
            <div className="text-base font-bold text-amber-950 mt-1">-{formatSAR(summary.totalExpenses)}</div>
            <span className="text-[10px] text-amber-700 font-semibold">Rent, Bills, Repair</span>
          </div>

          <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
            <span className="text-[10px] font-bold uppercase text-red-800">Wastage / Loss</span>
            <div className="text-base font-bold text-red-950 mt-1">-{formatSAR(summary.totalWastage)}</div>
            <span className="text-[10px] text-red-700 font-semibold">Spoiled / Expired Goods</span>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <span className="text-[10px] font-bold uppercase text-purple-800">Staff Payroll</span>
            <div className="text-base font-bold text-purple-950 mt-1">-{formatSAR(summary.totalSalaries)}</div>
            <span className="text-[10px] text-purple-700 font-semibold">Salaries & Allowances</span>
          </div>

          <div className={`p-3 rounded-xl border ${summary.netProfit >= 0 ? 'bg-emerald-100/70 border-emerald-300' : 'bg-red-100/70 border-red-300'}`}>
            <span className="text-[10px] font-bold uppercase text-slate-800">Calculated Net Profit</span>
            <div className={`text-base font-black mt-1 ${summary.netProfit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
              {formatSAR(summary.netProfit)}
            </div>
            <span className="text-[10px] font-bold text-slate-600 font-mono">
              VAT: {formatSAR(summary.totalVatCollected)}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Top Selling Menu Items
            </h4>
          </div>

          <div className="divide-y divide-slate-100">
            {topItems.map((item, index) => (
              <div key={index} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block">{item.quantity} sold</span>
                  </div>
                </div>
                <div className="text-right font-bold text-xs text-emerald-800">
                  {formatSAR(item.revenue)}
                </div>
              </div>
            ))}
            {topItems.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">No orders in this period.</div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Payment Methods Breakdown
            </h4>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(paymentBreakdown).map(([method, data]) => {
              const share = summary.totalSales > 0 ? (data.total / summary.totalSales) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold capitalize text-slate-800">
                      {method.replace('_', ' ')} ({data.count} txns)
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatSAR(data.total)} ({share.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full rounded-full" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
