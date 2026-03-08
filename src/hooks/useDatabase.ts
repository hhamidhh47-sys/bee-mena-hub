import { useLiveQuery } from "dexie-react-hooks";
import { db, type Hive, type Task } from "@/lib/db";

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
    const healthy = all.filter((h) => h.queenStatus === "healthy").length;
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
