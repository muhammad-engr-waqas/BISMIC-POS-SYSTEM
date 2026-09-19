import {
  User,
  Branch,
  Category,
  MenuItem,
  Order,
  InventoryItem,
  Purchase,
  Supplier,
  SupplierPayment,
  Expense,
  Wastage,
  Staff,
  PayrollEntry,
  GlobalSettings,
  BranchSettings,
} from '../types';
import { getCurrentDate, getCurrentTime, getCurrentMonth } from '../utils/formatters';

const STORAGE_KEYS = {
  USERS: 'pos_saudi_users',
  BRANCHES: 'pos_saudi_branches',
  CATEGORIES: 'pos_saudi_categories',
  MENU_ITEMS: 'pos_saudi_menu_items',
  ORDERS: 'pos_saudi_orders',
  INVENTORY: 'pos_saudi_inventory',
  PURCHASES: 'pos_saudi_purchases',
  SUPPLIERS: 'pos_saudi_suppliers',
  SUPPLIER_PAYMENTS: 'pos_saudi_supplier_payments',
  EXPENSES: 'pos_saudi_expenses',
  WASTAGE: 'pos_saudi_wastage',
  STAFF: 'pos_saudi_staff',
  PAYROLL: 'pos_saudi_payroll',
  GLOBAL_SETTINGS: 'pos_saudi_global_settings',
  BRANCH_SETTINGS: 'pos_saudi_branch_settings',
  AUTH_SESSION: 'pos_saudi_auth_session',
  INITIALIZED: 'pos_bismic_pakistan_v5',
};

// Generic safe storage accessors
export function getStorageData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

