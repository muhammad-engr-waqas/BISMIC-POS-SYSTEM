import React, { useRef, useState } from 'react';
import { Order, BranchSettings } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { BrandLogo } from '../common/BrandLogo';
import { Printer, FileText, CheckCircle } from 'lucide-react';
import { formatSAR, formatDate, formatDateTime, generateZatcaTlvQr } from '../../utils/formatters';

export interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  branchSettings: BranchSettings;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  branchSettings,
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'invoice'>('thermal');
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrData = generateZatcaTlvQr(
    branchSettings.restaurantName || 'Al-Nafoura Restaurant',
    branchSettings.vatNumber || '310234567800003',
    `${order.date}T${order.time}Z`,
    order.grandTotal.toFixed(2),
    order.taxAmount.toFixed(2)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={printFormat === 'thermal' ? '80mm Thermal Receipt Preview' : 'Tax Invoice (ZATCA Format)'}
      subtitle={`Order #${order.orderNumber} • ${order.date} ${order.time}`}
      size={printFormat === 'thermal' ? 'sm' : 'lg'}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => setPrintFormat('thermal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                printFormat === 'thermal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              80mm Thermal
            </button>
            <button
              onClick={() => setPrintFormat('invoice')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                printFormat === 'invoice' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              A4 Tax Invoice
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
              Print Now
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex justify-center bg-slate-100 p-4 rounded-xl border border-slate-200 overflow-x-auto">
        {printFormat === 'thermal' ? (
          /* =======================================================
             80MM THERMAL RECEIPT (Standard POS Receipt)
             ======================================================= */
          <div
            ref={printRef}
            className="w-[320px] bg-white text-slate-950 font-mono text-[11px] p-5 shadow-sm border border-slate-300 rounded-xs select-text print:w-full print:border-0 print:shadow-none print:p-0"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              {/* Brand Logo on Top of Bill */}
              <div className="flex justify-center mb-2">
                <BrandLogo
                  logoUrl={branchSettings.logo}
                  restaurantName={branchSettings.restaurantName}
                  restaurantNameAr={branchSettings.restaurantNameAr}
                  size="receipt"
                  variant="monochrome"
                />
              </div>

              <h2 className="text-sm font-bold tracking-tight uppercase">
                {branchSettings.restaurantName || 'AL-NAFOURA RESTAURANT'}
              </h2>
              <p className="text-xs font-urdu font-bold text-slate-800">
                {branchSettings.restaurantNameAr || 'النافورہ رائل ریستوران'}
              </p>
              <p className="text-[10px] text-slate-600 mt-1">{branchSettings.branchName}</p>
              <p className="text-[10px] font-urdu text-slate-600">{branchSettings.branchNameAr}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{branchSettings.address}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Tel: {branchSettings.phone}</p>
              
              <div className="mt-2 text-[10px] bg-slate-100 py-1 px-2 rounded-xs border border-slate-200">
                <span className="font-bold">SIMPLIFIED TAX INVOICE</span>
                <br />
                <span className="font-urdu text-[10px]">سادہ ٹیکس انوائس (ZATCA)</span>
              </div>
            </div>

            {/* Tax Info & Order Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">VAT Reg / ٹیکس نمبر:</span>
                <span className="font-bold font-mono">{branchSettings.vatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CR / رجسٹریشن نمبر:</span>
                <span className="font-bold font-mono">{branchSettings.crNumber}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-dotted border-slate-300">
                <span className="text-slate-600">Order # / آرڈر نمبر:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date & Time:</span>
                <span>{order.date} {order.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Cashier / کیشئر:</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type / قسم:</span>
                <span className="font-bold uppercase">
                  {order.orderType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                </span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Customer:</span>
                  <span>{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <div className="flex justify-between text-[10px] font-bold pb-1.5 border-b border-slate-300">
                <span className="w-1/2">Item / آئٹم</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/6 text-right">Price</span>
                <span className="w-1/6 text-right">Total</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {order.items.map((item, i) => (
                  <div key={item.id || i} className="text-[10px]">
                    <div className="flex justify-between">
                      <span className="font-semibold w-1/2 leading-tight">{item.name}</span>
                      <span className="w-1/6 text-center">{item.quantity}</span>
                      <span className="w-1/6 text-right">{item.unitPrice.toFixed(2)}</span>
                      <span className="w-1/6 text-right font-bold">{item.totalPrice.toFixed(2)}</span>
                    </div>
                    {item.arabicName && (
                      <div className="text-[9px] font-urdu text-slate-600 pr-2">
                        {item.arabicName}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-[9px] italic text-slate-500 pl-1">
                        * Note: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal / ذیلی میزان:</span>
                <span>{order.subtotal.toFixed(2)} SAR</span>
              </div>

              {(order.discountAmount || 0) > 0 && (
                <div className="flex justify-between font-bold text-slate-900 border-y border-dotted border-slate-400 py-0.5 my-0.5">
                  <span>
                    Discount / رعایت {order.discountType === 'percent' ? `(${order.discountValue}%)` : `(${order.discountAmount.toFixed(2)} SAR)`}:
                  </span>
                  <span>-{(order.discountAmount || 0).toFixed(2)} SAR</span>
                </div>
              )}

              {(order.serviceChargeAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Service / سروس:</span>
                  <span>+{(order.serviceChargeAmount || 0).toFixed(2)} SAR</span>
                </div>
              )}

              <div className="flex justify-between text-slate-700">
                <span>Taxable Amount / قابل ٹیکس رقم:</span>
                <span>{(order.subtotal - (order.discountAmount || 0) + (order.serviceChargeAmount || 0)).toFixed(2)} SAR</span>
              </div>

              <div className="flex justify-between font-semibold">
                <span>VAT ({order.taxRate}%) / ٹیکس:</span>
                <span>{order.taxAmount.toFixed(2)} SAR</span>
              </div>

              <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-slate-300">
                <span>GRAND TOTAL / کل رقم:</span>
                <span>{order.grandTotal.toFixed(2)} SAR</span>
              </div>
              <div className="text-right text-[11px] font-urdu font-bold text-slate-800">
                {order.grandTotal.toFixed(2)} ریال
              </div>
            </div>

            {/* Payment Summary */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Payment Method / ادائیگی:</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount / موصولہ رقم:</span>
                <span>{(order.paidAmount ?? order.grandTotal).toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between">
                <span>Change / بقایا:</span>
                <span>{(order.changeAmount ?? 0).toFixed(2)} SAR</span>
              </div>
            </div>

            {/* ZATCA QR Code Simulation */}
            <div className="text-center py-3">
              <div className="inline-block p-2 bg-white border border-slate-300 rounded-sm">
                {/* SVG ZATCA QR Pattern visual */}
                <div className="w-24 h-24 bg-slate-900 mx-auto p-1.5 flex flex-wrap gap-0.5 justify-center items-center">
                  <div className="w-6 h-6 border-2 border-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white"></div>
                  </div>
                  <div className="w-4 h-6 flex flex-col justify-between">
                    <div className="w-full h-1 bg-white"></div>
                    <div className="w-full h-1 bg-white"></div>
                    <div className="w-full h-1 bg-white"></div>
                  </div>
                  <div className="w-6 h-6 border-2 border-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white"></div>
                  </div>
                  <div className="w-20 h-6 flex items-center justify-center">
                    <div className="text-[7px] text-white tracking-widest font-mono">ZATCA QR</div>
                  </div>
                  <div className="w-6 h-6 border-2 border-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white"></div>
                  </div>
                  <div className="w-12 h-6 flex flex-wrap gap-1">
                    <div className="w-2 h-2 bg-white"></div>
                    <div className="w-2 h-2 bg-white"></div>
                    <div className="w-2 h-2 bg-white"></div>
                    <div className="w-2 h-2 bg-white"></div>
                  </div>
                </div>
              </div>
              <p className="text-[8px] text-slate-500 font-mono mt-1 break-all px-2 line-clamp-1">
                TLV: {qrData.substring(0, 32)}...
              </p>
              <p className="text-[9px] text-slate-600 mt-1 whitespace-pre-line">
                {branchSettings.receiptFooter || 'Prices include 15% VAT\nZATCA E-Invoice Phase 2 Compliant'}
              </p>
              <p className="text-[8px] text-slate-400 mt-1">*** THANK YOU FOR VISITING ***</p>
            </div>
          </div>
        ) : (
          /* =======================================================
             A4 FULL TAX INVOICE FORMAT
             ======================================================= */
          <div
            ref={printRef}
            className="w-full max-w-2xl bg-white p-8 border border-slate-200 text-slate-900 rounded-sm select-text text-xs"
          >
            {/* Header with Bilingual Tax Info */}
            <div className="flex justify-between items-start border-b border-slate-300 pb-4">
              <div className="flex items-start gap-3.5">
                <BrandLogo
                  logoUrl={branchSettings.logo}
                  restaurantName={branchSettings.restaurantName}
                  restaurantNameAr={branchSettings.restaurantNameAr}
                  size="lg"
                  variant="color"
                />
                <div>
                  <h2 className="text-base font-bold text-slate-900">{branchSettings.restaurantName}</h2>
                  <h3 className="text-sm font-urdu font-bold text-slate-700">{branchSettings.restaurantNameAr}</h3>
                  <p className="text-slate-600 text-[11px] mt-0.5">{branchSettings.branchName} • {branchSettings.branchNameAr}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{branchSettings.address}</p>
                  <p className="text-slate-600 text-[10px]">Tel: {branchSettings.phone}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-xs rounded-xs uppercase">
                  SIMPLIFIED TAX INVOICE
                </div>
                <div className="text-slate-600 font-urdu text-xs mt-0.5 font-bold">سادہ ٹیکس انوائس (ZATCA)</div>
                <p className="text-[11px] mt-1">
                  <span className="text-slate-500">Invoice No:</span> <strong className="font-mono">{order.orderNumber}</strong>
                </p>
                <p className="text-[11px]">
                  <span className="text-slate-500">Date & Time:</span> <strong>{order.date} {order.time}</strong>
                </p>
              </div>
            </div>

            {/* VAT & Commercial Details */}
            <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <p className="text-slate-500">VAT Registration No. / ٹیکس رجسٹریشن نمبر:</p>
                <p className="font-bold font-mono text-slate-900">{branchSettings.vatNumber}</p>
                <p className="text-slate-500 mt-1">Commercial Reg. / کمرشل رجسٹریشن نمبر:</p>
                <p className="font-bold font-mono text-slate-900">{branchSettings.crNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Cashier Name / کیشئر کا نام:</p>
                <p className="font-semibold text-slate-900">{order.cashierName}</p>
                <p className="text-slate-500 mt-1">Order Type / آرڈر کی قسم:</p>
                <p className="font-semibold uppercase text-slate-900">
                  {order.orderType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-left border-collapse my-4">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase border-y border-slate-300">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Item Description / آئٹم کی تفصیل</th>
                  <th className="py-2 px-3 text-center">Qty / مقدار</th>
                  <th className="py-2 px-3 text-right">Unit Price / قیمت</th>
                  <th className="py-2 px-3 text-right">Total / کل رقم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {order.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-2 px-3 text-slate-400">{index + 1}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.arabicName && <div className="text-slate-500 font-urdu text-[10px]">{item.arabicName}</div>}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold">{item.quantity}</td>
                    <td className="py-2 px-3 text-right">{item.unitPrice.toFixed(2)} SAR</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{item.totalPrice.toFixed(2)} SAR</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Totals */}
            <div className="flex justify-between items-start pt-4 border-t border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center p-2 rounded-xs">
                  <div className="text-center font-mono text-[7px] leading-tight">
                    ZATCA QR
                    <br />
                    E-INVOICE
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Saudi ZATCA E-Invoicing Phase 2 Compliant</p>
                  <p className="text-[10px] font-urdu text-slate-500">سعودی زکوٰۃ، ٹیکس و کسٹمز اتھارٹی (ZATCA) کے مطابق</p>
                  <p className="text-[10px] font-semibold text-slate-700 mt-1">Payment: {order.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              <div className="w-64 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal / ذیلی میزان:</span>
                  <span>{order.subtotal.toFixed(2)} SAR</span>
                </div>
                {(order.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    <span>
                      Discount / رعایت {order.discountType === 'percent' ? `(${order.discountValue}%)` : `(${order.discountAmount.toFixed(2)} SAR)`}:
                    </span>
                    <span>-{(order.discountAmount || 0).toFixed(2)} SAR</span>
                  </div>
                )}
                {(order.serviceChargeAmount || 0) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Service Charge / سروس چارجز:</span>
                    <span>+{(order.serviceChargeAmount || 0).toFixed(2)} SAR</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({order.taxRate}%) / ٹیکس:</span>
                  <span>{order.taxAmount.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Total / کل رقم:</span>
                  <span>{order.grandTotal.toFixed(2)} SAR</span>
                </div>
                <div className="text-right text-xs font-urdu font-bold text-slate-800">
                  {order.grandTotal.toFixed(2)} ریال
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
