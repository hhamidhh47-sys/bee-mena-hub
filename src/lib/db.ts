import Dexie, { type EntityTable } from "dexie";

// Types
export interface Hive {
  id?: number;
  name: string;
  location: string;
  queenStatus: "mated" | "weak" | "virgin" | "cell" | "missing";
  lastInspection: string;
  honeyProduction: number;
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
  hives: EntityTable<Hive, "id">;
  tasks: EntityTable<Task, "id">;
  inspections: EntityTable<Inspection, "id">;
  inventory: EntityTable<InventoryItem, "id">;
  sales: EntityTable<Sale, "id">;
  hiveStock: EntityTable<HiveStock, "id">;
  honeyStock: EntityTable<HoneyStock, "id">;
  customers: EntityTable<Customer, "id">;
  profile: EntityTable<UserProfile, "id">;
};

db.version(3).stores({
  hives: "++id, name, location, queenStatus, createdAt",
  tasks: "++id, date, type, completed, hiveId",
  inspections: "++id, hiveId, date",
  inventory: "++id, name, category",
  sales: "++id, date, customerName",
  hiveStock: "++id, name, status",
  honeyStock: "++id, type, status",
  customers: "++id, name, phone",
  profile: "++id",
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
}

export { db };
