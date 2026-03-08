import Dexie, { type EntityTable } from "dexie";

// Types
export interface Hive {
  id?: number;
  code?: string;
  name: string;
  location: string;
  queenStatus: "mated" | "weak" | "virgin" | "cell" | "missing";
  lastInspection: string;
  honeyProduction: number;
  frameCount?: number;
  alerts?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  time: string;
  date: string;
  type: "inspection" | "feeding" | "harvest" | "medication" | "other";
  completed: boolean;
  hiveId?: number;
  createdAt: Date;
}

export interface Inspection {
  id?: number;
  hiveId: number;
  date: Date;
  queenStatus: "mated" | "weak" | "virgin" | "cell" | "missing";
  beeCount: "low" | "medium" | "high";
  honeyProduction: number;
  diseases?: string;
  notes?: string;
  photos?: string[];
}

export interface InventoryItem {
  id?: number;
  name: string;
  category: "honey" | "tools" | "medication" | "other";
  quantity: number;
  unit: string;
  notes?: string;
  updatedAt: Date;
}

export interface Sale {
  id?: number;
  product: string;
  quantity: number;
  price: number;
  customerName?: string;
  date: Date;
  notes?: string;
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  customerId?: number;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  status: "paid" | "partial" | "unpaid";
  date: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface InvoiceItem {
  productType: "hive" | "honey" | "other";
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id?: number;
  invoiceId: number;
  customerId?: number;
  amount: number;
  method: "cash" | "transfer" | "other";
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface HiveStock {
  id?: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
  status: "available" | "sold" | "reserved";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HoneyStock {
  id?: number;
  type: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  status: "available" | "sold" | "reserved";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id?: number;
  username: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
}

export interface UserProfile {
  id?: number;
  userId?: number;
  name: string;
  title: string;
  startYear: number;
  phone?: string;
  email?: string;
  location?: string;
}

// Database
const db = new Dexie("NahaliDB") as Dexie & {
  authUsers: EntityTable<AuthUser, "id">;
  hives: EntityTable<Hive, "id">;
  tasks: EntityTable<Task, "id">;
  inspections: EntityTable<Inspection, "id">;
  inventory: EntityTable<InventoryItem, "id">;
  sales: EntityTable<Sale, "id">;
  hiveStock: EntityTable<HiveStock, "id">;
  honeyStock: EntityTable<HoneyStock, "id">;
  customers: EntityTable<Customer, "id">;
  invoices: EntityTable<Invoice, "id">;
  payments: EntityTable<Payment, "id">;
  profile: EntityTable<UserProfile, "id">;
};

db.version(7).stores({
  authUsers: "++id, &username",
  hives: "++id, name, location, queenStatus, createdAt",
  tasks: "++id, date, type, completed, hiveId",
  inspections: "++id, hiveId, date",
  inventory: "++id, name, category",
  sales: "++id, date, customerName",
  hiveStock: "++id, name, status",
  honeyStock: "++id, type, status",
  customers: "++id, name, phone",
  invoices: "++id, customerId, customerName, status, date, invoiceNumber",
  payments: "++id, invoiceId, customerId, date",
  profile: "++id, userId",
});

// Seed default data if empty
export async function seedDatabase() {
  const hiveCount = await db.hives.count();
  if (hiveCount === 0) {
    await db.hives.bulkAdd([
      {
        name: "خلية الورد",
        location: "المزرعة الشمالية",
        queenStatus: "mated",
        lastInspection: "قبل 3 أيام",
        honeyProduction: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "خلية السدر",
        location: "المزرعة الجنوبية",
        queenStatus: "weak",
        lastInspection: "قبل أسبوع",
        honeyProduction: 8,
        alerts: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "خلية الزهور",
        location: "المزرعة الشرقية",
        queenStatus: "mated",
        lastInspection: "اليوم",
        honeyProduction: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "خلية النعناع",
        location: "المزرعة الغربية",
        queenStatus: "virgin",
        lastInspection: "قبل أسبوعين",
        honeyProduction: 3,
        alerts: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "خلية الليمون",
        location: "المزرعة الشمالية",
        queenStatus: "mated",
        lastInspection: "قبل يومين",
        honeyProduction: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "خلية البرتقال",
        location: "المزرعة الجنوبية",
        queenStatus: "cell",
        lastInspection: "قبل 4 أيام",
        honeyProduction: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }

  const taskCount = await db.tasks.count();
  if (taskCount === 0) {
    await db.tasks.bulkAdd([
      {
        title: "فحص خلية الورد",
        description: "فحص دوري للملكة والإنتاج",
        time: "10:00 صباحاً",
        date: new Date().toISOString().split("T")[0],
        type: "inspection",
        completed: false,
        hiveId: 1,
        createdAt: new Date(),
      },
      {
        title: "تغذية الخلايا 5-10",
        description: "تغذية شتوية بمحلول السكر",
        time: "11:30 صباحاً",
        date: new Date().toISOString().split("T")[0],
        type: "feeding",
        completed: true,
        createdAt: new Date(),
      },
      {
        title: "حصاد خلية البرتقال",
        description: "حصاد العسل الموسمي",
        time: "2:00 مساءً",
        date: new Date().toISOString().split("T")[0],
        type: "harvest",
        completed: false,
        hiveId: 6,
        createdAt: new Date(),
      },
      {
        title: "إعطاء الدواء لخلية السدر",
        description: "علاج الفاروا الدوري",
        time: "4:00 مساءً",
        date: new Date().toISOString().split("T")[0],
        type: "medication",
        completed: false,
        hiveId: 2,
        createdAt: new Date(),
      },
    ]);
  }

  const profileCount = await db.profile.count();
  if (profileCount === 0) {
    await db.profile.add({
      name: "أحمد محمد",
      title: "نحّال محترف",
      startYear: 2018,
      phone: "",
      email: "",
      location: "الرياض",
    });
  }

  // Seed customers
  const customerCount = await db.customers.count();
  if (customerCount === 0) {
    await db.customers.bulkAdd([
      { name: "عبدالله العتيبي", phone: "0551234567", location: "الرياض", notes: "عميل دائم", createdAt: new Date(), updatedAt: new Date() },
      { name: "سعود المطيري", phone: "0559876543", location: "جدة", notes: "", createdAt: new Date(), updatedAt: new Date() },
      { name: "فهد الشمري", phone: "0543216789", location: "الدمام", notes: "يفضل عسل السدر", createdAt: new Date(), updatedAt: new Date() },
      { name: "خالد الحربي", phone: "0567891234", location: "بريدة", notes: "", createdAt: new Date(), updatedAt: new Date() },
    ]);
  }

  // Seed hive stock
  const hiveStockCount = await db.hiveStock.count();
  if (hiveStockCount === 0) {
    await db.hiveStock.bulkAdd([
      { name: "خلية خشبية كبيرة", quantity: 5, pricePerUnit: 350, status: "available", notes: "صناعة محلية", createdAt: new Date(), updatedAt: new Date() },
      { name: "خلية لانجستروث", quantity: 3, pricePerUnit: 500, status: "available", notes: "مستوردة", createdAt: new Date(), updatedAt: new Date() },
      { name: "خلية خشبية صغيرة", quantity: 1, pricePerUnit: 200, status: "reserved", notes: "محجوزة لعبدالله", createdAt: new Date(), updatedAt: new Date() },
    ]);
  }

  // Seed honey stock
  const honeyStockCount = await db.honeyStock.count();
  if (honeyStockCount === 0) {
    await db.honeyStock.bulkAdd([
      { type: "عسل سدر", quantity: 20, unit: "كغ", pricePerUnit: 150, status: "available", notes: "موسم هذا العام", createdAt: new Date(), updatedAt: new Date() },
      { type: "عسل زهور", quantity: 15, unit: "كغ", pricePerUnit: 80, status: "available", notes: "", createdAt: new Date(), updatedAt: new Date() },
      { type: "عسل طلح", quantity: 8, unit: "كغ", pricePerUnit: 120, status: "available", notes: "", createdAt: new Date(), updatedAt: new Date() },
    ]);
  }

  // Seed invoices
  const invoiceCount = await db.invoices.count();
  if (invoiceCount === 0) {
    await db.invoices.bulkAdd([
      {
        invoiceNumber: "INV-0001",
        customerId: 1,
        customerName: "عبدالله العتيبي",
        items: [
          { productType: "honey", productName: "عسل سدر", quantity: 3, unitPrice: 150, total: 450 },
          { productType: "hive", productName: "خلية خشبية كبيرة", quantity: 1, unitPrice: 350, total: 350 },
        ],
        totalAmount: 800,
        paidAmount: 800,
        status: "paid",
        date: new Date(Date.now() - 7 * 86400000),
        notes: "تم التسليم",
        createdAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        invoiceNumber: "INV-0002",
        customerId: 2,
        customerName: "سعود المطيري",
        items: [
          { productType: "honey", productName: "عسل زهور", quantity: 5, unitPrice: 80, total: 400 },
        ],
        totalAmount: 400,
        paidAmount: 200,
        status: "partial",
        date: new Date(Date.now() - 3 * 86400000),
        dueDate: new Date(Date.now() + 14 * 86400000),
        notes: "دفعة أولى 200 ر.س",
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        invoiceNumber: "INV-0003",
        customerId: 3,
        customerName: "فهد الشمري",
        items: [
          { productType: "honey", productName: "عسل طلح", quantity: 4, unitPrice: 120, total: 480 },
          { productType: "honey", productName: "عسل سدر", quantity: 2, unitPrice: 150, total: 300 },
        ],
        totalAmount: 780,
        paidAmount: 0,
        status: "unpaid",
        date: new Date(Date.now() - 1 * 86400000),
        dueDate: new Date(Date.now() + 30 * 86400000),
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ]);

    // Seed payments for the paid and partial invoices
    await db.payments.bulkAdd([
      { invoiceId: 1, customerId: 1, amount: 800, method: "cash", date: new Date(Date.now() - 7 * 86400000), createdAt: new Date(Date.now() - 7 * 86400000) },
      { invoiceId: 2, customerId: 2, amount: 200, method: "transfer", date: new Date(Date.now() - 3 * 86400000), createdAt: new Date(Date.now() - 3 * 86400000) },
    ]);
  }
}

export { db };
