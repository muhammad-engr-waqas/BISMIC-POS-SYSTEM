import React, { useState, useMemo } from 'react';
import { DataService } from '../../services/storage';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { Select } from '../../components/common/Select';
import { DateFilterType, calculateFinancialSummary } from '../../utils/calculations';
import { formatSAR } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { SystemRestartModal } from '../../components/common/SystemRestartModal';
import {
  Store,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  Receipt,
  Trash2,
  Users,
  Wallet,
  RotateCcw,
} from 'lucide-react';

export interface AdminDashboardProps {
  onNavigateToBranches?: () => void;
  onNavigateToFinancials?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [showRestartModal, setShowRestartModal] = useState(false);

  const branches = DataService.getBranches();
  const allOrders = DataService.getOrders();
  const allPurchases = DataService.getPurchases();
  const allExpenses = DataService.getExpenses();
  const allWastage = DataService.getWastage();
  const allPayroll = DataService.getPayroll();

  // Filter by branch if selected
  const filteredOrders = selectedBranchId === 'all' ? allOrders : allOrders.filter((o) => o.branchId === selectedBranchId);
  const filteredPurchases = selectedBranchId === 'all' ? allPurchases : allPurchases.filter((p) => p.branchId === selectedBranchId);
  const filteredExpenses = selectedBranchId === 'all' ? allExpenses : allExpenses.filter((e) => e.branchId === selectedBranchId);
  const filteredWastage = selectedBranchId === 'all' ? allWastage : allWastage.filter((w) => w.branchId === selectedBranchId);
  const filteredPayroll = selectedBranchId === 'all' ? allPayroll : allPayroll.filter((p) => p.branchId === selectedBranchId);

  // Financial summary for selected date filter
  const activeSummary = useMemo(() => {
    return calculateFinancialSummary(
      filteredOrders,
      filteredPurchases,
      filteredExpenses,
      filteredWastage,
      filteredPayroll,
      dateFilter,
      customStart,
      customEnd
    );
  }, [filteredOrders, filteredPurchases, filteredExpenses, filteredWastage, filteredPayroll, dateFilter, customStart, customEnd]);

  // Today's summary
  const todaySummary = useMemo(() => {
    return calculateFinancialSummary(
      filteredOrders,
      filteredPurchases,
      filteredExpenses,
      filteredWastage,
      filteredPayroll,
      'today'
    );
  }, [filteredOrders, filteredPurchases, filteredExpenses, filteredWastage, filteredPayroll]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    return calculateFinancialSummary(
      filteredOrders,
      filteredPurchases,
      filteredExpenses,
      filteredWastage,
      filteredPayroll,
      'this_month'
    );
  }, [filteredOrders, filteredPurchases, filteredExpenses, filteredWastage, filteredPayroll]);

  const activeBranchesCount = branches.filter((b) => b.status === 'active').length;



  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              options={[
                { value: 'all', label: 'All Branches (Enterprise HQ)' },
                ...branches.map((b) => ({
                  value: b.id,
                  label: `${b.name} (${b.status})`,
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
            onCustomDateChange={(start, end) => {
              setCustomStart(start);
              setCustomEnd(end);
            }}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right text-xs text-slate-500 font-medium hidden md:block">
            Showing: <span className="font-bold text-slate-800 uppercase">{dateFilter.replace('_', ' ')}</span>
          </div>

          <Button
            variant="danger"
            size="sm"
            icon={RotateCcw}
            onClick={() => setShowRestartModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-xs font-bold text-xs"
          >
            Restart (All Data 0) / ری اسٹارٹ
          </Button>
        </div>
      </div>

      {/* Row 1: High Level Branch Status & Today's Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Branches */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Branches</span>
            <Store className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{branches.length}</p>
          <p className="text-[10px] text-slate-500 font-urdu">کل برانچیں</p>
        </div>

        {/* Active Branches */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{activeBranchesCount}</p>
          <p className="text-[10px] text-slate-500 font-urdu">فعال برانچیں</p>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Today Sales</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 truncate">{formatSAR(todaySummary.sales, false)}</p>
          <p className="text-[10px] text-emerald-600 font-bold">SAR</p>
        </div>

        {/* Today's Purchases */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Today Purchases</span>
            <Receipt className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 truncate">{formatSAR(todaySummary.purchases, false)}</p>
          <p className="text-[10px] text-slate-500">SAR</p>
        </div>

        {/* Today's Expenses */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Today Expenses</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 truncate">{formatSAR(todaySummary.expenses, false)}</p>
          <p className="text-[10px] text-slate-500">SAR</p>
        </div>

        {/* Today's Wastage */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Today Wastage</span>
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-lg font-extrabold text-red-700 truncate">{formatSAR(todaySummary.wastage, false)}</p>
          <p className="text-[10px] text-slate-500">SAR</p>
        </div>

        {/* Today's Salaries */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">Today Payroll</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 truncate">{formatSAR(todaySummary.salaries, false)}</p>
          <p className="text-[10px] text-slate-500">SAR</p>
        </div>

        {/* Today's Net Profit */}
        <div className={`p-3.5 rounded-xl border shadow-2xs ${todaySummary.netProfit >= 0 ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-red-900 text-white border-red-800'}`}>
          <div className="flex items-center justify-between opacity-80 mb-1">
            <span className="text-[11px] font-bold uppercase">Today Net Profit</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-lg font-extrabold truncate">{formatSAR(todaySummary.netProfit, false)}</p>
          <p className="text-[10px] opacity-80 font-urdu">آج کا خالص منافع</p>
        </div>
      </div>

      {/* Row 2: Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Month Sales (ماہانہ فروخت)</p>
            <h3 className="text-2xl font-black mt-1 text-emerald-400">{formatSAR(monthlySummary.sales)}</h3>
            <p className="text-xs text-slate-400 mt-1">{monthlySummary.orderCount} Orders completed this month</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Month Expenses (ماہانہ اخراجات)</p>
            <h3 className="text-2xl font-black mt-1 text-amber-400">{formatSAR(monthlySummary.expenses)}</h3>
            <p className="text-xs text-slate-400 mt-1">Includes operational bills & staff salaries</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${
          monthlySummary.netProfit >= 0
            ? 'bg-gradient-to-br from-emerald-950 to-emerald-900 text-white border-emerald-700'
            : 'bg-gradient-to-br from-red-950 to-red-900 text-white border-red-700'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Current Month Net Profit (خالص منافع)</p>
            <h3 className="text-2xl font-black mt-1">{formatSAR(monthlySummary.netProfit)}</h3>
            <p className="text-xs opacity-80 mt-1">Formula: Sales - Purchases - Expenses - Wastage - Salaries</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <SystemRestartModal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
      />
    </div>
  );
};
