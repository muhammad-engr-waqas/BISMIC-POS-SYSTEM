import { Order, Purchase, Expense, Wastage, PayrollEntry, FinancialSummary, OrderItem } from '../types';
import { getCurrentDate, getCurrentMonth } from './formatters';

export interface CalculatedOrderSummary {
  subtotal: number;
  discountAmount: number;
  serviceChargeAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

/**
 * Checks if a date falls within [start, end]
 */
export function isDateInRange(dateStr: string, startDate?: string, endDate?: string): boolean {
  if (!dateStr) return false;
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
}

/**
 * Centralized function to calculate POS cart / order totals.
 * Tax is calculated based on (Subtotal - Discount + Service Charge) * (taxRate / 100).
 */
export function calculateOrderTotals(
  items: Array<Pick<OrderItem, 'quantity' | 'unitPrice'>>,
  discountType: 'fixed' | 'percent' = 'fixed',
  discountValue: number = 0,
  serviceChargeType: 'fixed' | 'percent' = 'fixed',
  serviceChargeValue: number = 0,
  taxRate: number = 15 // Default Saudi VAT is 15%
): CalculatedOrderSummary {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * Math.min(Math.max(discountValue, 0), 100)) / 100;
  } else {
    discountAmount = Math.min(Math.max(discountValue, 0), subtotal);
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);

  let serviceChargeAmount = 0;
  if (serviceChargeType === 'percent') {
    serviceChargeAmount = (afterDiscount * Math.max(serviceChargeValue, 0)) / 100;
  } else {
    serviceChargeAmount = Math.max(serviceChargeValue, 0);
  }

  const taxableAmount = afterDiscount + serviceChargeAmount;
  const taxAmount = (taxableAmount * Math.max(taxRate, 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    serviceChargeAmount: Number(serviceChargeAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}

export type DateFilterType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom' | 'all';

/**
 * Filter items by date
 */
export function isDateInFilter(
  itemDateStr: string,
  filter: DateFilterType | string,
  customStart?: string,
  customEnd?: string
): boolean {
  if (!itemDateStr) return false;
  if (filter === 'all') return true;

  // Handle direct custom start/end strings if filter is passed as a date string
  if (filter && filter.includes('-') && !['today', 'yesterday', 'this_week', 'this_month', 'custom', 'all'].includes(filter)) {
    return isDateInRange(itemDateStr, filter, customStart);
  }

  const todayStr = getCurrentDate();
  const today = new Date(todayStr);

  if (filter === 'today') {
    return itemDateStr === todayStr;
  }

  if (filter === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    return itemDateStr === yStr;
  }

  if (filter === 'this_week') {
    const itemDate = new Date(itemDateStr);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    return itemDate >= sevenDaysAgo && itemDate <= today;
  }

  if (filter === 'this_month') {
    const currentMonthPrefix = getCurrentMonth();
    return itemDateStr.startsWith(currentMonthPrefix);
  }

  if (filter === 'custom') {
    return isDateInRange(itemDateStr, customStart, customEnd);
  }

  return true;
}

/**
 * Centralized Financial Summary Calculation:
 * Net Profit = Sales - Purchases - Expenses - Wastage - Salaries
 */
export function calculateFinancialSummary(
  orders: Order[],
  purchases: Purchase[],
  expenses: Expense[],
  wastage: Wastage[],
  payrollEntries: PayrollEntry[],
  dateFilter: DateFilterType | string = 'all',
  customStart?: string,
  customEnd?: string
): FinancialSummary {
  // 1. Sales: only include completed orders
  const filteredOrders = orders.filter(
    (o) => o.status === 'completed' && isDateInFilter(o.date, dateFilter, customStart, customEnd)
  );
  const sales = filteredOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const vatCollected = filteredOrders.reduce((acc, o) => acc + (o.taxAmount || 0), 0);
  const orderCount = filteredOrders.length;

  // 2. Purchases
  const filteredPurchases = purchases.filter((p) =>
    isDateInFilter(p.purchaseDate, dateFilter, customStart, customEnd)
  );
  const totalPurchases = filteredPurchases.reduce((acc, p) => acc + (p.totalCost || 0), 0);

  // 3. Operational Expenses
  const filteredExpenses = expenses.filter(
    (e) => e.category !== 'Salaries' && isDateInFilter(e.date, dateFilter, customStart, customEnd)
  );
  const operationalExpenses = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // 4. Wastage cost
  const filteredWastage = wastage.filter((w) =>
    isDateInFilter(w.date, dateFilter, customStart, customEnd)
  );
  const totalWastage = filteredWastage.reduce((acc, w) => acc + (w.totalCost || w.cost || 0), 0);

  // 5. Salaries
  const filteredPayroll = payrollEntries.filter((p) => {
    const pDate = p.paidDate || p.paymentDate || (p.month ? `${p.month}-28` : p.monthYear ? `${p.monthYear}-28` : undefined);
    if (pDate) {
      return isDateInFilter(pDate, dateFilter, customStart, customEnd);
    }
    return true;
  });
  const totalSalaries = filteredPayroll.reduce(
    (acc, p) => acc + (p.netSalary || p.paidAmount || p.basicSalary || 0),
    0
  );

  const totalCombinedExpenses = operationalExpenses + totalSalaries;
  const netProfit = sales - totalPurchases - operationalExpenses - totalWastage - totalSalaries;
  const profitMargin = sales > 0 ? (netProfit / sales) * 100 : 0;

  return {
    sales: Number(sales.toFixed(2)),
    purchases: Number(totalPurchases.toFixed(2)),
    expenses: Number(totalCombinedExpenses.toFixed(2)),
    wastage: Number(totalWastage.toFixed(2)),
    salaries: Number(totalSalaries.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    orderCount,
    totalSales: Number(sales.toFixed(2)),
    totalPurchases: Number(totalPurchases.toFixed(2)),
    totalExpenses: Number(operationalExpenses.toFixed(2)),
    totalWastage: Number(totalWastage.toFixed(2)),
    totalSalaries: Number(totalSalaries.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(1)),
    totalOrdersCount: orderCount,
    totalVatCollected: Number(vatCollected.toFixed(2)),
  };
}
