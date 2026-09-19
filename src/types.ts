export type UserRole = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'admin' | 'branch';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'branch' | 'SUPER_ADMIN' | 'BRANCH_ADMIN';
  branchId?: string; // only for branch users
  name: string;
  phone?: string;
}

export interface Branch {
  id: string;
  name: string;
  arabicName: string;
  username: string;
  password?: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  crNumber: string;
  vatNumber: string;
  managerName?: string;
  city?: string;
  district?: string;
}

export interface Category {
  id: string;
  branchId?: string;
  name: string;
  arabicName: string;
  sortOrder?: number;
}

export interface MenuItem {
  id: string;
  branchId: string;
  categoryId?: string;
  category?: string;
  name: string;
  arabicName: string;
  price: number;
  costPrice: number;
  description?: string;
  arabicDescription?: string;
  image: string;
  isAvailable: boolean;
  preparationTimeMin?: number;
  calories?: number;
}

export interface OrderItem {
  id: string;
  menuItemId?: string;
  name: string;
  arabicName?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  totalPrice: number;
  notes?: string;
  image?: string;
}

export type OrderStatus = 'completed' | 'voided' | 'pending' | 'refunded' | 'cancelled';
export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'mada'
  | 'apple_pay'
  | 'online'
  | 'delivery_app'
  | 'other'
  | 'bank_transfer'
  | 'credit';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'dine-in';

export interface Order {
  id: string;
  orderNumber?: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  items: OrderItem[];
  subtotal: number;
  discountType?: 'fixed' | 'percent';
  discountValue?: number;
  discountAmount: number;
  serviceChargeType?: 'fixed' | 'percent';
  serviceChargeValue?: number;
  serviceChargeAmount?: number;
  taxRate: number; // e.g. 15 for 15%
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paidAmount?: number;
  changeAmount?: number;
  cashierId?: string;
  cashierName: string;
  status: OrderStatus;
  voidReason?: string;
  voidedAt?: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  tableNumber?: string;
}

export type InventoryUnit = 'KG' | 'kg' | 'Gram' | 'g' | 'Liter' | 'L' | 'Piece' | 'pcs' | 'Box' | 'box' | 'Packet' | 'pack' | 'Bottle';

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  arabicName: string;
  category: string;
  unit: string;
  openingStock?: number;
  purchasedQuantity?: number;
  usedQuantity?: number;
  wastedQuantity?: number;
  currentStock: number;
  minStock: number;
  purchasePrice?: number;
  costPerUnit?: number;
  supplierId?: string;
  supplierName?: string;
  lastUpdated?: string;
}

export interface PurchaseItem {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  id: string;
  purchaseNumber?: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber?: string;
  purchaseDate: string; // YYYY-MM-DD
  items?: PurchaseItem[];
  inventoryItemId?: string;
  itemName?: string;
  quantity?: number;
  unit?: string;
  unitCost?: number;
  subtotal?: number;
  taxAmount?: number;
  totalCost?: number;
  cost?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  status?: 'received' | 'pending' | 'ordered';
  notes?: string;
  createdAt?: string;
}

export type PurchaseOrder = Purchase;

export interface Supplier {
  id: string;
  branchId?: string;
  name: string;
  arabicName?: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  openingBalance?: number;
  currentBalance?: number;
  notes?: string;
  createdAt?: string;
}

