import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useToast } from './Toast';
import { DataService } from '../../services/storage';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
  ShoppingBag,
  Wallet,
  Receipt,
  Users,
  Package,
} from 'lucide-react';

export interface SystemRestartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SystemRestartModal: React.FC<SystemRestartModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'zero' | 'demo'>('zero');
  const [resetInventoryStock, setResetInventoryStock] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const handleResetToZero = () => {
    setIsProcessing(true);
    try {
      DataService.resetAllDataToZero({ resetInventoryStock });
      toast.success(
        'All sales, orders, expenses, and financials have been reset to 0.00 SAR!',
        'System Reset to 0 (تمام ڈیٹا 0 ہو گیا)'
      );
      if (onSuccess) onSuccess();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error('Error resetting data:', e);
      toast.error('Failed to reset data. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleRestoreDemo = () => {
    setIsProcessing(true);
    try {
      DataService.resetToSampleData();
      toast.success(
        'System restored with sample demo orders and financial records.',
        'Demo Data Restored'
      );
      if (onSuccess) onSuccess();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error('Error restoring demo data:', e);
      toast.error('Failed to restore demo data.');
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Restart & Data Reset / سسٹم ری اسٹارٹ"
      subtitle="Reset all operational figures to 0.00 or restore demo records"
      size="lg"
    >
      <div className="space-y-5">
        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMode('zero')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'zero'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All to 0 (تمام ڈیٹا 0 کریں)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('demo')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'demo'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Restore Demo Data (ڈیمو ڈیٹا)</span>
          </button>
        </div>

        {activeMode === 'zero' ? (
          <div className="space-y-4">
            {/* Warning Alert */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-900">
                  Reset Operational Data to 0.00 (تازہ آغاز / Fresh Live Start)
                </h4>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  یہ بٹن تمام سیلز، آرڈرز، اخراجات، خریداری اور منافع کے ریکارڈز کو **0** کر دے گا۔ آپ کا فوڈ مینو (Dishes) اور برانچز بالکل محفوظ رہیں گی تاکہ آپ فوراً نیا آرڈر درج کر سکیں۔
                </p>
              </div>
            </div>

            {/* Zeroed Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-700">Sales & Orders</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">0.00 SAR</p>
                <p className="text-[10px] text-slate-500">0 Total Orders</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Wallet className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-700">Expenses</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">0.00 SAR</p>
                <p className="text-[10px] text-slate-500">All bills cleared</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-sky-600 mb-1">
                  <Receipt className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-700">Purchases (PO)</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">0.00 SAR</p>
                <p className="text-[10px] text-slate-500">0 Purchase invoices</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-700">Staff Payroll</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">0.00 SAR</p>
                <p className="text-[10px] text-slate-500">Salaries & advances</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-700">Wastage / Loss</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">0.00 SAR</p>
                <p className="text-[10px] text-slate-500">0 Waste logs</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-700 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-700">Menu & Dishes</span>
                </div>
                <p className="text-base font-extrabold text-emerald-600">Preserved</p>
                <p className="text-[10px] text-slate-500">Ready to sell</p>
              </div>
            </div>

            {/* Additional Option: Reset Inventory Stock */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={resetInventoryStock}
                onChange={(e) => setResetInventoryStock(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-600" />
                  Also set inventory stock quantity to 0 (انوینٹری اسٹاک بھی 0 کریں)
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Unchecked keeps current stock numbers; checked sets all stock quantities to 0.
                </p>
              </div>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
                Cancel (منسوخ)
              </Button>
              <Button
                variant="danger"
                icon={RotateCcw}
                onClick={handleResetToZero}
                loading={isProcessing}
                className="shadow-md bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Restart & Set All to 0 (تمام ڈیٹا 0 کریں)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400">
                  Restore Realistic Saudi Demo Records (ڈیمو ڈیٹا کی بحالی)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  یہ آپشن ریاض، جدہ اور دمام کی برانچز کے ساتھ ڈیمو آرڈرز، خریداری اور اخراجات کا مکمل ڈیٹا بیس دوبارہ لوڈ کر دے گا۔
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={RotateCcw}
                onClick={handleRestoreDemo}
                loading={isProcessing}
                className="bg-[#ea6918] hover:bg-[#d45c0f]"
              >
                Restore Demo Data (ڈیمو ڈیٹا بحال کریں)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
