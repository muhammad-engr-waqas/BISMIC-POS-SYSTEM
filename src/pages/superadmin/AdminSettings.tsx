import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { DataService } from '../../services/storage';
import { Save, RotateCcw, AlertTriangle, Sparkles, Trash2 } from 'lucide-react';
import { SystemRestartModal } from '../../components/common/SystemRestartModal';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState(() => DataService.getBranchSettings('branch_riyadh_01'));
  const [showRestartModal, setShowRestartModal] = useState(false);
  const toast = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.saveBranchSettings('branch_riyadh_01', settings);
    toast.success('Enterprise configuration saved successfully!', 'Settings Updated');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card
        title="Enterprise HQ Settings / کمپنی ہیڈکوارٹر سیٹنگز"
        subtitle="Global restaurant branding and ZATCA compliance master settings"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Corporate Entity Name (English)"
              value={settings.restaurantName}
              onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
              required
            />
            <Input
              label="Corporate Entity Name / ریستوران کا نام (اردو)"
              value={settings.restaurantNameAr}
              onChange={(e) => setSettings({ ...settings, restaurantNameAr: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ZATCA Group VAT Number (15 Digits)"
              value={settings.vatNumber}
              onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
              helperText="Must start and end with '3' as per Saudi ZATCA standards"
              required
            />
            <Input
              label="Group Commercial Registration (CR)"
              value={settings.crNumber}
              onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Default VAT Rate (%)"
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Default Currency"
              value={settings.currency}
              disabled
              helperText="Saudi Riyal (SAR / ریال)"
            />
            <Input
              label="Service Charge (%)"
              type="number"
              value={settings.serviceChargeRate}
              onChange={(e) => setSettings({ ...settings, serviceChargeRate: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button variant="primary" type="submit" icon={Save}>
              Save Corporate Settings
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Database Maintenance & System Restart Controls"
        subtitle="Reset simulated LocalStorage dataset to 0.00 SAR or restore sample records"
      >
        <div className="space-y-3">
          {/* Option 1: Restart All Data to 0 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/70 rounded-xl border border-red-200">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-900">Restart System (Set All Data to 0.00 / تمام ڈیٹا 0 کریں)</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Wipes all sales, orders, expenses, purchases, wastage, and payroll to 0 across all branches while preserving your menu dishes and branch logins.
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={RotateCcw}
              onClick={() => setShowRestartModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white shrink-0 font-bold"
            >
              Restart (All Data 0)
            </Button>
          </div>

          {/* Option 2: Restore Demo Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#ea6918] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Restore Authentic Demo Dataset (ڈیمو ڈیٹا بحال کریں)</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Populates the database with realistic sample orders, supplier invoices, bills, and payroll for demonstration.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => setShowRestartModal(true)}
              className="shrink-0 font-medium"
            >
              Manage & Restore
            </Button>
          </div>
        </div>
      </Card>

      <SystemRestartModal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
      />
    </div>
  );
};
