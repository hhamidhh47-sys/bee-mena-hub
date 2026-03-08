import { useLiveQuery } from "dexie-react-hooks";
import { db, type Hive, type Task, type UserProfile, type HiveStock, type HoneyStock, type Customer, type Invoice, type Payment } from "@/lib/db";

export function useHives(searchQuery = "") {
  return useLiveQuery(() => {
    if (searchQuery) {
      return db.hives
        .filter(
          (h) =>
            h.name.includes(searchQuery) || h.location.includes(searchQuery)
        )
        .toArray();
    }
    return db.hives.toArray();
  }, [searchQuery]);
}

export function useHive(id: number) {
  return useLiveQuery(() => db.hives.get(id), [id]);
}

export function useTasks(date?: string) {
  return useLiveQuery(() => {
    if (date) {
      return db.tasks.where("date").equals(date).toArray();
    }
    return db.tasks.toArray();
  }, [date]);
}

export function useHiveStats() {
  return useLiveQuery(async () => {
    const all = await db.hives.toArray();
    const healthy = all.filter((h) => h.queenStatus === "mated").length;
    const withAlerts = all.filter((h) => h.alerts && h.alerts > 0).length;
    const totalProduction = all.reduce((s, h) => s + h.honeyProduction, 0);
    return {
      total: all.length,
      healthy,
      withAlerts,
      totalProduction,
    };
  });
}

// Mutations
export async function addHive(hive: Omit<Hive, "id" | "createdAt" | "updatedAt">) {
  return db.hives.add({ ...hive, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateHive(id: number, changes: Partial<Hive>) {
  return db.hives.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteHive(id: number) {
  return db.hives.delete(id);
}

export async function addTask(task: Omit<Task, "id" | "createdAt">) {
  return db.tasks.add({ ...task, createdAt: new Date() });
}

export async function toggleTask(id: number, completed: boolean) {
  return db.tasks.update(id, { completed });
}

export async function deleteTask(id: number) {
  return db.tasks.delete(id);
}

// Profile
export function useProfile() {
  return useLiveQuery(() => db.profile.toCollection().first());
}

export async function updateProfile(changes: Partial<UserProfile>) {
  const profile = await db.profile.toCollection().first();
  if (profile?.id) {
    return db.profile.update(profile.id, changes);
  }
}

// Hive Stock
export function useHiveStock() {
  return useLiveQuery(() => db.hiveStock.toArray());
}

export async function addHiveStock(item: Omit<HiveStock, "id" | "createdAt" | "updatedAt">) {
  return db.hiveStock.add({ ...item, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateHiveStock(id: number, changes: Partial<HiveStock>) {
  return db.hiveStock.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteHiveStock(id: number) {
  return db.hiveStock.delete(id);
}

// Honey Stock
export function useHoneyStock() {
  return useLiveQuery(() => db.honeyStock.toArray());
}

export async function addHoneyStock(item: Omit<HoneyStock, "id" | "createdAt" | "updatedAt">) {
  return db.honeyStock.add({ ...item, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateHoneyStock(id: number, changes: Partial<HoneyStock>) {
  return db.honeyStock.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteHoneyStock(id: number) {
  return db.honeyStock.delete(id);
}

// Customers
export function useCustomers() {
  return useLiveQuery(() => db.customers.toArray());
}

export async function addCustomer(item: Omit<Customer, "id" | "createdAt" | "updatedAt">) {
  return db.customers.add({ ...item, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateCustomer(id: number, changes: Partial<Customer>) {
  return db.customers.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteCustomer(id: number) {
  return db.customers.delete(id);
}
