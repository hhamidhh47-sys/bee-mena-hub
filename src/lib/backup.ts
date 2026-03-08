import { db } from "@/lib/db";

export async function exportDatabase(): Promise<string> {
  const [hives, tasks, inspections, inventory, sales] = await Promise.all([
    db.hives.toArray(),
    db.tasks.toArray(),
    db.inspections.toArray(),
    db.inventory.toArray(),
    db.sales.toArray(),
  ]);

  const backup = {
    version: 1,
    date: new Date().toISOString(),
    data: { hives, tasks, inspections, inventory, sales },
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadBackup(json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nahali-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDatabase(jsonString: string) {
  const backup = JSON.parse(jsonString);
  if (!backup?.data || backup.version !== 1) {
    throw new Error("ملف النسخة الاحتياطية غير صالح");
  }

  await db.transaction("rw", db.hives, db.tasks, db.inspections, db.inventory, db.sales, async () => {
    await Promise.all([
      db.hives.clear(),
      db.tasks.clear(),
      db.inspections.clear(),
      db.inventory.clear(),
      db.sales.clear(),
    ]);

    const { hives, tasks, inspections, inventory, sales } = backup.data;
    if (hives?.length) await db.hives.bulkAdd(hives.map(({ id, ...rest }: any) => rest));
    if (tasks?.length) await db.tasks.bulkAdd(tasks.map(({ id, ...rest }: any) => rest));
    if (inspections?.length) await db.inspections.bulkAdd(inspections.map(({ id, ...rest }: any) => rest));
    if (inventory?.length) await db.inventory.bulkAdd(inventory.map(({ id, ...rest }: any) => rest));
    if (sales?.length) await db.sales.bulkAdd(sales.map(({ id, ...rest }: any) => rest));
  });
}
