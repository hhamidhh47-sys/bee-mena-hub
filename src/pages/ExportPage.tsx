import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Table, ClipboardCheck, Pill, ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "@/hooks/use-toast";

type ExportType = "hives" | "inspections" | "tasks" | "treatments" | "sales" | "inventory";

const ExportPage = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportConfigs: { key: ExportType; label: string; icon: any }[] = [
    { key: "hives", label: "الخلايا", icon: Table },
    { key: "inspections", label: "الفحوصات", icon: ClipboardCheck },
    { key: "tasks", label: "المهام", icon: FileSpreadsheet },
    { key: "treatments", label: "العلاجات", icon: Pill },
    { key: "sales", label: "المبيعات", icon: ShoppingBag },
    { key: "inventory", label: "المخزون", icon: Table },
  ];

  const toCSV = (headers: string[], rows: string[][]) => {
    const bom = "\uFEFF"; // UTF-8 BOM for Arabic support in Excel
    const headerLine = headers.join(",");
    const dataLines = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","));
    return bom + [headerLine, ...dataLines].join("\n");
  };

  const exportData = async (type: ExportType) => {
    setExporting(type);
    try {
      let csv = "";
      let filename = "";

      switch (type) {
        case "hives": {
          const data = await db.hives.toArray();
          csv = toCSV(
            ["الرقم", "الاسم", "الموقع", "حالة الملكة", "آخر فحص", "إنتاج العسل", "التنبيهات", "الملاحظات"],
            data.map(h => [String(h.id), h.name, h.location, h.queenStatus, h.lastInspection, String(h.honeyProduction), String(h.alerts || 0), h.notes || ""])
          );
          filename = "خلايا";
          break;
        }
        case "inspections": {
          const data = await db.inspections.toArray();
          csv = toCSV(
            ["الرقم", "رقم الخلية", "التاريخ", "حالة الملكة", "كثافة النحل", "إنتاج العسل", "الأمراض", "الملاحظات"],
            data.map(i => [String(i.id), String(i.hiveId), new Date(i.date).toLocaleDateString("ar-SA"), i.queenStatus, i.beeCount, String(i.honeyProduction), i.diseases || "", i.notes || ""])
          );
          filename = "فحوصات";
          break;
        }
        case "tasks": {
          const data = await db.tasks.toArray();
          csv = toCSV(
            ["الرقم", "العنوان", "الوصف", "التاريخ", "الوقت", "النوع", "مكتمل"],
            data.map(t => [String(t.id), t.title, t.description, t.date, t.time, t.type, t.completed ? "نعم" : "لا"])
          );
          filename = "مهام";
          break;
        }
        case "treatments": {
          const data = await db.table("treatments").toArray();
          csv = toCSV(
            ["الرقم", "رقم الخلية", "الدواء", "الجرعة", "التاريخ", "فترة السحب", "ملاحظات"],
            data.map((t: any) => [String(t.id), String(t.hiveId), t.medication, t.dosage || "", new Date(t.date).toLocaleDateString("ar-SA"), String(t.withdrawalDays || 0), t.notes || ""])
          );
          filename = "علاجات";
          break;
        }
        case "sales": {
          const data = await db.sales.toArray();
          csv = toCSV(
            ["الرقم", "المنتج", "الكمية", "السعر", "العميل", "التاريخ", "ملاحظات"],
            data.map(s => [String(s.id), s.product, String(s.quantity), String(s.price), s.customerName || "", new Date(s.date).toLocaleDateString("ar-SA"), s.notes || ""])
          );
          filename = "مبيعات";
          break;
        }
        case "inventory": {
          const data = await db.inventory.toArray();
          csv = toCSV(
            ["الرقم", "الاسم", "الفئة", "الكمية", "الوحدة", "ملاحظات"],
            data.map(i => [String(i.id), i.name, i.category, String(i.quantity), i.unit, i.notes || ""])
          );
          filename = "مخزون";
          break;
        }
      }

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: `تم تصدير ${exportConfigs.find(c => c.key === type)?.label} بنجاح 📊` });
    } catch (err) {
      toast({ title: "حدث خطأ أثناء التصدير", variant: "destructive" });
    }
    setExporting(null);
  };

  return (
    <AppLayout title="تصدير البيانات">
      <p className="text-muted-foreground text-sm mb-6 text-center">
        صدّر بياناتك بصيغة CSV لفتحها في Excel أو Google Sheets
      </p>

      <div className="space-y-3">
        {exportConfigs.map(config => (
          <button
            key={config.key}
            onClick={() => exportData(config.key)}
            disabled={exporting === config.key}
            className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-honey hover:border-primary/30 transition-all disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <config.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold">{config.label}</p>
              <p className="text-xs text-muted-foreground">تصدير كملف CSV</p>
            </div>
            <Download className={`w-5 h-5 text-primary ${exporting === config.key ? "animate-bounce" : ""}`} />
          </button>
        ))}
      </div>

      <div className="mt-8 bg-muted/50 rounded-2xl p-4">
        <h3 className="font-bold mb-2 text-sm">💡 ملاحظات</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• الملفات بصيغة CSV متوافقة مع Excel و Google Sheets</li>
          <li>• الملفات مشفرة بـ UTF-8 لدعم اللغة العربية</li>
          <li>• للنسخ الاحتياطي الكامل، استخدم خيار "حفظ البيانات" في صفحة الحساب</li>
        </ul>
      </div>
    </AppLayout>
  );
};

export default ExportPage;
