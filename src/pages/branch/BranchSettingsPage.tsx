import React, { useState, useRef } from 'react';
import { User, BranchSettings } from '../../types';
import { DataService } from '../../services/storage';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Building2,
  Receipt,
  Save,
  CheckCircle2,
  QrCode,
  Upload,
  Image as ImageIcon,
  Trash2,
  Printer,
  Eye,
  Sparkles,
} from 'lucide-react';

export interface BranchSettingsPageProps {
  currentUser: User;
}

export const BranchSettingsPage: React.FC<BranchSettingsPageProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<BranchSettings>(() =>
    DataService.getBranchSettings(branchId)
  );

  const [showLiveReceipt, setShowLiveReceipt] = useState(true);

  // File Upload Handler for Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image should be less than 2MB for fast receipt printing');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSettings((prev) => ({ ...prev, logo: base64 }));
      toast.success('Logo uploaded successfully! Preview updated below.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logo: '' }));
    toast.info('Custom logo removed. Default restaurant crest restored.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.updateBranchSettings(branchId, settings);
    toast.success('Branch brand settings, logo, and receipt configuration saved!');
  };

  const handleTestPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================
            1. BRAND IDENTITY & LOGO CONFIGURATION (MAIN REQUEST)
            ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Restaurant Brand Identity & Logo / ریستوران کا لوگو اور برانڈ شناخت
                </h3>
                <p className="text-xs text-slate-500">
                  Manage the official restaurant logo, name, and Urdu branding shown across the POS and on all printed bills
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => setShowLiveReceipt(!showLiveReceipt)}
            >
              {showLiveReceipt ? 'Hide Receipt Preview' : 'Show Receipt Preview'}
            </Button>
          </div>

          {/* Logo Upload & Preview Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Logo Preview Tile */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Active Logo / فعال لوگو
              </span>

              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 mb-3">
                <BrandLogo
                  logoUrl={settings.logo}
                  restaurantName={settings.restaurantName}
                  restaurantNameAr={settings.restaurantNameAr}
                  size="xl"
                  variant="color"
                />
              </div>

              <span className="text-xs font-bold text-slate-800 leading-tight">
                {settings.restaurantName || 'Al-Nafoura Restaurant'}
              </span>
              <span className="text-xs font-urdu font-bold text-slate-600 mt-0.5">
                {settings.restaurantNameAr || 'النافورہ ریستوران'}
              </span>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Logo / لوگو اپلوڈ کریں
                </Button>

                {settings.logo && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={handleRemoveLogo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Supports PNG, JPG, SVG or WebP</p>
            </div>

            {/* Brand Names & Direct URL input */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Restaurant Name (English)"
                  value={settings.restaurantName || ''}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                  placeholder="e.g. Al-Nafoura Royal Restaurant"
                  required
                />
                <Input
                  label="Restaurant Name / ریستوران کا نام (اردو)"
                  value={settings.restaurantNameAr || ''}
                  onChange={(e) => setSettings({ ...settings, restaurantNameAr: e.target.value })}
                  placeholder="مثال: النافورہ رائل ریستوران"
                  className="font-urdu"
                  required
                />
              </div>

              <Input
                label="Direct Logo Image URL (Optional or use Upload button)"
                value={settings.logo || ''}
                onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                placeholder="https://example.com/logo.png or Base64 Data"
              />

              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">بل پر لوگو کی پرنٹنگ (Professional Bill Printing):</span>
                  <span className="text-slate-600 leading-relaxed text-[11px]">
                    آپ کا اپلوڈ کردہ لوگو خودکار طور پر تھرمل رسید پرنٹ (80mm Thermal Receipt) اور A4 مکمل انوائس کے اوپر نمایاں نظر آئے گا، اس کے نیچے ریستوران کا نام اور برانچ کی تفصیلات آئیں گی۔
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. BRANCH PROFILE & REGISTRATION DETAILS
            ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-sky-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Branch Profile & Business Information</h3>
              <p className="text-xs text-slate-500">
                Tax, registration, and location details used on official invoices and receipts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch Name (English)"
              value={settings.branchName}
              onChange={(e) => setSettings({ ...settings, branchName: e.target.value })}
              required
            />
            <Input
              label="Branch Name / برانچ کا نام (اردو)"
              value={settings.branchArabicName || settings.branchNameAr || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  branchArabicName: e.target.value,
                  branchNameAr: e.target.value,
                })
              }
              className="font-urdu"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="VAT / Tax Registration Number (15 Digits)"
              value={settings.vatNumber}
              onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
              required
            />
            <Input
              label="Commercial Registration (CR Number)"
              value={settings.crNumber}
              onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
            />
            <Input
              label="City"
              value={settings.city || 'Riyadh'}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              required
            />
            <Input
              label="District"
              value={settings.district || 'Al Olaya'}
              onChange={(e) => setSettings({ ...settings, district: e.target.value })}
              required
            />
          </div>

          <Input
            label="Street Address / Building"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            required
          />
        </div>

        {/* ========================================================
            3. POS RECEIPT CUSTOMIZATION & MESSAGES
            ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Receipt className="w-5 h-5 text-sky-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Receipt & Printing Configurations</h3>
              <p className="text-xs text-slate-500">Customize thermal printer slip headers and footer messages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Header Greeting (English)"
              value={settings.receiptHeader || ''}
              onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
            />
            <Input
              label="Header Greeting / ہیڈر عبارت (اردو)"
              value={settings.receiptHeaderArabic || ''}
              onChange={(e) => setSettings({ ...settings, receiptHeaderArabic: e.target.value })}
              className="font-urdu"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Footer Note (English)"
              value={settings.receiptFooter || ''}
              onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
            />
            <Input
              label="Footer Note / فوٹر نوٹ (اردو)"
              value={settings.receiptFooterArabic || ''}
              onChange={(e) => setSettings({ ...settings, receiptFooterArabic: e.target.value })}
              className="font-urdu"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Value Added Tax Rate (%)"
              type="number"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
              required
            />
            <Select
              label="Thermal Printer Paper Format"
              options={[
                { value: '80mm', label: '80mm Standard Thermal Receipt (Standard POS)' },
                { value: '58mm', label: '58mm Compact Thermal Slip' },
                { value: 'a4', label: 'A4 Full Tax Invoice' },
              ]}
              value={settings.paperSize || '80mm'}
              onChange={(e) => setSettings({ ...settings, paperSize: e.target.value as any })}
            />
          </div>
        </div>

        {/* ========================================================
            4. ZATCA E-INVOICING PHASE 2 COMPLIANCE
            ======================================================== */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ZATCA Phase 2 E-Invoicing Compliance (FATOORAH)
                </h3>
                <p className="text-xs text-slate-500">
                  Cryptographic stamp identifier, TLV QR encoding, and ZATCA compliance status
                </p>
              </div>
            </div>
            <Badge variant="success" size="md">
              Phase 2 Onboarded
            </Badge>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Simplified Electronic Tax Invoice (سادہ الیکٹرانک ٹیکس انوائس) Active
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              All POS checkout receipts generated at this terminal automatically include standard Base64 TLV
              (Tag-Length-Value) barcodes containing Seller Name, VAT Registration, Timestamp, Total with VAT, and
              VAT Tax Sum in accordance with ZATCA regulations.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            icon={Printer}
            onClick={handleTestPrint}
          >
            Test Print Bill / بل پرنٹ ٹیسٹ
          </Button>

          <Button variant="primary" size="md" icon={Save} type="submit">
            Save Branch Settings / محفوظ کریں
          </Button>
        </div>
      </form>

      {/* ========================================================
          5. LIVE PRINTED RECEIPT / BILL PREVIEW WITH LOGO
          ======================================================== */}
      {showLiveReceipt && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-700" />
                Live Thermal Receipt Preview / پرنٹ شدہ بل کا لائیو پریویو
              </h4>
              <p className="text-xs text-slate-500">
                This demonstrates exactly how your logo, restaurant name, and bill will look when printed
              </p>
            </div>
            <Badge variant="default" size="sm">
              80mm Thermal Receipt
            </Badge>
          </div>

          <div className="flex justify-center bg-slate-100 p-6 rounded-xl overflow-x-auto">
            <div className="w-[300px] bg-white text-slate-950 font-mono text-[11px] p-5 shadow-sm border border-slate-300 rounded-xs select-text">
              {/* Receipt Header with Logo on Top */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <div className="flex justify-center mb-2">
                  <BrandLogo
                    logoUrl={settings.logo}
                    restaurantName={settings.restaurantName}
                    restaurantNameAr={settings.restaurantNameAr}
                    size="receipt"
                    variant="monochrome"
                  />
                </div>

                <h2 className="text-xs font-bold tracking-tight uppercase">
                  {settings.restaurantName || 'AL-NAFOURA RESTAURANT'}
                </h2>
                <p className="text-xs font-urdu font-bold text-slate-800">
                  {settings.restaurantNameAr || 'النافورہ ریستوران'}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">{settings.branchName}</p>
                <p className="text-[10px] font-urdu text-slate-600">{settings.branchArabicName || settings.branchNameAr}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{settings.address}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Tel: {settings.phone}</p>

                <div className="mt-2 text-[9px] bg-slate-100 py-1 px-2 rounded-xs border border-slate-200">
                  <span className="font-bold">SIMPLIFIED TAX INVOICE</span>
                  <br />
                  <span className="font-urdu text-[10px]">سادہ ٹیکس انوائس (ZATCA)</span>
                </div>
              </div>

              {/* Sample Meta */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">VAT Reg / ٹیکس نمبر:</span>
                  <span className="font-bold font-mono">{settings.vatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CR / رجسٹریشن نمبر:</span>
                  <span className="font-bold font-mono">{settings.crNumber}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dotted border-slate-300">
                  <span className="text-slate-600">Order # / آرڈر نمبر:</span>
                  <span className="font-bold">ORD-2026-0089</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cashier / کیشئر:</span>
                  <span>{currentUser.name}</span>
                </div>
              </div>

              {/* Sample Items */}
              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between text-[10px] font-bold pb-1 border-b border-slate-300">
                  <span className="w-1/2">Item / آئٹم</span>
                  <span className="w-1/6 text-center">Qty</span>
                  <span className="w-1/6 text-right">Price</span>
                  <span className="w-1/6 text-right">Total</span>
                </div>
                <div className="space-y-1.5 pt-1.5">
                  <div className="text-[10px]">
                    <div className="flex justify-between">
                      <span className="font-semibold w-1/2 leading-tight">Chicken Biryani</span>
                      <span className="w-1/6 text-center">2</span>
                      <span className="w-1/6 text-right">35.00</span>
                      <span className="w-1/6 text-right font-bold">70.00</span>
                    </div>
                    <div className="text-[9px] font-urdu text-slate-600">چکن بریانی سپیشل</div>
                  </div>
                  <div className="text-[10px]">
                    <div className="flex justify-between">
                      <span className="font-semibold w-1/2 leading-tight">Fresh Mint Lemonade</span>
                      <span className="w-1/6 text-center">2</span>
                      <span className="w-1/6 text-right">12.00</span>
                      <span className="w-1/6 text-right font-bold">24.00</span>
                    </div>
                    <div className="text-[9px] font-urdu text-slate-600">لیموں پانی پودینہ</div>
                  </div>
                </div>
              </div>

              {/* Sample Totals */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal / ذیلی میزان:</span>
                  <span>94.00 SAR</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({settings.taxRate}%) / ٹیکس:</span>
                  <span>14.10 SAR</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-300">
                  <span>GRAND TOTAL / کل رقم:</span>
                  <span>108.10 SAR</span>
                </div>
                <div className="text-right text-[11px] font-urdu font-bold text-slate-800">
                  108.10 ریال
                </div>
              </div>

              {/* Footer */}
              <div className="text-center py-2 text-[9px] text-slate-600">
                <p>{settings.receiptFooter || 'Prices include 15% VAT'}</p>
                <p className="font-urdu mt-0.5">{settings.receiptFooterArabic || 'قیمتوں میں 15 فیصد ٹیکس شامل ہے'}</p>
                <p className="text-[8px] text-slate-400 mt-1">*** THANK YOU FOR VISITING ***</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
