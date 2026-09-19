import React, { useState } from 'react';
import { User } from '../../types';
import { DataService } from '../../services/storage';
import {
  LayoutDashboard,
  GitFork,
  DollarSign,
  FileBarChart,
  Settings,
  LogOut,
  Building2,
  Calendar,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { getCurrentDate } from '../../utils/formatters';

export type AdminTab = 'dashboard' | 'branches' | 'financials' | 'reports' | 'settings';

export interface SuperAdminLayoutProps {
  currentUser: User;
  onLogout: () => void;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  currentUser,
  onLogout,
  activeTab,
  onTabChange,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const toast = useToast();

  const navItems: { id: AdminTab; label: string; arabicLabel: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', arabicLabel: 'ڈیش بورڈ', icon: LayoutDashboard },
    { id: 'branches', label: 'Branches', arabicLabel: 'برانچ مینجمنٹ', icon: GitFork },
    { id: 'financials', label: 'Financial Overview', arabicLabel: 'مالیاتی جائزہ', icon: DollarSign },
    { id: 'reports', label: 'Consolidated Reports', arabicLabel: 'مجموعی رپورٹس', icon: FileBarChart },
    { id: 'settings', label: 'System Settings', arabicLabel: 'سسٹم سیٹنگز', icon: Settings },
  ];

  const handleResetData = () => {
    DataService.resetToSampleData();
    setShowResetConfirm(false);
    toast.success('Database reset to fresh realistic sample data!', 'Reset Completed');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800/60">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/60 bg-slate-950/30">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-black border border-amber-500/30 flex items-center justify-center shrink-0">
            <img src="/bismic-logo.jpg" alt="Bismic Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-white tracking-tight truncate">
              SUPER ADMIN
            </h1>
            <p className="text-[10px] text-slate-500 font-urdu truncate">
              مرکزی ریستوران ایڈمنسٹریشن
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Central Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#ea6918] text-white shadow-sm shadow-[#ea6918]/25'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] font-urdu ${isActive ? 'text-amber-100' : 'text-slate-600'}`}>
                  {item.arabicLabel}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800/60 space-y-1 bg-slate-950/20">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
            title="Reset database to sample data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-black border border-amber-500/30 shrink-0">
            <img src="/bismic-logo.jpg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm">Super Admin Portal</span>
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
        <div className="md:hidden bg-slate-900 border-b border-slate-800/60 p-3 space-y-1 animate-slideDown">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300'
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
          <div className="pt-2 border-t border-slate-800/60 flex justify-between">
            <button
              onClick={() => {
                setShowResetConfirm(true);
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-400 py-1"
            >
              Reset Data
            </button>
            <button onClick={onLogout} className="text-xs text-red-400 py-1 font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/60 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <span>Super Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900 font-semibold capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{getCurrentDate()}</span>
            </div>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/60">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                SA
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">Executive HQ</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset All Sample Data?"
        message="This will reset all branches, menu items, orders, inventory, expenses, and payroll to fresh authentic Saudi restaurant data. Any changes you made during testing will be replaced."
        confirmText="Yes, Reset Data"
      />
    </div>
  );
};
