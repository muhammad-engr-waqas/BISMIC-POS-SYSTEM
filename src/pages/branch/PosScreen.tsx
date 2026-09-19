import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, OrderType, PaymentMethod, User, Order } from '../../types';
import { DataService } from '../../services/storage';
import { calculateOrderTotals } from '../../utils/calculations';
import { formatSAR, getCurrentDate, getCurrentTime } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchInput } from '../../components/common/SearchInput';
import { ThermalReceiptModal } from '../../components/receipt/ThermalReceiptModal';
import { useToast } from '../../components/common/Toast';
import {
  Plus,
  Minus,
  Trash2,
  Utensils,
  ShoppingBag,
  Bike,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Tag,
  Percent,
  MessageSquare,
  X,
  PauseCircle,
  Receipt,
} from 'lucide-react';

export interface PosScreenProps {
  currentUser: User;
}

export const PosScreen: React.FC<PosScreenProps> = ({ currentUser }) => {
  const branchId = currentUser.branchId || 'branch_riyadh_01';
  const branchSettings = DataService.getBranchSettings(branchId);
  const toast = useToast();

  // Menu State
  const menuItems = useMemo(() => DataService.getMenuItems(branchId), [branchId]);
  const categories = useMemo(() => DataService.getCategories(branchId), [branchId]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mobilePosView, setMobilePosView] = useState<'menu' | 'cart'>('menu');

  // Discount & Service Charge (Default to Fixed SAR manual entry)
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountInputStr, setDiscountInputStr] = useState<string>('');
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(0);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [itemNoteModal, setItemNoteModal] = useState<{ isOpen: boolean; itemId: string; note: string }>({
    isOpen: false,
    itemId: '',
    note: '',
  });

  // Parse discountValue in real-time
  const discountValue = useMemo(() => {
    const val = parseFloat(discountInputStr);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [discountInputStr]);

  // Real-time discount change handler
  const handleDiscountChange = (val: string, type?: 'fixed' | 'percent') => {
    const activeType = type || discountType;
    if (type && type !== discountType) {
      setDiscountType(type);
    }
    setDiscountInputStr(val);

    // If checkout modal is open, sync the paidAmount in real-time
    const numeric = parseFloat(val);
    const validVal = isNaN(numeric) || numeric < 0 ? 0 : numeric;
    const recalc = calculateOrderTotals(
      cartItems,
      activeType,
      validVal,
      'percent',
      serviceChargeRate,
      branchSettings.taxRate || 15
    );
    if (isCheckoutOpen) {
      setPaidAmount(recalc.grandTotal.toFixed(2));
    }
  };

  // Checkout & Payment State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mada');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Completed Order for Receipt
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory || item.categoryId === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.arabicName && item.arabicName.includes(searchQuery)) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Calculations
  const calculations = useMemo(() => {
    return calculateOrderTotals(
      cartItems,
      discountType,
      discountValue,
      'percent',
      serviceChargeRate,
      branchSettings.taxRate || 15
    );
  }, [cartItems, discountType, discountValue, branchSettings.taxRate, serviceChargeRate]);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.info(`"${item.name}" is currently marked out of stock.`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItemId === item.id
            ? {
                ...ci,
                quantity: ci.quantity + 1,
                totalPrice: (ci.quantity + 1) * ci.unitPrice,
              }
            : ci
        );
      } else {
        const newItem: OrderItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: item.id,
          name: item.name,
          arabicName: item.arabicName,
          quantity: 1,
          unitPrice: item.price,
          totalPrice: item.price,
          costPrice: item.costPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.id === itemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...ci,
              quantity: newQty,
              totalPrice: newQty * ci.unitPrice,
            };
          }
          return ci;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscountInputStr('');
    setCustomerName('');
    setCustomerPhone('');
  };

  const handleSaveItemNote = () => {
    setCartItems((prev) =>
      prev.map((ci) => (ci.id === itemNoteModal.itemId ? { ...ci, notes: itemNoteModal.note } : ci))
    );
    setItemNoteModal({ isOpen: false, itemId: '', note: '' });
  };

  // Checkout Handlers
  const handleOpenCheckout = () => {
    if (cartItems.length === 0) {
      toast.info('Please add items to cart before proceeding to checkout.');
      return;
    }
    setPaidAmount(calculations.grandTotal.toFixed(2));
    setIsCheckoutOpen(true);
  };

  const handleQuickCash = (amount: number) => {
    setPaidAmount(amount.toFixed(2));
  };

  const handleCompleteOrder = () => {
    const tendered = parseFloat(paidAmount) || calculations.grandTotal;
    if (paymentMethod === 'cash' && tendered < calculations.grandTotal) {
      toast.error('Tendered cash is less than total amount due.');
      return;
    }

    setIsProcessing(true);

    const change = Math.max(0, tendered - calculations.grandTotal);

    const newOrder = DataService.createOrder({
      branchId,
      items: cartItems,
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      subtotal: calculations.subtotal,
      discountType,
      discountValue,
      discountAmount: calculations.discountAmount,
      serviceChargeType: 'percent',
      serviceChargeValue: serviceChargeRate,
      serviceChargeAmount: calculations.serviceChargeAmount,
      taxRate: branchSettings.taxRate || 15,
      taxAmount: calculations.taxAmount,
      grandTotal: calculations.grandTotal,
      paymentMethod,
      paidAmount: tendered,
      changeAmount: change,
      status: 'completed',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      date: getCurrentDate(),
      time: getCurrentTime(),
    });

    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setCompletedOrder(newOrder);
    setIsReceiptOpen(true);
    handleClearCart();
    toast.success(`Order #${newOrder.orderNumber} successfully created & recorded!`, 'Order Completed');
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4.5rem)] gap-3">
      {/* Mobile Top View Switcher */}
      <div className="lg:hidden flex items-center bg-slate-200/80 p-1 rounded-2xl shrink-0">
        <button
          type="button"
          onClick={() => setMobilePosView('menu')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mobilePosView === 'menu'
              ? 'bg-white text-[#ea6918] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Menu Dishes ({filteredMenuItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobilePosView('cart')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            mobilePosView === 'cart'
              ? 'bg-white text-[#ea6918] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order Cart</span>
          {totalItemCount > 0 && (
            <span className="bg-[#ea6918] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {totalItemCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          LEFT: MENU SELECTION AREA (Responsive Food Grid)
          ======================================================== */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden ${mobilePosView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        {/* Top Filter & Search */}
        <div className="p-3 border-b border-slate-200/80 space-y-2.5 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search items, biryani, karahi, shawarma, Urdu name / نام سے تلاش کریں..."
              className="max-w-md w-full"
            />
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline whitespace-nowrap">
              {filteredMenuItems.length} items available
            </span>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300'
              }`}
            >
              All Items (تمام ڈشز)
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-urdu ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                    {cat.arabicName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredMenuItems.map((item) => {
            const inCart = cartItems.find((ci) => ci.menuItemId === item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleAddToCart(item)}
                className={`relative group bg-white border rounded-xl p-2.5 flex flex-col justify-between transition-all cursor-pointer select-none hover:shadow-md hover:border-amber-400 ${
                  inCart ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-50/20' : 'border-slate-200'
                } ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}
              >
                {/* Item Thumbnail Image */}
                <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  {inCart && (
                    <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                      {inCart.quantity}
                    </div>
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate group-hover:text-amber-700">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-urdu font-medium text-slate-500 truncate mt-0.5">
                    {item.arabicName}
                  </p>
                </div>

                {/* Price & Add Indicator */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                  <span className="text-xs font-extrabold text-slate-900">
                    {item.price.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">SAR</span>
                  </span>
                  <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Quick Floating Cart Bar */}
        {totalItemCount > 0 && mobilePosView === 'menu' && (
          <div className="lg:hidden p-3 pt-0 shrink-0">
            <button
              type="button"
              onClick={() => setMobilePosView('cart')}
              className="w-full bg-[#ea6918] hover:bg-[#d45c0f] text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-[#ea6918]/25 flex items-center justify-between text-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="bg-black/25 w-6 h-6 rounded-lg flex items-center justify-center font-bold">
                  {totalItemCount}
                </span>
                <span>View Order Cart</span>
              </div>
              <span className="bg-black/25 px-2.5 py-1 rounded-xl font-mono text-xs font-bold">
                {calculations.grandTotal.toFixed(2)} SAR →
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          RIGHT: CART / ORDER SIDEBAR
          ======================================================== */}
      <div className={`w-full lg:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden shrink-0 ${mobilePosView === 'menu' ? 'hidden lg:flex' : 'flex'}`}>
        {/* Mobile Back Button in Cart */}
        <div className="lg:hidden px-3.5 py-2.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setMobilePosView('menu')}
            className="text-xs font-bold text-[#ea6918] hover:text-[#d45c0f] flex items-center gap-1 cursor-pointer"
          >
            <span>← Back to Dishes</span>
          </button>
          <span className="text-[11px] text-slate-400 font-medium font-mono">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Order Type Tabs */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-lg">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                orderType === 'dine_in' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dine-In</span>
            </button>

            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                orderType === 'takeaway' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>

            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                orderType === 'delivery' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>

          {/* Table / Customer Details Row */}
          <div className="flex items-center justify-between gap-2 mt-2">
            {orderType === 'dine_in' ? (
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
              >
                {Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`).map((tbl) => (
                  <option key={tbl} value={tbl}>
                    {tbl} (میز {tbl.replace('Table ', '')})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Customer Name / نام یا موبائل"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
              />
            )}

            <button
              onClick={handleClearCart}
              disabled={cartItems.length === 0}
              className="text-slate-400 hover:text-red-600 p-1 rounded-md text-xs transition-colors cursor-pointer disabled:opacity-30"
              title="Clear Cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 p-2.5 overflow-y-auto space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Cart is Empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click any menu item to add to ticket</p>
            </div>
          ) : (
            cartItems.map((ci) => (
              <div
                key={ci.id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <h5 className="text-xs font-bold text-slate-900 leading-tight truncate">{ci.name}</h5>
                    <p className="text-[10px] font-urdu text-slate-500 truncate">{ci.arabicName}</p>
                    {ci.notes && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                        Note: {ci.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 whitespace-nowrap">
                    {ci.totalPrice.toFixed(2)} <span className="text-[9px] font-normal text-slate-500">SAR</span>
                  </span>
                </div>

                {/* Quantity Controls & Note Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <button
                    onClick={() => setItemNoteModal({ isOpen: true, itemId: ci.id, note: ci.notes || '' })}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{ci.notes ? 'Edit Note' : 'Add Note'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
                    <button
                      onClick={() => handleUpdateQuantity(ci.id, -1)}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1.5 text-slate-900">{ci.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(ci.id, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Real-Time Breakdown */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-200/80 space-y-2.5 text-xs">
          {/* Subtotal */}
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}):</span>
            <span className="font-bold font-mono text-slate-900">{calculations.subtotal.toFixed(2)} SAR</span>
          </div>

          {/* REAL-TIME MANUAL DISCOUNT BOX */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#ea6918]/10 flex items-center justify-center text-[#ea6918]">
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-800 text-xs">Discount / رعایت</span>
              </div>

              {/* Unit Toggle: SAR vs % */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-medium border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleDiscountChange(discountInputStr, 'fixed')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    discountType === 'fixed'
                      ? 'bg-white text-[#ea6918] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Direct Discount in Saudi Riyals (SAR)"
                >
                  SAR
                </button>
                <button
                  type="button"
                  onClick={() => handleDiscountChange(discountInputStr, 'percent')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    discountType === 'percent'
                      ? 'bg-white text-[#ea6918] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Discount in Percentage (%)"
                >
                  %
                </button>
              </div>
            </div>

            {/* Direct Input Field with Instant Real-Time Calculation */}
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold font-mono text-slate-400 select-none">
                {discountType === 'fixed' ? 'SAR' : '%'}
              </span>
              <input
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : calculations.subtotal}
                step="any"
                value={discountInputStr}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder={
                  discountType === 'fixed'
                    ? 'Enter amount in SAR...'
                    : 'Enter percentage %...'
                }
                className="w-full text-xs font-bold font-mono pl-12 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#ea6918]/20 focus:border-[#ea6918] text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all"
              />
              {discountInputStr && (
                <button
                  type="button"
                  onClick={() => handleDiscountChange('')}
                  className="absolute right-2 text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                  title="Clear discount"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick SAR / % Preset Badges & Real-time Savings */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(discountType === 'fixed' ? [5, 10, 20, 50] : [5, 10, 15, 20]).map((amt) => {
                  const isSelected = discountInputStr === amt.toString();
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleDiscountChange(amt.toString())}
                      className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[10px] ${
                        isSelected
                          ? 'bg-[#ea6918] text-white shadow-xs font-bold'
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {discountType === 'fixed' ? `${amt} SAR` : `${amt}%`}
                    </button>
                  );
                })}
              </div>
              {calculations.discountAmount > 0 && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 font-mono">
                  <span>-{calculations.discountAmount.toFixed(2)} SAR</span>
                </div>
              )}
            </div>
          </div>

          {/* Discount Line in Summary */}
          {calculations.discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Discount ({discountType === 'percent' ? `${discountValue}%` : 'Fixed'}):</span>
              </span>
              <span className="font-bold font-mono">-{calculations.discountAmount.toFixed(2)} SAR</span>
            </div>
          )}

          {/* Taxable Base (Net) */}
          {calculations.discountAmount > 0 && (
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Taxable Amount:</span>
              <span className="font-mono">
                {(calculations.subtotal - calculations.discountAmount).toFixed(2)} SAR
              </span>
            </div>
          )}

          {/* VAT */}
          <div className="flex justify-between text-slate-600">
            <span>VAT ({branchSettings.taxRate || 15}%):</span>
            <span className="font-semibold text-slate-800 font-mono">
              {calculations.taxAmount.toFixed(2)} SAR
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>Grand Total:</span>
            <span className="text-xl text-[#ea6918] font-mono font-black">
              {calculations.grandTotal.toFixed(2)}{' '}
              <span className="text-xs font-sans font-bold text-slate-500">SAR</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenCheckout}
              disabled={cartItems.length === 0}
              className="w-full bg-[#ea6918] hover:bg-[#d45c0f] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-[#ea6918]/20 flex items-center justify-between text-sm transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                <span className="tracking-wide">Complete Order & Payment</span>
              </div>
              <span className="bg-black/20 px-3 py-1 rounded-xl text-xs font-mono font-bold">
                {calculations.grandTotal.toFixed(2)} SAR
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          CHECKOUT / PAYMENT MODAL
          ======================================================== */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Complete Order & Payment"
        subtitle={`Total Due: ${formatSAR(calculations.grandTotal)}`}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full pt-1">
            <Button
              variant="outline"
              onClick={() => setIsCheckoutOpen(false)}
              className="rounded-xl px-5 text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="bg-[#ea6918] hover:bg-[#d45c0f] text-white font-bold rounded-xl px-6 shadow-md shadow-[#ea6918]/20 cursor-pointer"
              onClick={handleCompleteOrder}
              isLoading={isProcessing}
            >
              Confirm & Issue Invoice
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Order Summary & Real-Time Discount Widget */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#ea6918]/10 flex items-center justify-center text-[#ea6918]">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Order Summary</span>
              </div>
              <span className="font-mono text-slate-500 font-medium">Subtotal: {calculations.subtotal.toFixed(2)} SAR</span>
            </div>

            {/* Quick in-modal discount edit */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs font-bold font-mono text-slate-400 select-none">
                  {discountType === 'fixed' ? 'SAR' : '%'}
                </span>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percent' ? 100 : calculations.subtotal}
                  step="any"
                  value={discountInputStr}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  placeholder={discountType === 'fixed' ? 'Discount in SAR...' : 'Discount %...'}
                  className="w-full text-xs font-bold font-mono pl-11 pr-9 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ea6918]/20 focus:border-[#ea6918] text-slate-900 transition-all"
                />
                {discountInputStr && (
                  <button
                    type="button"
                    onClick={() => handleDiscountChange('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-red-600 p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => handleDiscountChange(discountInputStr, 'fixed')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    discountType === 'fixed'
                      ? 'bg-[#ea6918] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SAR
                </button>
                <button
                  type="button"
                  onClick={() => handleDiscountChange(discountInputStr, 'percent')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    discountType === 'percent'
                      ? 'bg-[#ea6918] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  %
                </button>
              </div>
            </div>

            {calculations.discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-semibold pt-0.5">
                <span>Discount Applied:</span>
                <span className="font-bold font-mono">-{calculations.discountAmount.toFixed(2)} SAR</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2.5 border-t border-slate-200/80">
              <span className="font-medium text-slate-500">
                VAT ({branchSettings.taxRate || 15}%): <strong className="font-mono text-slate-800">{calculations.taxAmount.toFixed(2)} SAR</strong>
              </span>
              <div className="text-right">
                <span className="text-xs text-slate-500 mr-2">Total Due:</span>
                <span className="text-xl text-[#ea6918] font-mono font-black">
                  {calculations.grandTotal.toFixed(2)} SAR
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Select Payment Method / طریقہ ادائیگی
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('mada')}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'mada'
                    ? 'bg-[#ea6918]/10 border-[#ea6918] text-[#ea6918] ring-2 ring-[#ea6918]/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'mada' ? 'bg-[#ea6918] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">Mada Card</span>
                <span className="text-[10px] text-slate-400 font-normal">Saudi Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'bg-[#ea6918]/10 border-[#ea6918] text-[#ea6918] ring-2 ring-[#ea6918]/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-[#ea6918] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">Credit Card</span>
                <span className="text-[10px] text-slate-400 font-normal">Visa / MC</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'cash'
                    ? 'bg-[#ea6918]/10 border-[#ea6918] text-[#ea6918] ring-2 ring-[#ea6918]/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-[#ea6918] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">Cash</span>
                <span className="text-[10px] text-slate-400 font-normal">نقد</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'online'
                    ? 'bg-[#ea6918]/10 border-[#ea6918] text-[#ea6918] ring-2 ring-[#ea6918]/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'online' ? 'bg-[#ea6918] text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs">Digital Wallet</span>
                <span className="text-[10px] text-slate-400 font-normal">Apple / STC</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered & Quick Buttons */}
          {paymentMethod === 'cash' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Amount Received / نقد وصولی
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold font-mono text-slate-400">SAR</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    autoFocus
                    placeholder="Enter received amount..."
                    className="w-full text-base font-bold font-mono pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ea6918]/20 focus:border-[#ea6918] text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Tender:</span>
                {[
                  calculations.grandTotal,
                  Math.ceil(calculations.grandTotal / 10) * 10,
                  Math.ceil(calculations.grandTotal / 50) * 50,
                  Math.ceil(calculations.grandTotal / 100) * 100,
                  200,
                  500,
                ]
                  .filter((v, i, a) => a.indexOf(v) === i && v >= calculations.grandTotal)
                  .map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickCash(amount)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                        parseFloat(paidAmount) === amount
                          ? 'bg-[#ea6918] text-white shadow-xs'
                          : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {amount.toFixed(0)} SAR
                    </button>
                  ))}
              </div>

              {parseFloat(paidAmount) >= calculations.grandTotal && (
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-emerald-900 animate-fadeIn">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Change Due (بقایا رقم):</span>
                  </span>
                  <span className="font-mono font-black text-lg text-emerald-700">
                    {(parseFloat(paidAmount) - calculations.grandTotal).toFixed(2)} SAR
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================
          DISCOUNT MODAL (Custom Real-Time Input)
          ======================================================== */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Apply Order Discount / رعایت درج کریں"
        subtitle="Manual discount amount will update the invoice totals in real-time"
        size="sm"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button
              variant="outline"
              onClick={() => {
                handleDiscountChange('');
                setIsDiscountModalOpen(false);
              }}
            >
              Clear Discount
            </Button>
            <Button
              variant="primary"
              className="bg-[#ea6918] hover:bg-[#d45c0f] text-white font-bold rounded-xl shadow-md cursor-pointer"
              onClick={() => setIsDiscountModalOpen(false)}
            >
              Apply & Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleDiscountChange(discountInputStr, 'fixed')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                discountType === 'fixed' ? 'bg-white text-[#ea6918] shadow-xs' : 'text-slate-600'
              }`}
            >
              Fixed SAR
            </button>
            <button
              type="button"
              onClick={() => handleDiscountChange(discountInputStr, 'percent')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                discountType === 'percent' ? 'bg-white text-[#ea6918] shadow-xs' : 'text-slate-600'
              }`}
            >
              Percentage (%)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {discountType === 'fixed' ? 'Discount Amount (SAR):' : 'Discount Percentage (%):'}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[#ea6918] font-bold text-xs font-mono">
                {discountType === 'fixed' ? 'SAR' : '%'}
              </span>
              <input
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : calculations.subtotal}
                step="any"
                value={discountInputStr}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder={discountType === 'fixed' ? 'e.g. 15' : 'e.g. 10'}
                className="w-full text-base font-bold font-mono pl-12 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#ea6918]/20 focus:border-[#ea6918] text-slate-900 transition-all"
                autoFocus
              />
              {discountInputStr && (
                <button
                  type="button"
                  onClick={() => handleDiscountChange('')}
                  className="absolute right-2 text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 font-medium mr-1">Quick:</span>
            {(discountType === 'fixed' ? [5, 10, 15, 20, 25, 50] : [5, 10, 15, 20, 25]).map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleDiscountChange(amt.toString())}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  discountInputStr === amt.toString()
                    ? 'bg-[#ea6918] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200/50'
                }`}
              >
                {discountType === 'fixed' ? `${amt} SAR` : `${amt}%`}
              </button>
            ))}
          </div>

          {calculations.discountAmount > 0 && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs space-y-1">
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Discount Deduction:</span>
                <span className="font-bold font-mono">-{calculations.discountAmount.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>New Grand Total:</span>
                <span className="font-black text-sm text-[#ea6918] font-mono">
                  {calculations.grandTotal.toFixed(2)} SAR
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================
          ITEM CUSTOM NOTE MODAL
          ======================================================== */}
      <Modal
        isOpen={itemNoteModal.isOpen}
        onClose={() => setItemNoteModal({ isOpen: false, itemId: '', note: '' })}
        title="Item Customization Note"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setItemNoteModal({ isOpen: false, itemId: '', note: '' })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveItemNote}>
              Save Note
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Kitchen Preparation Instructions"
            placeholder="e.g. Extra garlic sauce, no tomatoes, spicy..."
            value={itemNoteModal.note}
            onChange={(e) => setItemNoteModal({ ...itemNoteModal, note: e.target.value })}
            autoFocus
          />
          <div className="flex flex-wrap gap-1.5">
            {['Extra Garlic', 'No Onions', 'Spicy', 'Well Done', 'No Pickles', 'Extra Bread'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setItemNoteModal({ ...itemNoteModal, note: preset })}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] rounded-md font-medium text-slate-700 cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ========================================================
          THERMAL RECEIPT & INVOICE MODAL
          ======================================================== */}
      <ThermalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={completedOrder}
        branchSettings={branchSettings}
      />
    </div>
  );
};
