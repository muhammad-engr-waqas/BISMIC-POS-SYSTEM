import React, { useState, useEffect } from 'react';
import { User } from './types';
import { DataService } from './services/storage';
import { ToastProvider, useToast } from './components/common/Toast';
import { LoginPage } from './pages/auth/LoginPage';

// Super Admin Components
import { SuperAdminLayout, AdminTab } from './pages/superadmin/SuperAdminLayout';
import { AdminDashboard } from './pages/superadmin/AdminDashboard';
import { BranchManagement } from './pages/superadmin/BranchManagement';
import { BranchFinancials } from './pages/superadmin/BranchFinancials';
import { AdminReports } from './pages/superadmin/AdminReports';
import { AdminSettings } from './pages/superadmin/AdminSettings';

// Branch Components
import { BranchLayout, BranchTab } from './pages/branch/BranchLayout';
import { PosScreen } from './pages/branch/PosScreen';
import { OrdersPage } from './pages/branch/OrdersPage';
import { MenuManagementPage } from './pages/branch/MenuManagementPage';
import { InventoryPage } from './pages/branch/InventoryPage';
import { PurchasesPage } from './pages/branch/PurchasesPage';
import { SuppliersPage } from './pages/branch/SuppliersPage';
import { ExpensesPage } from './pages/branch/ExpensesPage';
import { WastagePage } from './pages/branch/WastagePage';
import { StaffPage } from './pages/branch/StaffPage';
import { PayrollPage } from './pages/branch/PayrollPage';
import { BranchReportsPage } from './pages/branch/BranchReportsPage';
import { BranchSettingsPage } from './pages/branch/BranchSettingsPage';

// Quick Switcher Icons
import { Store, ShieldCheck, UserCheck, ArrowRightLeft, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => DataService.getCurrentUser());
  const [superAdminSession, setSuperAdminSession] = useState<User | null>(() => {
    const current = DataService.getCurrentUser();
    return current?.role === 'admin' ? current : null;
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [branchTab, setBranchTab] = useState<BranchTab>('pos');
  const toast = useToast();

  const branches = DataService.getBranches();
  const users = DataService.getUsers();

  // If not logged in, show Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setSuperAdminSession(user);
            setAdminTab('dashboard');
          } else {
            // Manual direct login to a branch: strictly lock to this branch only
            setSuperAdminSession(null);
            setBranchTab('pos');
          }
        }}
      />
    );
  }

  const handleLogout = () => {
    DataService.logout();
    setCurrentUser(null);
    setSuperAdminSession(null);
    toast.info('You have been logged out safely.');
  };

  const handleReturnToAdmin = () => {
    if (superAdminSession) {
      setCurrentUser(superAdminSession);
      DataService.setCurrentUser(superAdminSession);
      setAdminTab('branches');
      toast.success('Returned to Super Admin Portal / سپر ایڈمن پورٹل پر واپسی');
    }
  };

  const handleAdminSwitchBranch = (branchId: string) => {
    const branchUser = users.find((u) => u.branchId === branchId);
    if (branchUser) {
      setCurrentUser(branchUser);
      setBranchTab('pos');
      toast.info(`Switched to: ${branchUser.name}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* 
        SUPER ADMIN SWITCH BAR:
        Visible ONLY if the session originated from a Super Admin login.
        If a branch was manually logged into, this bar is NEVER rendered.
      */}
      {superAdminSession && (
        <header className="bg-slate-950 text-white px-4 py-1.5 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs select-none z-30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ea6918]" />
            <span className="font-bold text-slate-200">
              {currentUser.role === 'admin' ? 'Super Admin Control' : 'Branch Preview Mode'}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Active: <strong className="text-white font-medium">{currentUser.name}</strong>
              {currentUser.branchId ? ` (${branches.find((b) => b.id === currentUser.branchId)?.name})` : ' (HQ)'}
            </span>
          </div>

          {/* Switchers available ONLY to Super Admin */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-[#ea6918]" />
              Switch:
            </span>

            {/* Back to Super Admin Button */}
            {currentUser.role !== 'admin' && (
              <button
                onClick={handleReturnToAdmin}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#ea6918] hover:bg-[#d45c0f] text-white shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1 mr-1"
              >
                <span>← Return to Admin</span>
              </button>
            )}

            {/* Branch Buttons */}
            {branches.map((b) => {
              const branchUser = users.find((u) => u.branchId === b.id);
              const isCurrent = currentUser.branchId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => branchUser && handleAdminSwitchBranch(b.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#ea6918] text-white shadow-sm'
                      : 'bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {b.name.split(' ')[0]}
                </button>
              );
            })}

            {/* Admin button if currently in admin mode */}
            {currentUser.role === 'admin' && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#ea6918] text-white">
                Admin HQ
              </span>
            )}
          </div>
        </header>
      )}

      {/* RENDER SUPER ADMIN OR BRANCH PORTAL */}
      <div className="flex-1 flex flex-col">
        {currentUser.role === 'admin' ? (
          <SuperAdminLayout
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTab={adminTab}
            onTabChange={setAdminTab}
          >
            {adminTab === 'dashboard' && (
              <AdminDashboard
                onNavigateToBranches={() => setAdminTab('branches')}
                onNavigateToFinancials={() => setAdminTab('financials')}
              />
            )}
            {adminTab === 'branches' && (
              <BranchManagement
                onSwitchToBranchView={(branchId: string) => {
                  handleAdminSwitchBranch(branchId);
                }}
              />
            )}
            {adminTab === 'financials' && <BranchFinancials />}
            {adminTab === 'reports' && <AdminReports />}
            {adminTab === 'settings' && <AdminSettings />}
          </SuperAdminLayout>
        ) : (
          <BranchLayout
            currentUser={currentUser}
            onLogout={handleLogout}
            activeTab={branchTab}
            onTabChange={setBranchTab}
            isSuperAdminSession={Boolean(superAdminSession)}
            onReturnToSuperAdmin={superAdminSession ? handleReturnToAdmin : undefined}
          >
            {branchTab === 'pos' && <PosScreen currentUser={currentUser} />}
            {branchTab === 'orders' && <OrdersPage currentUser={currentUser} />}
            {branchTab === 'menu' && <MenuManagementPage currentUser={currentUser} />}
            {branchTab === 'inventory' && <InventoryPage currentUser={currentUser} />}
            {branchTab === 'purchases' && <PurchasesPage currentUser={currentUser} />}
            {branchTab === 'suppliers' && <SuppliersPage />}
            {branchTab === 'expenses' && <ExpensesPage currentUser={currentUser} />}
            {branchTab === 'wastage' && <WastagePage currentUser={currentUser} />}
            {branchTab === 'staff' && <StaffPage currentUser={currentUser} />}
            {branchTab === 'payroll' && <PayrollPage currentUser={currentUser} />}
            {branchTab === 'reports' && <BranchReportsPage currentUser={currentUser} />}
            {branchTab === 'settings' && <BranchSettingsPage currentUser={currentUser} />}
          </BranchLayout>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
