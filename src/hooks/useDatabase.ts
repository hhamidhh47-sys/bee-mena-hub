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

export async function generateCustomerCode() {
  const count = await db.customers.count();
  const num = String(count + 1).padStart(4, "0");
  return `C-${num}`;
}

export async function addCustomer(item: Omit<Customer, "id" | "createdAt" | "updatedAt">) {
  const code = item.code || await generateCustomerCode();
  return db.customers.add({ ...item, code, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateCustomer(id: number, changes: Partial<Customer>) {
  return db.customers.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteCustomer(id: number) {
  return db.customers.delete(id);
}

// Invoices
export function useInvoices(customerId?: number) {
  return useLiveQuery(() => {
    if (customerId) {
      return db.invoices.where("customerId").equals(customerId).reverse().sortBy("date");
    }
    return db.invoices.reverse().sortBy("date");
  }, [customerId]);
}

export function useInvoice(id: number) {
  return useLiveQuery(() => db.invoices.get(id), [id]);
}

export async function generateInvoiceNumber() {
  const count = await db.invoices.count();
  const num = String(count + 1).padStart(4, "0");
  return `INV-${num}`;
}

export async function addInvoice(invoice: Omit<Invoice, "id" | "createdAt">) {
  return db.invoices.add({ ...invoice, createdAt: new Date() });
}

export async function updateInvoice(id: number, changes: Partial<Invoice>) {
  return db.invoices.update(id, changes);
}

export async function deleteInvoice(id: number) {
  await db.payments.where("invoiceId").equals(id).delete();
  return db.invoices.delete(id);
}

// Payments
export function usePayments(invoiceId?: number) {
  return useLiveQuery(() => {
    if (invoiceId) {
      return db.payments.where("invoiceId").equals(invoiceId).toArray();
    }
    return db.payments.toArray();
  }, [invoiceId]);
}

export async function addPayment(payment: Omit<Payment, "id" | "createdAt">) {
  const id = await db.payments.add({ ...payment, createdAt: new Date() });
  // Update invoice paid amount and status
  const invoice = await db.invoices.get(payment.invoiceId);
  if (invoice) {
    const allPayments = await db.payments.where("invoiceId").equals(payment.invoiceId).toArray();
    const totalPaid = allPayments.reduce((s, p) => s + p.amount, 0);
    const status = totalPaid >= invoice.totalAmount ? "paid" : totalPaid > 0 ? "partial" : "unpaid";
    await db.invoices.update(payment.invoiceId, { paidAmount: totalPaid, status });
  }
  return id;
}

// Customer debts
export function useCustomerDebts() {
  return useLiveQuery(async () => {
    const invoices = await db.invoices.where("status").anyOf("unpaid", "partial").toArray();
    const debtMap = new Map<string, { customerId?: number; customerName: string; totalDebt: number; invoiceCount: number }>();
    for (const inv of invoices) {
      const key = inv.customerName;
      const existing = debtMap.get(key);
      const debt = inv.totalAmount - inv.paidAmount;
      if (existing) {
        existing.totalDebt += debt;
        existing.invoiceCount += 1;
      } else {
        debtMap.set(key, { customerId: inv.customerId, customerName: inv.customerName, totalDebt: debt, invoiceCount: 1 });
      }
    }
    return Array.from(debtMap.values()).sort((a, b) => b.totalDebt - a.totalDebt);
  });
}