export interface SupplierPayment {
  id: string;
  branchId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'Electricity'
  | 'Gas'
  | 'Water'
  | 'Rent'
  | 'Transport'
  | 'Maintenance'
  | 'Cleaning'
  | 'Marketing'
  | 'Packaging'
  | 'Salaries'
  | 'Rent & Lease'
  | 'Utilities & Bills'
  | 'Kitchen Supplies & Cleaning'
  | 'Equipment Maintenance'
  | 'Marketing & Ads'
  | 'Licenses & Municipality'
  | 'Packaging Materials'
  | 'Other Operational'
  | 'Other';

export interface Expense {
  id: string;
  branchId: string;
  title: string;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: string;
  invoiceNumber?: string;
  notes?: string;
  payrollId?: string;
  createdAt?: string;
}

export type WastageReason =
  | 'Expired'
  | 'Spoiled'
  | 'Burnt'
  | 'Overproduction'
  | 'Damaged'
  | 'Customer Return'
  | 'spoilage'
  | 'expired'
  | 'damaged'
  | 'burnt'
  | 'prep_loss'
  | 'Other';

export interface Wastage {
  id: string;
  branchId: string;
  inventoryItemId?: string;
  inventoryItemName?: string;
  itemName?: string;
  quantity: number;
  unit: string;
  cost?: number;
  costPerUnit?: number;
  totalCost?: number;
  reason: string;
  date: string; // YYYY-MM-DD
  staffName?: string;
  reportedBy?: string;
  notes?: string;
  createdAt?: string;
}

export type WastageLog = Wastage;

export type StaffPosition =
  | 'Manager'
  | 'Cashier'
  | 'Waiter'
  | 'Chef'
  | 'Kitchen Staff'
  | 'Cleaner'
  | 'Delivery Staff'
  | 'Branch Manager'
  | 'Head Chef'
  | 'Line Cook / Shawarma Master'
  | 'Cashier / POS Operator'
  | 'Waiter / Service Crew'
  | 'Kitchen Assistant'
  | 'Other';

export interface Staff {
  id: string;
  branchId: string;
  name: string;
  arabicName?: string;
  position?: string;
  role?: string;
  phone: string;
  email?: string;
  nationalId?: string;
  iqamaNumber?: string;
  joiningDate?: string;
  joinDate?: string;
  basicSalary: number;
  salary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  allowance?: number;
  deduction?: number;
  advance?: number;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
}

export type StaffMember = Staff;

export interface PayrollRecord {
  id: string;
  branchId: string;
  staffId: string;
  staffName: string;
  position?: string;
  month?: string; // "2026-03"
  monthYear?: string; // "2026-03"
  basicSalary: number;
  housingAllowance?: number;
  transportAllowance?: number;
  allowance?: number;
  bonus?: number;
  deductions?: number;
  deduction?: number;
  advance?: number;
  netSalary: number;
  paidAmount?: number;
  remainingAmount?: number;
  paidDate?: string;
  paymentDate?: string;
  status?: 'pending' | 'paid' | 'unpaid' | 'partial';
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  notes?: string;
  createdAt?: string;
}

export type PayrollEntry = PayrollRecord;

export interface GlobalSettings {
  businessName: string;
  businessNameAr: string;
  businessLogo?: string;
  globalTaxRate: number; // default 15
  currency: string; // default "SAR"
  currencyAr: string; // default "ر.س"
  taxIdNumber: string;
  commercialRegistrationNumber: string;
}

export interface BranchSettings {
  branchId: string;
  restaurantName?: string;
  restaurantNameAr?: string;
  branchName: string;
  branchArabicName?: string;
  branchNameAr?: string;
  logo?: string;
  address: string;
  city?: string;
  district?: string;
  phone: string;
  taxRate: number;
  serviceChargeRate?: number;
  currency: string;
  crNumber: string;
  vatNumber: string;
  receiptHeader?: string;
  receiptHeaderArabic?: string;
  receiptFooter?: string;
  receiptFooterArabic?: string;
  paperSize?: '80mm' | '58mm' | 'a4';
  zatcaDeviceId?: string;
}

export interface FinancialSummary {
  sales: number;
  purchases: number;
  expenses: number;
  wastage: number;
  salaries: number;
  netProfit: number;
  orderCount: number;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalWastage: number;
  totalSalaries: number;
  profitMargin: number;
  totalOrdersCount: number;
  totalVatCollected: number;
}