export function setStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ==========================================
// SEED DATA GENERATOR
// ==========================================
export function initializeSampleData(force = false): void {
  if (!force && localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return;
  }

  const today = getCurrentDate();
  const currentMonth = getCurrentMonth();

  // 1. Branches
  const branches: Branch[] = [
    {
      id: 'branch-riyadh',
      name: 'Riyadh Al Olaya Branch',
      arabicName: 'ریاض العربیہ برانچ (Riyadh Al Olaya)',
      username: 'riyadh',
      password: 'riyadh123',
      address: 'King Fahd Road, Al Olaya District, Riyadh 12211',
      phone: '+966 11 465 8899',
      status: 'active',
      createdAt: '2026-01-15',
      crNumber: '1010458921',
      vatNumber: '310234567800003',
      managerName: 'Tariq Al-Mansoor',
    },
    {
      id: 'branch-jeddah',
      name: 'Jeddah Corniche Branch',
      arabicName: 'جدہ کارنیش برانچ (Jeddah Corniche)',
      username: 'jeddah',
      password: 'jeddah123',
      address: 'North Corniche Road, Al Shati District, Jeddah 23412',
      phone: '+966 12 654 3322',
      status: 'active',
      createdAt: '2026-02-10',
      crNumber: '4030789123',
      vatNumber: '310234567800003',
      managerName: 'Yasser Bakhsh',
    },
    {
      id: 'branch-dammam',
      name: 'Dammam Al Khobar Branch',
      arabicName: 'دمام الخبر برانچ (Dammam Al Khobar)',
      username: 'dammam',
      password: 'dammam123',
      address: 'Prince Turki Street, Al Yarmouk, Al Khobar 34423',
      phone: '+966 13 898 7744',
      status: 'active',
      createdAt: '2026-03-01',
      crNumber: '2050987654',
      vatNumber: '310234567800003',
      managerName: 'Sultan Al-Ghamdi',
    },
  ];

  // 2. Users
  const users: User[] = [
    {
      id: 'user-admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Executive Super Admin',
      phone: '+966 50 111 2233',
    },
    {
      id: 'user-riyadh',
      username: 'riyadh',
      password: 'riyadh123',
      role: 'branch',
      branchId: 'branch-riyadh',
      name: 'Riyadh Branch Manager',
      phone: '+966 54 222 3344',
    },
    {
      id: 'user-jeddah',
      username: 'jeddah',
      password: 'jeddah123',
      role: 'branch',
      branchId: 'branch-jeddah',
      name: 'Jeddah Branch Manager',
      phone: '+966 56 333 4455',
    },
    {
      id: 'user-dammam',
      username: 'dammam',
      password: 'dammam123',
      role: 'branch',
      branchId: 'branch-dammam',
      name: 'Dammam Branch Manager',
      phone: '+966 59 444 5566',
    },
  ];

  // 3. Categories
  const baseCategoryNames = [
    { name: 'All', arabicName: 'تمام (All)', sortOrder: 0 },
    { name: 'Karahi & Handi', arabicName: 'کڑاہی اور ہانڈی (Karahi & Handi)', sortOrder: 1 },
    { name: 'Rice & Mandi', arabicName: 'بریانی، چاول و مندی (Rice Dishes)', sortOrder: 2 },
    { name: 'BBQ & Grills', arabicName: 'باربی کیو و گرلز (BBQ Tikka & Kebabs)', sortOrder: 3 },
    { name: 'Bread & Naan', arabicName: 'نان و روٹی (Naan & Roti)', sortOrder: 4 },
    { name: 'Fast Food', arabicName: 'فاسٹ فوڈ و برگر (Fast Food & Burgers)', sortOrder: 5 },
    { name: 'Salads & Raita', arabicName: 'سلاد و رائتہ (Salad & Raita)', sortOrder: 6 },
    { name: 'Drinks & Tea', arabicName: 'مشروبات، شربت و چائے (Beverages & Chai)', sortOrder: 7 },
    { name: 'Desserts', arabicName: 'میٹھے و حلوہ جات (Desserts & Sweets)', sortOrder: 8 },
  ];

  const categories: Category[] = [];
  branches.forEach((b) => {
    baseCategoryNames.forEach((c) => {
      categories.push({
        id: `${b.id}-cat-${c.sortOrder}`,
        branchId: b.id,
        name: c.name,
        arabicName: c.arabicName,
        sortOrder: c.sortOrder,
      });
    });
  });

  // 4. Menu Items with authentic food imagery
  const sampleMenuCatalog = [
    {
      categoryOrder: 1,
      name: 'Chicken Karahi (Half)',
      arabicName: 'چکن کڑاہی ہاف (Chicken Karahi Half)',
      price: 38.0,
      costPrice: 18.0,
      description: 'Traditional wok-cooked chicken in thick rich tomato and ginger gravy with fresh green chilies.',
      arabicDescription: 'روایتی تازہ چکن کڑاہی، ٹماٹر، ادرک اور ہری مرچوں کی خاص گریوی کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 20,
    },
    {
      categoryOrder: 1,
      name: 'Special Mutton Karahi (1 KG)',
      arabicName: 'اسپیشل مٹن کڑاہی 1 کلو (Special Mutton Karahi 1KG)',
      price: 88.0,
      costPrice: 48.0,
      description: 'Fresh local tender mutton prepared in desi ghee with crushed black pepper, tomatoes, and coriander.',
      arabicDescription: 'خالص دیسی گھی، کالی مرچ، ٹماٹر اور دھنیے سے تیار کردہ تازہ مٹن کڑاہی۔',
      image: 'https://images.unsplash.com/photo-1545247181-516773cae7be?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 25,
    },
    {
      categoryOrder: 1,
      name: 'Chicken Handi (Boneless)',
      arabicName: 'چکن ہانڈی بون لیس (Chicken Handi Boneless)',
      price: 45.0,
      costPrice: 20.0,
      description: 'Velvety boneless chicken cooked in an authentic earthen clay pot with creamy spiced masala.',
      arabicDescription: 'مٹی کی ہانڈی میں پکا ہوا بون لیس چکن، مکھن اور شاہی کریمی مصالحہ جات کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 18,
    },
    {
      categoryOrder: 1,
      name: 'Mutton Handi Royal',
      arabicName: 'شاہی مٹن ہانڈی (Mutton Handi Royal)',
      price: 92.0,
      costPrice: 50.0,
      description: 'Slow-cooked mutton handi infused with saffron, cashew cream, and cardamom.',
      arabicDescription: 'ہلکی آنچ پر پکا ہوا مٹن، زعفران، کاجو پیسٹ اور چھوٹی الائچی کے امتزاج سے۔',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 25,
    },
    {
      categoryOrder: 2,
      name: 'Special Chicken Biryani',
      arabicName: 'اسپیشل چکن بریانی (Special Chicken Biryani)',
      price: 32.0,
      costPrice: 14.0,
      description: 'Aromatic long-grain basmati rice layered with spiced marinated chicken, saffron, and fried onions.',
      arabicDescription: 'خوشبودار باسمتی چاول، مصالحہ دار چکن، زعفرانی رنگ اور تلی ہوئی پیاز کی تہوں سے تیار شدہ۔',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 10,
    },
    {
      categoryOrder: 2,
      name: 'Mutton Mandi Saudi Style',
      arabicName: 'مٹن مندی خاص (Mutton Mandi Special)',
      price: 68.0,
      costPrice: 38.0,
      description: 'Traditional Saudi-style tender smoked mutton served on a generous bed of spiced fragrant mandi rice.',
      arabicDescription: 'نرم و ملائم دم پخت مٹن، زعفرانی مندی چاول اور اسپیشل عربی چٹنی کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 12,
    },
    {
      categoryOrder: 2,
      name: 'Kabsa Laham Special',
      arabicName: 'کبسہ لحم اسپیشل (Kabsa Laham Special)',
      price: 65.0,
      costPrice: 35.0,
      description: 'Authentic Saudi spiced rice with succulent lamb shank, dried lime (loomi), and roasted pine nuts.',
      arabicDescription: 'روایتی کبسہ چاول، لذیذ گوشت، لیموں اور بھنے ہوئے خشک میوہ جات کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 15,
    },
    {
      categoryOrder: 3,
      name: 'Mixed Grill Platter (Meshwi)',
      arabicName: 'مکس گرل پلیٹر (Mixed BBQ Grill Platter)',
      price: 75.0,
      costPrice: 36.0,
      description: 'Charcoal-grilled assortment of Chicken Shish Tawook, Mutton Kebab, Tikka, and grilled tomatoes.',
      arabicDescription: 'کوئلوں پر بنے شیش طاؤق، مٹن کباب، چکن تکہ اور گرلڈ ٹماٹروں کا شاندار تھال۔',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 15,
    },
    {
      categoryOrder: 3,
      name: 'Chicken Tikka Boti',
      arabicName: 'چکن تکہ بوٹی (Chicken Tikka Boti)',
      price: 34.0,
      costPrice: 15.0,
      description: 'Boneless cubes of chicken marinated in yogurt, tandoori spices, and lemon, grilled on skewers.',
      arabicDescription: 'دہی، تندوری مصالحوں اور لیموں میں میری نیٹ شدہ لذیذ چکن تکہ بوٹی۔',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 15,
    },
    {
      categoryOrder: 4,
      name: 'Fresh Roghni Butter Naan',
      arabicName: 'روغنی بٹر نان (Fresh Roghni Butter Naan)',
      price: 4.0,
      costPrice: 1.2,
      description: 'Fluffy clay-oven tandoori naan brushed with butter and sesame seeds.',
      arabicDescription: 'تندور کا تازہ گرم نان، مکھن اور تلوں کی خوبصورت گارنش کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 5,
    },
    {
      categoryOrder: 4,
      name: 'Garlic Butter Naan',
      arabicName: 'گارلک بٹر نان (Garlic Butter Naan)',
      price: 5.0,
      costPrice: 1.5,
      description: 'Crispy oven naan topped with minced fresh garlic, coriander, and melted ghee.',
      arabicDescription: 'لہسن، تازہ ہرا دھنیا اور مکھن کے ساتھ کرکرا تندوری نان۔',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 5,
    },
    {
      categoryOrder: 5,
      name: 'Crispy Chicken Zinger Burger',
      arabicName: 'کرسپی چکن زنگر برگر (Zinger Burger)',
      price: 24.0,
      costPrice: 10.0,
      description: 'Golden fried spicy chicken breast, melted cheddar cheese, lettuce, and secret sauce on brioche bun.',
      arabicDescription: 'کرسپی فرائیڈ چکن، چیز سلائس، سلاد پتہ اور اسپیشل مایو سوس برگر بن میں۔',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 10,
    },
    {
      categoryOrder: 5,
      name: 'Shawarma Arabi Platter',
      arabicName: 'شاورما عربی پلیٹر (Shawarma Arabi Platter)',
      price: 26.0,
      costPrice: 11.0,
      description: 'Sliced chicken shawarma rolls served with crispy French fries, garlic toum, and pickled turnip.',
      arabicDescription: 'چکن شاورما رول کے کٹے ہوئے پیسز، فرنچ فرائز، گارلک سوس اور اچار کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 8,
    },
    {
      categoryOrder: 5,
      name: 'Crispy French Fries (Large)',
      arabicName: 'کرسپی فرائز لارج (Crispy French Fries Large)',
      price: 12.0,
      costPrice: 4.0,
      description: 'Golden potato fries seasoned with paprika salt and served with dipping sauce.',
      arabicDescription: 'گولڈن تلی ہوئی آلو کی چپس اور کیچپ / سوس۔',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 6,
    },
    {
      categoryOrder: 6,
      name: 'Fresh Fattoush Arabic Salad',
      arabicName: 'تازہ فتوش سلاد (Fresh Fattoush Salad)',
      price: 18.0,
      costPrice: 6.0,
      description: 'Crisp romaine, cucumber, cherry tomatoes, radish, sumac dressing, and crunchy fried pita chips.',
      arabicDescription: 'تازہ کھیرا، ٹماٹر، پودینہ اور کرسپی تلی ہوئی روٹی کے چپس والا سلاد۔',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 5,
    },
    {
      categoryOrder: 6,
      name: 'Fresh Mint & Cumin Raita',
      arabicName: 'پودینہ و زیرہ رائتہ (Mint & Zeera Raita)',
      price: 8.0,
      costPrice: 2.5,
      description: 'Chilled yogurt blended with fresh garden mint, roasted cumin, and black salt.',
      arabicDescription: 'تازہ دہی، ہرا پودینہ اور بھنے ہوئے زیرے سے تیار کردہ ٹھنڈا رائتہ۔',
      image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 3,
    },
    {
      categoryOrder: 7,
      name: 'Karak Chai Special (Pot)',
      arabicName: 'اسپیشل کڑک چائے پاٹ (Special Karak Chai Pot)',
      price: 12.0,
      costPrice: 3.5,
      description: 'Traditional slow-boiled black tea with evaporated milk, crushed cardamom, and saffron.',
      arabicDescription: 'الائچی اور زعفرانی خوشبو سے بھرپور گہری پکی ہوئی کڑک چائے۔',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 5,
    },
    {
      categoryOrder: 7,
      name: 'Saudi Arabic Coffee (Dallah)',
      arabicName: 'عربی قہوہ دَلّہ مع کھجور (Arabic Qahwa Dallah)',
      price: 25.0,
      costPrice: 6.0,
      description: 'Golden roasted Saudi coffee brewed with cardamom and cloves, served with premium dates.',
      arabicDescription: 'الائچی اور لونگ ملا روایتی قہوہ اور اعلیٰ قسم کی کھجوریں۔',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 6,
    },
    {
      categoryOrder: 7,
      name: 'Fresh Mango Juice',
      arabicName: 'تازہ مینگو جوس (Fresh Mango Juice)',
      price: 15.0,
      costPrice: 5.0,
      description: 'Thick, sweet, all-natural chilled mango nectar blended to perfection.',
      arabicDescription: 'قدرتی میٹھے آموں کا گاڑھا اور ٹھنڈا فریش جوس۔',
      image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 4,
    },
    {
      categoryOrder: 7,
      name: 'Soft Drinks (Pepsi 330ml)',
      arabicName: 'پیپسی کین 330 ملی لیٹر (Pepsi Can)',
      price: 5.0,
      costPrice: 2.0,
      description: 'Ice cold carbonated soft drink can.',
      arabicDescription: 'ٹھنڈی پیپسی کولڈ ڈرنک کین۔',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 1,
    },
    {
      categoryOrder: 8,
      name: 'Kunafa with Cream & Pistachio',
      arabicName: 'کنافہ مع کریم و پستہ (Cream Kunafa)',
      price: 22.0,
      costPrice: 8.0,
      description: 'Crisp golden shredded pastry layered with warm fresh cream and drenched in sugar syrup.',
      arabicDescription: 'گرم و خستہ کنافہ، تازہ کریم اور پسے ہوئے پستے کی گارنش کے ساتھ۔',
      image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 10,
    },
    {
      categoryOrder: 8,
      name: 'Traditional Um Ali',
      arabicName: 'ام علی میٹھا (Traditional Um Ali)',
      price: 19.0,
      costPrice: 7.0,
      description: 'Warm Egyptian bread pudding baked with milk, cream, raisins, and roasted almonds.',
      arabicDescription: 'دودھ، بالائی، کشمش اور باداموں سے پکا ہوا روایتی میٹھا۔',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
      preparationTimeMin: 8,
    },
  ];

  const menuItems: MenuItem[] = [];
  branches.forEach((b) => {
    sampleMenuCatalog.forEach((item, idx) => {
      const catId = `${b.id}-cat-${item.categoryOrder}`;
      menuItems.push({
        id: `${b.id}-item-${idx + 1}`,
        branchId: b.id,
        categoryId: catId,
        name: item.name,
        arabicName: item.arabicName,
        price: item.price,
        costPrice: item.costPrice,
        description: item.description,
        arabicDescription: item.arabicDescription,
        image: item.image,
        isAvailable: true,
        preparationTimeMin: item.preparationTimeMin,
      });
    });
  });

  // 5. Suppliers
  const suppliers: Supplier[] = [
    {
      id: 'sup-1-riyadh',
      branchId: 'branch-riyadh',
      name: 'Al-Watania Poultry & Meat Co.',
      phone: '+966 11 411 9900',
      address: 'Al Kharj Road, Riyadh',
      openingBalance: 0,
      currentBalance: 1250,
      notes: 'Main fresh chicken and mutton supplier.',
      createdAt: '2026-01-20',
    },
    {
      id: 'sup-2-riyadh',
      branchId: 'branch-riyadh',
      name: 'Riyadh Central Produce Market',
      phone: '+966 11 432 5544',
      address: 'Azizia Wholesale Market, Riyadh',
      openingBalance: 0,
      currentBalance: 450,
      notes: 'Vegetables, onions, tomatoes, fresh mint.',
      createdAt: '2026-01-20',
    },
    {
      id: 'sup-3-riyadh',
      branchId: 'branch-riyadh',
      name: 'Al-Rehab Packaging & Disposables',
      phone: '+966 11 498 1234',
      address: '2nd Industrial City, Riyadh',
      openingBalance: 0,
      currentBalance: 0,
      notes: 'Takeaway containers, thermal paper rolls, bags.',
      createdAt: '2026-01-22',
    },
    // Jeddah Suppliers
    {
      id: 'sup-1-jeddah',
      branchId: 'branch-jeddah',
      name: 'Jeddah Coastal Livestock & Meats',
      phone: '+966 12 612 8844',
      address: 'Al Mina Road, Jeddah',
      openingBalance: 0,
      currentBalance: 1800,
      notes: 'Fresh lamb and veal.',
      createdAt: '2026-02-12',
    },
    {
      id: 'sup-2-jeddah',
      branchId: 'branch-jeddah',
      name: 'Western Region Food Ingredients',
      phone: '+966 12 687 2390',
      address: 'Industrial Area 1, Jeddah',
      openingBalance: 0,
      currentBalance: 320,
      notes: 'Spices, oils, Basmati rice sacks.',
      createdAt: '2026-02-12',
    },
    // Dammam Suppliers
    {
      id: 'sup-1-dammam',
      branchId: 'branch-dammam',
      name: 'Eastern Province Wholesale Foods',
      phone: '+966 13 833 4455',
      address: 'King Abdulaziz Seaport Zone, Dammam',
      openingBalance: 0,
      currentBalance: 950,
      notes: 'Rice, Ghee, Flour and Spices.',
      createdAt: '2026-03-02',
    },
  ];

  // 6. Inventory Items
  const sampleInventoryTemplate = [
    { name: 'Fresh Whole Chicken (Grade A)', arabicName: 'تازہ چکن سالم (Fresh Whole Chicken)', category: 'Poultry', unit: 'Piece' as const, current: 45, min: 15, price: 14.5 },
    { name: 'Fresh Australian Mutton (Bone-in)', arabicName: 'تازہ مٹن ہڈی والا (Fresh Mutton)', category: 'Meat', unit: 'KG' as const, current: 35, min: 10, price: 42.0 },
    { name: 'Basmati Sella Rice (50 KG Bag)', arabicName: 'باسمتی سیلا چاول 50 کلو (Basmati Rice Bag)', category: 'Grains', unit: 'Box' as const, current: 12, min: 4, price: 280.0 },
    { name: 'Pure Desi Ghee (Tin 16L)', arabicName: 'خالص دیسی گھی 16 لیٹر (Desi Ghee Tin)', category: 'Oils', unit: 'Liter' as const, current: 18, min: 5, price: 160.0 },
    { name: 'Fresh Red Tomatoes (Box 10KG)', arabicName: 'تازہ لال ٹماٹر 10 کلو پیٹی (Fresh Tomatoes Box)', category: 'Vegetables', unit: 'Box' as const, current: 8, min: 3, price: 35.0 },
    { name: 'White Onions (Sack 15KG)', arabicName: 'پیاز بوری 15 کلو (Onions Sack)', category: 'Vegetables', unit: 'Box' as const, current: 14, min: 4, price: 40.0 },
    { name: 'Garlic & Ginger Paste (Bucket 5KG)', arabicName: 'ادرک لہسن پیسٹ بالٹی 5 کلو (Ginger Garlic Paste)', category: 'Condiments', unit: 'Box' as const, current: 6, min: 2, price: 55.0 },
    { name: 'Chef Special Garam Masala Blend', arabicName: 'اسپیشل گرم مصالحہ (Special Garam Masala)', category: 'Spices', unit: 'KG' as const, current: 15, min: 3, price: 65.0 },
    { name: 'Tandoori Flour / Maida (25KG)', arabicName: 'تندوری نان میدہ 25 کلو (Tandoori Maida Bag)', category: 'Bakery', unit: 'Box' as const, current: 9, min: 3, price: 75.0 },
    { name: 'Pepsi Cans 330ml (Pack 24)', arabicName: 'پیپسی کین 24 پیک (Pepsi Cans Pack 24)', category: 'Beverages', unit: 'Box' as const, current: 20, min: 5, price: 42.0 },
    { name: 'Thermal Receipt Rolls 80mm (Box 50)', arabicName: 'تھرمل رسید رولز 80mm (Thermal Paper Rolls)', category: 'Supplies', unit: 'Box' as const, current: 3, min: 2, price: 85.0 },
  ];

  const inventory: InventoryItem[] = [];
  branches.forEach((b) => {
    sampleInventoryTemplate.forEach((item, i) => {
      inventory.push({
        id: `${b.id}-inv-${i + 1}`,
        branchId: b.id,
        name: item.name,
        arabicName: item.arabicName,
        category: item.category,
        unit: (item.unit as any) === 'Bag' ? 'Box' : item.unit,
        openingStock: item.current + 10,
        purchasedQuantity: 20,
        usedQuantity: 15,
        wastedQuantity: 0,
        currentStock: item.current,
        minStock: item.min,
        purchasePrice: item.price,
        supplierName: suppliers.find((s) => s.branchId === b.id)?.name || 'Local Market',
        lastUpdated: today,
      });
    });
  });

  // 7. Staff
  const staff: Staff[] = [
    // Riyadh
    { id: 'staff-1', branchId: 'branch-riyadh', name: 'Rashid Khan', position: 'Manager', phone: '+966 50 223 9911', joiningDate: '2025-01-10', basicSalary: 5500, allowance: 1000, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2458912301' },
    { id: 'staff-2', branchId: 'branch-riyadh', name: 'Mohammad Zubair', position: 'Chef', phone: '+966 54 332 1100', joiningDate: '2025-02-01', basicSalary: 4200, allowance: 600, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2458912302' },
    { id: 'staff-3', branchId: 'branch-riyadh', name: 'Ali Hamza', position: 'Cashier', phone: '+966 56 441 2299', joiningDate: '2025-06-15', basicSalary: 3200, allowance: 400, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2458912303' },
    { id: 'staff-4', branchId: 'branch-riyadh', name: 'Farhan Tariq', position: 'Waiter', phone: '+966 55 998 7766', joiningDate: '2025-08-20', basicSalary: 2200, allowance: 300, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2458912304' },
    { id: 'staff-5', branchId: 'branch-riyadh', name: 'Bilal Ahmad', position: 'Kitchen Staff', phone: '+966 53 112 3344', joiningDate: '2025-09-01', basicSalary: 2400, allowance: 300, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2458912305' },
    // Jeddah
    { id: 'staff-6', branchId: 'branch-jeddah', name: 'Usman Ghani', position: 'Manager', phone: '+966 54 998 1234', joiningDate: '2025-02-15', basicSalary: 5200, allowance: 900, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2433912311' },
    { id: 'staff-7', branchId: 'branch-jeddah', name: 'Kareem Shafi', position: 'Chef', phone: '+966 56 776 5432', joiningDate: '2025-03-01', basicSalary: 4000, allowance: 500, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2433912312' },
    { id: 'staff-8', branchId: 'branch-jeddah', name: 'Salman Mir', position: 'Cashier', phone: '+966 55 221 8899', joiningDate: '2025-04-10', basicSalary: 3000, allowance: 400, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2433912313' },
    // Dammam
    { id: 'staff-9', branchId: 'branch-dammam', name: 'Naveed Akhtar', position: 'Manager', phone: '+966 53 445 6677', joiningDate: '2025-03-05', basicSalary: 5000, allowance: 800, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2411912321' },
    { id: 'staff-10', branchId: 'branch-dammam', name: 'Imran Riaz', position: 'Chef', phone: '+966 59 887 1122', joiningDate: '2025-03-10', basicSalary: 3900, allowance: 500, deduction: 0, advance: 0, status: 'active', iqamaNumber: '2411912322' },
  ];

  // 8. Payroll entries for current month
  const payroll: PayrollEntry[] = [];
  staff.forEach((s) => {
    const allowance = s.allowance || (s.housingAllowance || 0) + (s.transportAllowance || 0) || 0;
    const deduction = s.deduction || 0;
    const advance = s.advance || 0;
    const net = s.basicSalary + allowance - deduction - advance;
    payroll.push({
      id: `pay-${s.id}-${currentMonth}`,
      branchId: s.branchId,
      staffId: s.id,
      staffName: s.name,
      position: s.position,
      monthYear: currentMonth,
      basicSalary: s.basicSalary,
      allowance,
      deduction,
      advance,
      netSalary: net,
      paidAmount: net,
      remainingAmount: 0,
      paymentDate: `${today}`,
      paymentStatus: 'paid',
      notes: `Monthly payroll payment via bank WPS`,
    });
  });

  // 9. Expenses
  const expenses: Expense[] = [
    // Riyadh expenses
    { id: 'exp-1', branchId: 'branch-riyadh', title: 'Monthly Electricity Bill', category: 'Electricity', amount: 1850.0, date: today, paymentMethod: 'bank_transfer', notes: 'Monthly electricity bill account #44981', createdAt: today },
    { id: 'exp-2', branchId: 'branch-riyadh', title: 'Gas Cylinder Refill', category: 'Gas', amount: 480.0, date: today, paymentMethod: 'card', notes: 'Kitchen pipeline cylinder refill', createdAt: today },
    { id: 'exp-3', branchId: 'branch-riyadh', title: 'Kitchen Sanitizing & Cleaning Supplies', category: 'Cleaning', amount: 320.0, date: today, paymentMethod: 'cash', notes: 'Floor cleaner, dish detergent, degreaser', createdAt: today },
    { id: 'exp-4', branchId: 'branch-riyadh', title: 'Delivery Bike Petrol & Oil Change', category: 'Transport', amount: 180.0, date: today, paymentMethod: 'cash', notes: 'Branch delivery bike petrol', createdAt: today },
    // Jeddah expenses
    { id: 'exp-5', branchId: 'branch-jeddah', title: 'Branch Electricity & AC Maintenance', category: 'Electricity', amount: 1620.0, date: today, paymentMethod: 'bank_transfer', notes: 'Corniche branch cooling', createdAt: today },
    { id: 'exp-6', branchId: 'branch-jeddah', title: 'Social Media Local Promotion', category: 'Marketing', amount: 450.0, date: today, paymentMethod: 'card', notes: 'Weekend family offer promotion', createdAt: today },
    // Dammam expenses
    { id: 'exp-7', branchId: 'branch-dammam', title: 'Water Utility Bill', category: 'Water', amount: 380.0, date: today, paymentMethod: 'bank_transfer', notes: 'Branch water utility bill', createdAt: today },
  ];

  // 10. Wastage entries
  const wastage: Wastage[] = [
    { id: 'wst-1', branchId: 'branch-riyadh', itemName: 'Fresh Tomatoes (Overripe/Spoiled)', quantity: 4, unit: 'KG', cost: 18.0, reason: 'Spoiled', date: today, staffName: 'Mohammad Zubair', notes: 'Damaged in crate during humid transit', createdAt: today },
    { id: 'wst-2', branchId: 'branch-riyadh', itemName: 'Tandoori Naan Dough (Overfermented)', quantity: 3, unit: 'KG', cost: 12.0, reason: 'Overproduction', date: today, staffName: 'Bilal Ahmad', notes: 'Dough overfermented overnight', createdAt: today },
    { id: 'wst-3', branchId: 'branch-jeddah', itemName: 'Marinated Chicken Tikka (Burnt)', quantity: 2, unit: 'Piece', cost: 24.0, reason: 'Burnt', date: today, staffName: 'Kareem Shafi', notes: 'High charcoal flare on tandoor', createdAt: today },
  ];

  // 11. Purchases
  const purchases: Purchase[] = [
    {
      id: 'pur-1',
      branchId: 'branch-riyadh',
      supplierId: 'sup-1-riyadh',
      supplierName: 'Al-Watania Poultry & Meat Co.',
      invoiceNumber: 'WAT-2026-8941',
      purchaseDate: today,
      inventoryItemId: 'branch-riyadh-inv-1',
      itemName: 'Fresh Whole Chicken (Grade A)',
      quantity: 30,
      unit: 'Piece',
      unitCost: 14.5,
      totalCost: 435.0,
      paidAmount: 435.0,
      remainingAmount: 0,
      paymentMethod: 'card',
      notes: 'Morning fresh poultry delivery batch #01',
      createdAt: today,
    },
    {
      id: 'pur-2',
      branchId: 'branch-riyadh',
      supplierId: 'sup-2-riyadh',
      supplierName: 'Riyadh Central Produce Market',
      invoiceNumber: 'AZZ-7712',
      purchaseDate: today,
      inventoryItemId: 'branch-riyadh-inv-5',
      itemName: 'Fresh Red Tomatoes (Box 10KG)',
      quantity: 5,
      unit: 'Box',
      unitCost: 35.0,
      totalCost: 175.0,
      paidAmount: 175.0,
      remainingAmount: 0,
      paymentMethod: 'cash',
      notes: 'Fresh salad and curry tomatoes',
      createdAt: today,
    },
    {
      id: 'pur-3',
      branchId: 'branch-jeddah',
      supplierId: 'sup-1-jeddah',
      supplierName: 'Jeddah Coastal Livestock & Meats',
      invoiceNumber: 'JED-5520',
      purchaseDate: today,
      inventoryItemId: 'branch-jeddah-inv-2',
      itemName: 'Fresh Australian Mutton (Bone-in)',
      quantity: 20,
      unit: 'KG',
      unitCost: 42.0,
      totalCost: 840.0,
      paidAmount: 500.0,
      remainingAmount: 340.0,
      paymentMethod: 'credit',
      notes: 'Weekend Karahi & Mandi stock',
      createdAt: today,
    },
  ];

  // 12. Sample Orders (Real Orders for Today)
  const orders: Order[] = [
    {
      id: 'ord-101',
      orderNumber: 'ORD-RYD-001',
      branchId: 'branch-riyadh',
      date: today,
      time: '12:30:15',
      items: [
        { id: 'oi-1', menuItemId: 'branch-riyadh-item-1', name: 'Chicken Karahi (Half)', arabicName: 'چکن کڑاہی ہاف (Chicken Karahi Half)', quantity: 2, unitPrice: 38.0, costPrice: 18.0, totalPrice: 76.0, notes: 'Medium spice' },
        { id: 'oi-2', menuItemId: 'branch-riyadh-item-10', name: 'Fresh Roghni Butter Naan', arabicName: 'روغنی بٹر نان (Fresh Roghni Butter Naan)', quantity: 4, unitPrice: 4.0, costPrice: 1.2, totalPrice: 16.0 },
        { id: 'oi-3', menuItemId: 'branch-riyadh-item-17', name: 'Fresh Mint & Cumin Raita', arabicName: 'پودینہ و زیرہ رائتہ (Mint & Zeera Raita)', quantity: 2, unitPrice: 8.0, costPrice: 2.5, totalPrice: 16.0 },
        { id: 'oi-4', menuItemId: 'branch-riyadh-item-21', name: 'Soft Drinks (Pepsi 330ml)', arabicName: 'پیپسی کین 330 ملی لیٹر (Pepsi Can)', quantity: 2, unitPrice: 5.0, costPrice: 2.0, totalPrice: 10.0 },
      ],
      subtotal: 118.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      serviceChargeType: 'fixed',
      serviceChargeValue: 0,
      serviceChargeAmount: 0,
      taxRate: 15,
      taxAmount: 17.7,
      grandTotal: 135.7,
      paymentMethod: 'card',
      paidAmount: 135.7,
      changeAmount: 0,
      cashierName: 'Ali Hamza',
      status: 'completed',
      orderType: 'dine-in',
      tableNumber: 'Table 4',
    },
    {
      id: 'ord-102',
      orderNumber: 'ORD-RYD-002',
      branchId: 'branch-riyadh',
      date: today,
      time: '13:15:40',
      items: [
        { id: 'oi-5', menuItemId: 'branch-riyadh-item-2', name: 'Special Mutton Karahi (1 KG)', arabicName: 'اسپیشل مٹن کڑاہی 1 کلو (Special Mutton Karahi 1KG)', quantity: 1, unitPrice: 88.0, costPrice: 48.0, totalPrice: 88.0 },
        { id: 'oi-6', menuItemId: 'branch-riyadh-item-5', name: 'Special Chicken Biryani', arabicName: 'اسپیشل چکن بریانی (Special Chicken Biryani)', quantity: 2, unitPrice: 32.0, costPrice: 14.0, totalPrice: 64.0 },
        { id: 'oi-7', menuItemId: 'branch-riyadh-item-11', name: 'Garlic Butter Naan', arabicName: 'گارلک بٹر نان (Garlic Butter Naan)', quantity: 3, unitPrice: 5.0, costPrice: 1.5, totalPrice: 15.0 },
        { id: 'oi-8', menuItemId: 'branch-riyadh-item-18', name: 'Karak Chai Special (Pot)', arabicName: 'اسپیشل کڑک چائے پاٹ (Special Karak Chai Pot)', quantity: 1, unitPrice: 12.0, costPrice: 3.5, totalPrice: 12.0 },
        { id: 'oi-9', menuItemId: 'branch-riyadh-item-22', name: 'Kunafa with Cream & Pistachio', arabicName: 'کنافہ مع کریم و پستہ (Cream Kunafa)', quantity: 2, unitPrice: 22.0, costPrice: 8.0, totalPrice: 44.0 },
      ],
      subtotal: 223.0,
      discountType: 'percent',
      discountValue: 10,
      discountAmount: 22.3,
      serviceChargeType: 'fixed',
      serviceChargeValue: 0,
      serviceChargeAmount: 0,
      taxRate: 15,
      taxAmount: 30.11,
      grandTotal: 230.81,
      paymentMethod: 'cash',
      paidAmount: 250.0,
      changeAmount: 19.19,
      cashierName: 'Ali Hamza',
      status: 'completed',
      customerName: 'Sheikh Fahad',
      orderType: 'takeaway',
    },
    {
      id: 'ord-103',
      orderNumber: 'ORD-RYD-003',
      branchId: 'branch-riyadh',
      date: today,
      time: '14:05:10',
      items: [
        { id: 'oi-10', menuItemId: 'branch-riyadh-item-6', name: 'Mutton Mandi Saudi Style', arabicName: 'مٹن مندی خاص (Mutton Mandi Special)', quantity: 2, unitPrice: 68.0, costPrice: 38.0, totalPrice: 136.0 },
        { id: 'oi-11', menuItemId: 'branch-riyadh-item-19', name: 'Saudi Arabic Coffee (Dallah)', arabicName: 'عربی قہوہ دَلّہ مع کھجور (Arabic Qahwa Dallah)', quantity: 1, unitPrice: 25.0, costPrice: 6.0, totalPrice: 25.0 },
      ],
      subtotal: 161.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      serviceChargeType: 'fixed',
      serviceChargeValue: 0,
      serviceChargeAmount: 0,
      taxRate: 15,
      taxAmount: 24.15,
      grandTotal: 185.15,
      paymentMethod: 'card',
      paidAmount: 185.15,
      changeAmount: 0,
      cashierName: 'Ali Hamza',
      status: 'completed',
      orderType: 'dine-in',
      tableNumber: 'Table 8',
    },
    // Jeddah Order
    {
      id: 'ord-201',
      orderNumber: 'ORD-JED-001',
      branchId: 'branch-jeddah',
      date: today,
      time: '13:00:22',
      items: [
        { id: 'oi-12', menuItemId: 'branch-jeddah-item-8', name: 'Mixed Grill Platter (Meshwi)', arabicName: 'مکس گرل پلیٹر (Mixed BBQ Grill Platter)', quantity: 2, unitPrice: 75.0, costPrice: 36.0, totalPrice: 150.0 },
        { id: 'oi-13', menuItemId: 'branch-jeddah-item-16', name: 'Fresh Fattoush Arabic Salad', arabicName: 'تازہ فتوش سلاد (Fresh Fattoush Salad)', quantity: 2, unitPrice: 18.0, costPrice: 6.0, totalPrice: 36.0 },
        { id: 'oi-14', menuItemId: 'branch-jeddah-item-20', name: 'Fresh Mango Juice', arabicName: 'تازہ مینگو جوس (Fresh Mango Juice)', quantity: 3, unitPrice: 15.0, costPrice: 5.0, totalPrice: 45.0 },
      ],
      subtotal: 231.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      serviceChargeType: 'fixed',
      serviceChargeValue: 0,
      serviceChargeAmount: 0,
      taxRate: 15,
      taxAmount: 34.65,
      grandTotal: 265.65,
      paymentMethod: 'card',
      paidAmount: 265.65,
      changeAmount: 0,
      cashierName: 'Salman Mir',
      status: 'completed',
      orderType: 'dine-in',
      tableNumber: 'Family Area 2',
    },
    // Dammam Order
    {
      id: 'ord-301',
      orderNumber: 'ORD-DMM-001',
      branchId: 'branch-dammam',
      date: today,
      time: '13:45:00',
      items: [
        { id: 'oi-15', menuItemId: 'branch-dammam-item-3', name: 'Chicken Handi (Boneless)', arabicName: 'چکن ہانڈی بون لیس (Chicken Handi Boneless)', quantity: 2, unitPrice: 45.0, costPrice: 20.0, totalPrice: 90.0 },
        { id: 'oi-16', menuItemId: 'branch-dammam-item-10', name: 'Fresh Roghni Butter Naan', arabicName: 'روغنی بٹر نان (Fresh Roghni Butter Naan)', quantity: 4, unitPrice: 4.0, costPrice: 1.2, totalPrice: 16.0 },
      ],
      subtotal: 106.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      serviceChargeType: 'fixed',
      serviceChargeValue: 0,
      serviceChargeAmount: 0,
      taxRate: 15,
      taxAmount: 15.9,
      grandTotal: 121.9,
      paymentMethod: 'cash',
      paidAmount: 150.0,
      changeAmount: 28.1,
      cashierName: 'Naveed Akhtar',
      status: 'completed',
      orderType: 'takeaway',
    },
  ];

  // 13. Global Settings
  const globalSettings: GlobalSettings = {
    businessName: 'Bismic Restaurant Group',
    businessNameAr: 'بسمک ریستوران گروپ (Bismic Restaurant)',
    businessLogo: '',
    globalTaxRate: 15,
    currency: 'SAR',
    currencyAr: 'روپے / SAR',
    taxIdNumber: '310234567800003',
    commercialRegistrationNumber: '1010458921',
  };

  // 14. Branch Settings
  const branchSettings: Record<string, BranchSettings> = {
    'branch-riyadh': {
      branchId: 'branch-riyadh',
      restaurantName: 'Bismic Restaurant',
      restaurantNameAr: 'بسمک ریستوران',
      branchName: 'Riyadh Al Olaya Branch',
      branchNameAr: 'ریاض العربیہ برانچ',
      logo: '',
      address: 'King Fahd Road, Al Olaya District, Riyadh 12211, Kingdom of Saudi Arabia',
      phone: '+966 11 465 8899',
      taxRate: 15,
      currency: 'SAR',
      crNumber: '1010458921',
      vatNumber: '310234567800003',
      receiptHeader: 'Simplified Tax Invoice / سادہ ٹیکس انوائس\nBISMIC RESTAURANT - Authentic Taste from Pakistan to KSA',
      receiptFooter: 'Prices include 15% VAT | تمام قیمتوں میں 15 فیصد ٹیکس شامل ہے\nZATCA Phase 2 E-Invoice Compliant',
    },
    'branch-jeddah': {
      branchId: 'branch-jeddah',
      restaurantName: 'Bismic Restaurant',
      restaurantNameAr: 'بسمک ریستوران',
      branchName: 'Jeddah Corniche Branch',
      branchNameAr: 'جدہ کارنیش برانچ',
      logo: '',
      address: 'North Corniche Road, Al Shati District, Jeddah 23412, Kingdom of Saudi Arabia',
      phone: '+966 12 654 3322',
      taxRate: 15,
      currency: 'SAR',
      crNumber: '4030789123',
      vatNumber: '310234567800003',
      receiptHeader: 'Simplified Tax Invoice / سادہ ٹیکس انوائس\nBISMIC RESTAURANT - Authentic Taste from Pakistan to KSA',
      receiptFooter: 'Prices include 15% VAT | تمام قیمتوں میں 15 فیصد ٹیکس شامل ہے\nZATCA Phase 2 E-Invoice Compliant',
    },
    'branch-dammam': {
      branchId: 'branch-dammam',
      restaurantName: 'Bismic Restaurant',
      restaurantNameAr: 'بسمک ریستوران',
      branchName: 'Dammam Al Khobar Branch',
      branchNameAr: 'دمام الخبر برانچ',
      logo: '',
      address: 'Prince Turki Street, Al Yarmouk, Al Khobar 34423, Kingdom of Saudi Arabia',
      phone: '+966 13 898 7744',
      taxRate: 15,
      currency: 'SAR',
      crNumber: '2050987654',
      vatNumber: '310234567800003',
      receiptHeader: 'Simplified Tax Invoice / سادہ ٹیکس انوائس\nBISMIC RESTAURANT - Authentic Taste from Pakistan to KSA',
      receiptFooter: 'Prices include 15% VAT | تمام قیمتوں میں 15 فیصد ٹیکس شامل ہے\nZATCA Phase 2 E-Invoice Compliant',
    },
  };

  // Write all to LocalStorage
  setStorageData(STORAGE_KEYS.BRANCHES, branches);
  setStorageData(STORAGE_KEYS.USERS, users);
  setStorageData(STORAGE_KEYS.CATEGORIES, categories);
  setStorageData(STORAGE_KEYS.MENU_ITEMS, menuItems);
  setStorageData(STORAGE_KEYS.SUPPLIERS, suppliers);
  setStorageData(STORAGE_KEYS.INVENTORY, inventory);
  setStorageData(STORAGE_KEYS.STAFF, staff);
  setStorageData(STORAGE_KEYS.PAYROLL, payroll);
  setStorageData(STORAGE_KEYS.EXPENSES, expenses);
  setStorageData(STORAGE_KEYS.WASTAGE, wastage);
  setStorageData(STORAGE_KEYS.PURCHASES, purchases);
  setStorageData(STORAGE_KEYS.ORDERS, orders);
  setStorageData(STORAGE_KEYS.GLOBAL_SETTINGS, globalSettings);
  setStorageData(STORAGE_KEYS.BRANCH_SETTINGS, branchSettings);
  setStorageData(STORAGE_KEYS.INITIALIZED, 'true');
}

// ==========================================
// CENTRALIZED DATA API SERVICE
// ==========================================
export const DataService = {
  // Initialization
  init: () => initializeSampleData(false),
  resetToSampleData: () => initializeSampleData(true),

  // Auth & Session
  getCurrentSession: (): User | null => {
    return getStorageData<User | null>(STORAGE_KEYS.AUTH_SESSION, null);
  },
  setCurrentSession: (user: User | null): void => {
    setStorageData(STORAGE_KEYS.AUTH_SESSION, user);
  },
  authenticate: (username: string, password?: string): { success: boolean; user?: User; error?: string } => {
    let users = getStorageData<User[]>(STORAGE_KEYS.USERS, []);
    if (!users || users.length === 0) {
      initializeSampleData(true);
      users = getStorageData<User[]>(STORAGE_KEYS.USERS, []);
    }

    const cleanUser = username.trim().toLowerCase();
    const found = users.find((u) => u.username.toLowerCase() === cleanUser);

    if (!found) {
      return { success: false, error: 'Invalid username. Please check your username.' };
    }

    const enteredPass = password?.trim() || '';
    const storedPass = found.password || '';

    // Allow exact match or common aliases for demo admin / branches
    const isPasswordValid =
      enteredPass === storedPass ||
      (cleanUser === 'admin' && ['admin', 'admin123', 'admin@123', 'password', '123456'].includes(enteredPass)) ||
      (cleanUser === 'riyadh' && ['riyadh', 'riyadh123', 'password', '123456'].includes(enteredPass)) ||
      (cleanUser === 'jeddah' && ['jeddah', 'jeddah123', 'password', '123456'].includes(enteredPass)) ||
      (cleanUser === 'dammam' && ['dammam', 'dammam123', 'password', '123456'].includes(enteredPass));

    if (!isPasswordValid && storedPass) {
      return { success: false, error: `Incorrect password. (Tip: Try "${storedPass}" or "${cleanUser}")` };
    }

    // Normalize role
    const normalizedRole = found.role === 'SUPER_ADMIN' || found.role === 'admin' ? 'admin' : 'branch';
    const authenticatedUser: User = {
      ...found,
      role: normalizedRole,
    };

    // If branch user, check branch status
    if (authenticatedUser.role === 'branch' && authenticatedUser.branchId) {
      const branches = getStorageData<Branch[]>(STORAGE_KEYS.BRANCHES, []);
      const branch = branches.find((b) => b.id === authenticatedUser.branchId);
      if (!branch) {
        return { success: false, error: 'Assigned branch does not exist.' };
      }
      if (branch.status === 'inactive') {
        return { success: false, error: 'This branch has been deactivated by Super Admin.' };
      }
    }

    DataService.setCurrentSession(authenticatedUser);
    return { success: true, user: authenticatedUser };
  },

  // Branches
  getBranches: (): Branch[] => {
    return getStorageData<Branch[]>(STORAGE_KEYS.BRANCHES, []);
  },
  getBranchById: (id: string): Branch | undefined => {
    const branches = DataService.getBranches();
    return branches.find((b) => b.id === id);
  },
  createBranch: (branchData: Omit<Branch, 'id' | 'createdAt'>): Branch => {
    const branches = DataService.getBranches();
    const newId = `branch-${Date.now().toString(36)}`;
    const today = getCurrentDate();
    const newBranch: Branch = {
      ...branchData,
      id: newId,
      createdAt: today,
    };
    branches.push(newBranch);
    setStorageData(STORAGE_KEYS.BRANCHES, branches);

    // Also create the corresponding user for branch login
    const users = getStorageData<User[]>(STORAGE_KEYS.USERS, []);
    users.push({
      id: `user-${newId}`,
      username: branchData.username,
      password: branchData.password,
      role: 'BRANCH_ADMIN',
      branchId: newId,
      name: `${branchData.name} Manager`,
      phone: branchData.phone,
    });
    setStorageData(STORAGE_KEYS.USERS, users);

    // Seed default categories and branch settings for new branch
    const baseCats = [
      { name: 'All', arabicName: 'الكل', sortOrder: 0 },
      { name: 'Karahi & Handi', arabicName: 'كراهي وهاندي', sortOrder: 1 },
      { name: 'Rice & Mandi', arabicName: 'أرز ومندي', sortOrder: 2 },
      { name: 'BBQ & Grills', arabicName: 'مشاوي ومشاكيك', sortOrder: 3 },
      { name: 'Bread & Naan', arabicName: 'خبز ونان', sortOrder: 4 },
      { name: 'Fast Food', arabicName: 'وجبات سريعة', sortOrder: 5 },
      { name: 'Salads & Raita', arabicName: 'سلطات ومقبلات', sortOrder: 6 },
      { name: 'Drinks & Tea', arabicName: 'مشروبات وشاي', sortOrder: 7 },
      { name: 'Desserts', arabicName: 'حلويات', sortOrder: 8 },
    ];
    const categories = getStorageData<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    baseCats.forEach((c) => {
      categories.push({
        id: `${newId}-cat-${c.sortOrder}`,
        branchId: newId,
        name: c.name,
        arabicName: c.arabicName,
        sortOrder: c.sortOrder,
      });
    });
    setStorageData(STORAGE_KEYS.CATEGORIES, categories);

    // Branch Settings
    const branchSettings = getStorageData<Record<string, BranchSettings>>(STORAGE_KEYS.BRANCH_SETTINGS, {});
    branchSettings[newId] = {
      branchId: newId,
      restaurantName: 'Al-Nafoura Restaurant',
      restaurantNameAr: 'مطاعم النافورة',
      branchName: branchData.name,
      branchNameAr: branchData.arabicName || branchData.name,
      logo: '',
      address: branchData.address,
      phone: branchData.phone,
      taxRate: 15,
      currency: 'SAR',
      crNumber: branchData.crNumber || '1010000000',
      vatNumber: branchData.vatNumber || '310000000000003',
      receiptHeader: 'Simplified Tax Invoice / فاتورة ضريبية مبسطة',
      receiptFooter: 'Prices include 15% VAT | الأسعار تشمل ضريبة القيمة المضافة ١٥٪',
    };
    setStorageData(STORAGE_KEYS.BRANCH_SETTINGS, branchSettings);

    return newBranch;
  },
  updateBranch: (id: string, updates: Partial<Branch>): Branch | undefined => {
    const branches = DataService.getBranches();
    const idx = branches.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    branches[idx] = { ...branches[idx], ...updates };
    setStorageData(STORAGE_KEYS.BRANCHES, branches);

    // If username or password changed, update user record
    if (updates.username || updates.password) {
      const users = getStorageData<User[]>(STORAGE_KEYS.USERS, []);
      const uIdx = users.findIndex((u) => u.branchId === id);
      if (uIdx !== -1) {
        if (updates.username) users[uIdx].username = updates.username;
        if (updates.password) users[uIdx].password = updates.password;
        setStorageData(STORAGE_KEYS.USERS, users);
      }
    }
    return branches[idx];
  },

  // Categories
  getCategories: (branchId?: string): Category[] => {
    const categories = getStorageData<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    if (!branchId) return categories;
    return categories.filter((c) => c.branchId === branchId);
  },
  createCategory: (category: Omit<Category, 'id'>): Category => {
    const categories = getStorageData<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const newCat: Category = { ...category, id: generateId('cat') };
    categories.push(newCat);
    setStorageData(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  },
  updateCategory: (id: string, updates: Partial<Category>): Category | undefined => {
    const categories = getStorageData<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    categories[idx] = { ...categories[idx], ...updates };
    setStorageData(STORAGE_KEYS.CATEGORIES, categories);
    return categories[idx];
  },
  deleteCategory: (id: string): void => {
    const categories = getStorageData<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    setStorageData(
      STORAGE_KEYS.CATEGORIES,
      categories.filter((c) => c.id !== id)
    );
  },

  // Menu Items
  getMenuItems: (branchId?: string): MenuItem[] => {
    const items = getStorageData<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    if (!branchId) return items;
    return items.filter((m) => m.branchId === branchId);
  },
  getMenuItemById: (id: string): MenuItem | undefined => {
    const items = getStorageData<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    return items.find((m) => m.id === id);
  },
  createMenuItem: (item: Omit<MenuItem, 'id'>): MenuItem => {
    const items = getStorageData<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    const newItem: MenuItem = { ...item, id: generateId('item') };
    items.push(newItem);
    setStorageData(STORAGE_KEYS.MENU_ITEMS, items);
    return newItem;
  },
  updateMenuItem: (id: string, updates: Partial<MenuItem>): MenuItem | undefined => {
    const items = getStorageData<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    const idx = items.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], ...updates };
    setStorageData(STORAGE_KEYS.MENU_ITEMS, items);
    return items[idx];
  },
  deleteMenuItem: (id: string): void => {
    const items = getStorageData<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, []);
    setStorageData(
      STORAGE_KEYS.MENU_ITEMS,
      items.filter((m) => m.id !== id)
    );
  },

  // Orders
  getOrders: (branchId?: string): Order[] => {
    const orders = getStorageData<Order[]>(STORAGE_KEYS.ORDERS, []);
    if (!branchId) return orders;
    return orders.filter((o) => o.branchId === branchId);
  },
  getOrderById: (id: string): Order | undefined => {
    const orders = getStorageData<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders.find((o) => o.id === id);
  },
  createOrder: (orderData: Omit<Order, 'id'>): Order => {
    const orders = getStorageData<Order[]>(STORAGE_KEYS.ORDERS, []);
    const branchSeq = (orders.filter((o) => o.branchId === orderData.branchId).length + 1).toString().padStart(4, '0');
    const newOrder: Order = {
      orderNumber: orderData.orderNumber || `ORD-${branchSeq}`,
      ...orderData,
      id: generateId('ord'),
    };
    orders.unshift(newOrder); // newest first
    setStorageData(STORAGE_KEYS.ORDERS, orders);

    // Deduct stock for inventory items where applicable
    try {
      const inventory = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
      let invModified = false;

      orderData.items.forEach((item) => {
        // Find matching inventory items by name keyword or category
        const match = inventory.find(
          (inv) =>
            inv.branchId === orderData.branchId &&
            (inv.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) ||
              item.name.toLowerCase().includes(inv.name.toLowerCase().split(' ')[0]))
        );
        if (match && match.currentStock > 0) {
          match.usedQuantity = (match.usedQuantity || 0) + item.quantity;
          match.currentStock = Math.max(0, match.currentStock - item.quantity);
          match.lastUpdated = getCurrentDate();
          invModified = true;
        }
      });

      if (invModified) {
        setStorageData(STORAGE_KEYS.INVENTORY, inventory);
      }
    } catch (e) {
      console.error('Failed to auto-update inventory from order:', e);
    }

    return newOrder;
  },
  voidOrder: (orderId: string, reason: string): Order | undefined => {
    const orders = getStorageData<Order[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    orders[idx].status = 'voided';
    orders[idx].voidReason = reason;
    orders[idx].voidedAt = `${getCurrentDate()} ${getCurrentTime()}`;
    setStorageData(STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  },

  // Inventory
  getInventory: (branchId?: string): InventoryItem[] => {
    const items = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    if (!branchId) return items;
    return items.filter((i) => i.branchId === branchId);
  },
  createInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
    const items = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const newItem: InventoryItem = {
      ...item,
      id: generateId('inv'),
      lastUpdated: getCurrentDate(),
    };
    items.push(newItem);
    setStorageData(STORAGE_KEYS.INVENTORY, items);
    return newItem;
  },
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>): InventoryItem | undefined => {
    const items = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], ...updates, lastUpdated: getCurrentDate() };
    setStorageData(STORAGE_KEYS.INVENTORY, items);
    return items[idx];
  },
  deleteInventoryItem: (id: string): void => {
    const items = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    setStorageData(
      STORAGE_KEYS.INVENTORY,
      items.filter((i) => i.id !== id)
    );
  },

  // Purchases
  getPurchases: (branchId?: string): Purchase[] => {
    const purchases = getStorageData<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
    if (!branchId) return purchases;
    return purchases.filter((p) => p.branchId === branchId);
  },
  createPurchase: (purchaseData: Omit<Purchase, 'id' | 'createdAt'>): Purchase => {
    const purchases = getStorageData<Purchase[]>(STORAGE_KEYS.PURCHASES, []);
    const newPurchase: Purchase = {
      ...purchaseData,
      id: generateId('pur'),
      createdAt: getCurrentDate(),
    };
    purchases.unshift(newPurchase);
    setStorageData(STORAGE_KEYS.PURCHASES, purchases);

    // 1. Update Inventory item stock
    if (purchaseData.inventoryItemId) {
      const inventory = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
      const invIdx = inventory.findIndex((i) => i.id === purchaseData.inventoryItemId);
      if (invIdx !== -1) {
        const qty = purchaseData.quantity || 0;
        inventory[invIdx].purchasedQuantity = (inventory[invIdx].purchasedQuantity || 0) + qty;
        inventory[invIdx].currentStock = (inventory[invIdx].currentStock || 0) + qty;
        if (purchaseData.unitCost) {
          inventory[invIdx].purchasePrice = purchaseData.unitCost;
        }
        inventory[invIdx].lastUpdated = getCurrentDate();
        setStorageData(STORAGE_KEYS.INVENTORY, inventory);
      }
    }

    // 2. Update Supplier balance if credit / remaining amount
    if (purchaseData.supplierId && (purchaseData.remainingAmount || 0) > 0) {
      const suppliers = getStorageData<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
      const supIdx = suppliers.findIndex((s) => s.id === purchaseData.supplierId);
      if (supIdx !== -1) {
        suppliers[supIdx].currentBalance = (suppliers[supIdx].currentBalance || 0) + (purchaseData.remainingAmount || 0);
        setStorageData(STORAGE_KEYS.SUPPLIERS, suppliers);
      }
    }

    return newPurchase;
  },

  // Suppliers
  getSuppliers: (branchId?: string): Supplier[] => {
    const suppliers = getStorageData<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    if (!branchId) return suppliers;
    return suppliers.filter((s) => s.branchId === branchId);
  },
  createSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const suppliers = getStorageData<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const newSup: Supplier = {
      ...supplierData,
      id: generateId('sup'),
      createdAt: getCurrentDate(),
    };
    suppliers.push(newSup);
    setStorageData(STORAGE_KEYS.SUPPLIERS, suppliers);
    return newSup;
  },
  updateSupplier: (id: string, updates: Partial<Supplier>): Supplier | undefined => {
    const suppliers = getStorageData<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const idx = suppliers.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    suppliers[idx] = { ...suppliers[idx], ...updates };
    setStorageData(STORAGE_KEYS.SUPPLIERS, suppliers);
    return suppliers[idx];
  },
  recordSupplierPayment: (payment: Omit<SupplierPayment, 'id'>): SupplierPayment => {
    const payments = getStorageData<SupplierPayment[]>(STORAGE_KEYS.SUPPLIER_PAYMENTS, []);
    const newPayment: SupplierPayment = {
      ...payment,
      id: generateId('pay-sup'),
    };
    payments.unshift(newPayment);
    setStorageData(STORAGE_KEYS.SUPPLIER_PAYMENTS, payments);

    // Reduce supplier balance
    const suppliers = getStorageData<Supplier[]>(STORAGE_KEYS.SUPPLIERS, []);
    const supIdx = suppliers.findIndex((s) => s.id === payment.supplierId);
    if (supIdx !== -1) {
      suppliers[supIdx].currentBalance = Math.max(0, (suppliers[supIdx].currentBalance || 0) - payment.amount);
      setStorageData(STORAGE_KEYS.SUPPLIERS, suppliers);
    }
    return newPayment;
  },
  getSupplierPayments: (supplierId?: string): SupplierPayment[] => {
    const payments = getStorageData<SupplierPayment[]>(STORAGE_KEYS.SUPPLIER_PAYMENTS, []);
    if (!supplierId) return payments;
    return payments.filter((p) => p.supplierId === supplierId);
  },

  // Expenses
  getExpenses: (branchId?: string): Expense[] => {
    const expenses = getStorageData<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    if (!branchId) return expenses;
    return expenses.filter((e) => e.branchId === branchId);
  },
  createExpense: (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const expenses = getStorageData<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const newExpense: Expense = {
      ...expenseData,
      id: generateId('exp'),
      createdAt: getCurrentDate(),
    };
    expenses.unshift(newExpense);
    setStorageData(STORAGE_KEYS.EXPENSES, expenses);
    return newExpense;
  },
  deleteExpense: (id: string): void => {
    const expenses = getStorageData<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    setStorageData(
      STORAGE_KEYS.EXPENSES,
      expenses.filter((e) => e.id !== id)
    );
  },

  // Wastage
  getWastage: (branchId?: string): Wastage[] => {
    const wastage = getStorageData<Wastage[]>(STORAGE_KEYS.WASTAGE, []);
    if (!branchId) return wastage;
    return wastage.filter((w) => w.branchId === branchId);
  },
  createWastage: (wastageData: Omit<Wastage, 'id' | 'createdAt'>): Wastage => {
    const wastage = getStorageData<Wastage[]>(STORAGE_KEYS.WASTAGE, []);
    const newWastage: Wastage = {
      ...wastageData,
      id: generateId('wst'),
      createdAt: getCurrentDate(),
    };
    wastage.unshift(newWastage);
    setStorageData(STORAGE_KEYS.WASTAGE, wastage);

    // Reduce inventory quantity
    if (wastageData.inventoryItemId) {
      const inventory = getStorageData<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
      const invIdx = inventory.findIndex((i) => i.id === wastageData.inventoryItemId);
      if (invIdx !== -1) {
        inventory[invIdx].wastedQuantity = (inventory[invIdx].wastedQuantity || 0) + wastageData.quantity;
        inventory[invIdx].currentStock = Math.max(0, (inventory[invIdx].currentStock || 0) - wastageData.quantity);
        inventory[invIdx].lastUpdated = getCurrentDate();
        setStorageData(STORAGE_KEYS.INVENTORY, inventory);
      }
    }

    return newWastage;
  },

  // Staff
  getStaff: (branchId?: string): Staff[] => {
    const staff = getStorageData<Staff[]>(STORAGE_KEYS.STAFF, []);
    if (!branchId) return staff;
    return staff.filter((s) => s.branchId === branchId);
  },
  createStaff: (staffData: Omit<Staff, 'id'>): Staff => {
    const staff = getStorageData<Staff[]>(STORAGE_KEYS.STAFF, []);
    const newStaff: Staff = {
      ...staffData,
      id: generateId('stf'),
    };
    staff.push(newStaff);
    setStorageData(STORAGE_KEYS.STAFF, staff);
    return newStaff;
  },
  updateStaff: (id: string, updates: Partial<Staff>): Staff | undefined => {
    const staff = getStorageData<Staff[]>(STORAGE_KEYS.STAFF, []);
    const idx = staff.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    staff[idx] = { ...staff[idx], ...updates };
    setStorageData(STORAGE_KEYS.STAFF, staff);
    return staff[idx];
  },

  // Payroll
  getPayroll: (branchId?: string, monthYear?: string): PayrollEntry[] => {
    const payroll = getStorageData<PayrollEntry[]>(STORAGE_KEYS.PAYROLL, []);
    return payroll.filter((p) => {
      if (branchId && p.branchId !== branchId) return false;
      if (monthYear && p.monthYear !== monthYear) return false;
      return true;
    });
  },
  paySalary: (
    payrollId: string,
    amount: number,
    paymentMethod: 'cash' | 'card' | 'bank_transfer',
    notes?: string
  ): PayrollEntry | undefined => {
    const payroll = getStorageData<PayrollEntry[]>(STORAGE_KEYS.PAYROLL, []);
    const idx = payroll.findIndex((p) => p.id === payrollId);
    if (idx === -1) return undefined;

    const entry = payroll[idx];
    const newPaid = (entry.paidAmount || 0) + amount;
    const remaining = Math.max(0, entry.netSalary - newPaid);

    entry.paidAmount = newPaid;
    entry.remainingAmount = remaining;
    entry.paymentStatus = remaining <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
    entry.paymentDate = getCurrentDate();
    if (notes) entry.notes = notes;

    setStorageData(STORAGE_KEYS.PAYROLL, payroll);

    // Automatically record in Branch Expenses as 'Salaries'
    DataService.createExpense({
      branchId: entry.branchId,
      title: `Salary Payment: ${entry.staffName} (${entry.position}) - ${entry.monthYear}`,
      category: 'Salaries',
      amount: amount,
      date: getCurrentDate(),
      paymentMethod: paymentMethod,
      notes: notes || `Payroll disbursement for month ${entry.monthYear}`,
      payrollId: entry.id,
    });

    return entry;
  },

  // Settings
  getGlobalSettings: (): GlobalSettings => {
    return getStorageData<GlobalSettings>(STORAGE_KEYS.GLOBAL_SETTINGS, {
      businessName: 'Bismic Restaurant Group',
      businessNameAr: 'بسمک ریستوران گروپ',
      businessLogo: '',
      globalTaxRate: 15,
      currency: 'SAR',
      currencyAr: 'روپے / SAR',
      taxIdNumber: '310234567800003',
      commercialRegistrationNumber: '1010458921',
    });
  },
  updateGlobalSettings: (settings: Partial<GlobalSettings>): GlobalSettings => {
    const current = DataService.getGlobalSettings();
    const updated = { ...current, ...settings };
    setStorageData(STORAGE_KEYS.GLOBAL_SETTINGS, updated);
    return updated;
  },

  getBranchSettings: (branchId: string): BranchSettings => {
    const all = getStorageData<Record<string, BranchSettings>>(STORAGE_KEYS.BRANCH_SETTINGS, {});
    if (all[branchId]) return all[branchId];

    const branch = DataService.getBranchById(branchId);
    return {
      branchId,
      restaurantName: 'Bismic Restaurant',
      restaurantNameAr: 'بسمک ریستوران',
      branchName: branch?.name || 'Restaurant Branch',
      branchNameAr: branch?.arabicName || 'ریستوران برانچ',
      logo: '',
      address: branch?.address || 'Kingdom of Saudi Arabia',
      phone: branch?.phone || '+966 11 000 0000',
      taxRate: 15,
      currency: 'SAR',
      crNumber: branch?.crNumber || '1010000000',
      vatNumber: branch?.vatNumber || '310000000000003',
      receiptHeader: 'Simplified Tax Invoice / سادہ ٹیکس انوائس\nBISMIC RESTAURANT',
      receiptFooter: 'Prices include 15% VAT | قیمتوں میں 15 فیصد ٹیکس شامل ہے',
    };
  },
  updateBranchSettings: (branchId: string, updates: Partial<BranchSettings>): BranchSettings => {
    const all = getStorageData<Record<string, BranchSettings>>(STORAGE_KEYS.BRANCH_SETTINGS, {});
    const current = DataService.getBranchSettings(branchId);
    const updated = { ...current, ...updates };
    all[branchId] = updated;
    setStorageData(STORAGE_KEYS.BRANCH_SETTINGS, all);
    return updated;
  },
  saveBranchSettings: (branchId: string, updates: Partial<BranchSettings>): BranchSettings => {
    return DataService.updateBranchSettings(branchId, updates);
  },

  // Alias helpers
  getUsers: (): User[] => {
    return getStorageData<User[]>(STORAGE_KEYS.USERS, []);
  },
  getCurrentUser: (): User | null => {
    return DataService.getCurrentSession();
  },
  setCurrentUser: (user: User | null): void => {
    DataService.setCurrentSession(user);
  },
  logout: (): void => {
    DataService.setCurrentSession(null);
  },
  updateOrderStatus: (orderId: string, status: Order['status']): Order | undefined => {
    const orders = getStorageData<Order[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    orders[idx].status = status;
    setStorageData(STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  },
  createPurchaseOrder: (purchaseData: any): Purchase => {
    return DataService.createPurchase(purchaseData);
  },
  createWastageLog: (wastageData: any): Wastage => {
    return DataService.createWastage(wastageData);
  },
  createPayrollRecord: (payrollData: any): PayrollEntry => {
    const payroll = getStorageData<PayrollEntry[]>(STORAGE_KEYS.PAYROLL, []);
    const newEntry: PayrollEntry = {
      ...payrollData,
      id: generateId('pay'),
      createdAt: getCurrentDate(),
    };
    payroll.push(newEntry);
    setStorageData(STORAGE_KEYS.PAYROLL, payroll);
    return newEntry;
  },
  updatePayrollRecord: (id: string, updates: Partial<PayrollEntry>): PayrollEntry | undefined => {
    const payroll = getStorageData<PayrollEntry[]>(STORAGE_KEYS.PAYROLL, []);
    const idx = payroll.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    payroll[idx] = { ...payroll[idx], ...updates };
    setStorageData(STORAGE_KEYS.PAYROLL, payroll);
    return payroll[idx];
  },
};

// Automatically seed sample data on startup if not already initialized
if (typeof window !== 'undefined') {
  try {
    initializeSampleData(false);
  } catch (e) {
    console.error('Initial storage seeding error:', e);
  }
}

