import React, { useState } from 'react';
import { User, BranchSettings } from '../../types';
import { DataService } from '../../services/storage';
import {
  Store,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Truck,
  Building,
  Wallet,
  Trash2,
  Users,
  Banknote,
  FileBarChart,
  Settings,
  LogOut,
  Calendar,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { getCurrentDate } from '../../utils/formatters';
import { BrandLogo } from '../../components/common/BrandLogo';

export type BranchTab =
  | 'pos'
  | 'orders'
  | 'menu'
  | 'inventory'
  | 'purchases'
  | 'suppliers'
  | 'expenses'
  | 'wastage'
  | 'staff'
  | 'payroll'
  | 'reports'
  | 'settings';

export interface BranchLayoutProps {
  currentUser: User;
  onLogout: () => void;
  activeTab: BranchTab;
  onTabChange: (tab: BranchTab) => void;
  children: React.ReactNode;
  isSuperAdminSession?: boolean;
  onReturnToSuperAdmin?: () => void;
}

export const BranchLayout: React.FC<BranchLayoutProps> = ({
  currentUser,
  onLogout,
  activeTab,
  onTabChange,
  children,
  isSuperAdminSession = false,
  onReturnToSuperAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const branchSettings: BranchSettings = DataService.getBranchSettings(currentUser.branchId || '');
  const branch = DataService.getBranchById(currentUser.branchId || '');

  const navGroups: {
    groupName: string;
    arabicGroup: string;
    items: { id: BranchTab; label: string; arabicLabel: string; icon: any }[];
  }[] = [
    {
      groupName: 'Sales & Front Office',
      arabicGroup: 'سیلز اور پوائنٹ آف سیل',
      items: [
        { id: 'pos', label: 'POS Terminal', arabicLabel: 'پوائنٹ آف سیل', icon: CreditCard },
        { id: 'orders', label: 'Orders & Receipts', arabicLabel: 'آرڈرز اور رسیدیں', icon: ShoppingBag },
        { id: 'menu', label: 'Menu & Items', arabicLabel: 'مینو اور ڈشز', icon: UtensilsCrossed },
      ],
    },
    {
      groupName: 'Inventory & Supply',
      arabicGroup: 'اسٹاک اور سپلائی',
      items: [
        { id: 'inventory', label: 'Stock & Inventory', arabicLabel: 'اسٹاک اور انوینٹری', icon: Package },
        { id: 'purchases', label: 'Purchases (PO)', arabicLabel: 'خریداری کے بلز (PO)', icon: Truck },
        { id: 'suppliers', label: 'Suppliers', arabicLabel: 'سپلائرز لسٹ', icon: Building },
      ],
    },
    {
      groupName: 'Finance & Operations',
      arabicGroup: 'فنانس اور آپریشنز',
      items: [
        { id: 'expenses', label: 'Expenses & Bills', arabicLabel: 'اخراجات اور بلز', icon: Wallet },
        { id: 'wastage', label: 'Wastage & Losses', arabicLabel: 'ضیاع اور نقصان', icon: Trash2 },
      ],
    },
    {
      groupName: 'Human Resources',
      arabicGroup: 'ہیومن ریسورس (HR)',
      items: [
        { id: 'staff', label: 'Staff Directory', arabicLabel: 'اسٹاف لسٹ', icon: Users },
        { id: 'payroll', label: 'Monthly Payroll', arabicLabel: 'ماہانہ تنخواہیں', icon: Banknote },
      ],
    },
    {
      groupName: 'Intelligence & Config',
      arabicGroup: 'رپورٹس اور سیٹنگز',
      items: [
        { id: 'reports', label: 'Branch Reports', arabicLabel: 'مالیاتی رپورٹس', icon: FileBarChart },
        { id: 'settings', label: 'Branch Settings', arabicLabel: 'برانچ سیٹنگز', icon: Settings },
      ],
    },
  ];

  const currentTabInfo = navGroups
    .flatMap((g) => g.items)
    .find((i) => i.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800/60">
        {/* Branch Identity Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800/60 bg-slate-950/30">
          <BrandLogo
            logoUrl={branchSettings.logo}
            restaurantName={branchSettings.restaurantName || branch?.name}
            restaurantNameAr={branchSettings.restaurantNameAr || branch?.arabicName}
            size="sm"
            variant="dark"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xs font-bold text-white tracking-tight truncate leading-tight">
              {branch?.name || branchSettings.branchName || 'Branch Portal'}
            </h1>
            <p className="text-[10px] text-slate-500 font-urdu truncate">
              {branch?.arabicName || branchSettings.branchNameAr || 'برانچ پورٹل'}
            </p>
          </div>
        </div>

        {/* If Super Admin is inspecting this branch */}
        {isSuperAdminSession && onReturnToSuperAdmin && (
          <div className="p-2.5 bg-sky-950/40 border-b border-sky-800/30">
            <button
              onClick={onReturnToSuperAdmin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-sky-200" />
              <span>← Return to Admin Panel</span>
            </button>
            <p className="text-[10px] text-sky-300/70 text-center mt-1 font-urdu">
              سپر ایڈمن پینل پر واپس جائیں
            </p>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-0.5">
              <div className="px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                {group.groupName}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#ea6918] text-white shadow-sm shadow-[#ea6918]/25'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-urdu ${isActive ? 'text-amber-100' : 'text-slate-600'}`}>
                      {item.arabicLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Branch User & Signout */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/20">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1.5 rounded-xl bg-slate-800/40 text-xs">
            <div className="min-w-0">
              <p className="text-white font-bold truncate leading-none text-[11px]">{currentUser.name}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Cashier / Staff</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400/70 shrink-0" />
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Branch</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-3.5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <BrandLogo
            logoUrl={branchSettings.logo}
            restaurantName={branchSettings.restaurantName || branch?.name}
            restaurantNameAr={branchSettings.restaurantNameAr || branch?.arabicName}
            size="xs"
            variant="dark"
          />
          <div className="min-w-0">
            <span className="font-bold text-xs truncate block">{branch?.name || 'Branch POS'}</span>
            <span className="text-[10px] text-slate-500 font-urdu truncate block">{branch?.arabicName}</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-300 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800/60 p-3 space-y-3 max-h-[75vh] overflow-y-auto animate-slideDown">
          {isSuperAdminSession && onReturnToSuperAdmin && (
            <div className="pb-2 border-b border-slate-800/60">
              <button
                onClick={() => {
                  onReturnToSuperAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#ea6918] hover:bg-[#d45c0f] shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>← Return to Admin Panel</span>
              </button>
            </div>
          )}

          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-0.5">
              <div className="px-2 text-[9px] font-bold uppercase text-slate-600">{group.groupName}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive ? 'bg-[#ea6918] text-white shadow-sm' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-urdu">{item.arabicLabel}</span>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="pt-2 border-t border-slate-800/60 flex justify-between">
            <span className="text-xs text-slate-500">{currentUser.name}</span>
            <button onClick={onLogout} className="text-xs text-red-400 font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header bar */}
        <header className="h-14 bg-white border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {branch?.name}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {currentTabInfo?.label} <span className="font-urdu font-normal text-slate-400">({currentTabInfo?.arabicLabel})</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{getCurrentDate()}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200/60">
              <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className={`flex-1 ${activeTab === 'pos' ? 'p-2 sm:p-4 overflow-hidden' : 'p-4 sm:p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
