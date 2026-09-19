import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { DataService } from '../../services/storage';
import { Building2, Save, ShieldCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState(() => DataService.getBranchSettings('branch_riyadh_01'));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const toast = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.saveBranchSettings('branch_riyadh_01', settings);
    // Also propagate company settings
    toast.success('Enterprise configuration saved successfully!', 'Settings Updated');
  };

  const handleResetData = () => {
    DataService.resetToSampleData();
    setShowResetConfirm(false);
    toast.success('All branch records and sample data reset to defaults.');
    window.location.reload();
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
        title="Database Maintenance & Demo Controls"
        subtitle="Reset simulated LocalStorage dataset to fresh authentic Saudi branch data"
      >
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Reset System Database</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Restores all 3 branches (Riyadh, Jeddah, Dammam), orders, inventory items, suppliers, expenses, and staff records to original state.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" icon={RotateCcw} onClick={() => setShowResetConfirm(true)}>
            Reset Database
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset Entire Database?"
        message="This will wipe all active local testing state and re-seed the standard multi-branch Saudi restaurant data. Are you sure?"
        confirmText="Reset Now"
      />
    </div>
  );
};
