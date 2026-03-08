import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pill, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { useHives } from "@/hooks/useDatabase";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { toast } from "@/hooks/use-toast";

const TreatmentsPage = () => {
  const hives = useHives() ?? [];
  const treatments = useLiveQuery(() => db.table("treatments").reverse().sortBy("date")) ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    hiveId: 0,
    medication: "",
    dosage: "",
    method: "strip" as string,
    date: new Date().toISOString().split("T")[0],
    endDate: "",
    withdrawalDays: 30,
    notes: "",
  });

  const commonMeds = [
    { name: "أبيستان (Apistan)", withdrawal: 42, target: "فاروا" },
    { name: "أبيغارد (Apiguard)", withdrawal: 14, target: "فاروا" },
    { name: "حمض الأوكساليك", withdrawal: 0, target: "فاروا" },
    { name: "فوماجيلين", withdrawal: 30, target: "نوزيما" },
    { name: "تايلان (Tylan)", withdrawal: 42, target: "تعفن أوروبي" },
    { name: "تيرامايسين", withdrawal: 45, target: "تعفن أمريكي" },
    { name: "محلول سكري 1:1", withdrawal: 0, target: "تغذية" },
    { name: "محلول سكري 2:1", withdrawal: 0, target: "تغذية شتوية" },
  ];

  const handleSelectMed = (medName: string) => {
    const med = commonMeds.find(m => m.name === medName);
    if (med) {
      setForm(f => ({ ...f, medication: med.name, withdrawalDays: med.withdrawal }));
    }
  };

  const handleSave = async () => {
    if (!form.hiveId || !form.medication.trim()) {
      toast({ title: "اختر الخلية والدواء", variant: "destructive" });
      return;
    }
    await db.table("treatments").add({
      ...form,
      medication: form.medication.trim(),
      date: new Date(form.date),
      endDate: form.endDate ? new Date(form.endDate) : undefined,
      createdAt: new Date(),
    });
    setDialogOpen(false);
    setForm({ hiveId: 0, medication: "", dosage: "", method: "strip", date: new Date().toISOString().split("T")[0], endDate: "", withdrawalDays: 30, notes: "" });
    toast({ title: "تم تسجيل العلاج بنجاح 💊" });
  };

  const deleteTreatment = async (id: number) => {
    await db.table("treatments").delete(id);
    toast({ title: "تم حذف العلاج" });
  };

  const isInWithdrawal = (treatment: any) => {
    if (!treatment.withdrawalDays) return false;
    const endDate = new Date(treatment.date);
    endDate.setDate(endDate.getDate() + treatment.withdrawalDays);
    return endDate > new Date();
  };

  const getWithdrawalEnd = (treatment: any) => {
    const endDate = new Date(treatment.date);
    endDate.setDate(endDate.getDate() + treatment.withdrawalDays);
    return endDate.toLocaleDateString("ar-SA");
  };

  return (
    <AppLayout title="سجل العلاجات">
      {/* Active Withdrawal Warnings */}
      {treatments.filter(isInWithdrawal).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="font-bold text-destructive">فترات سحب نشطة</span>
          </div>
          {treatments.filter(isInWithdrawal).map((t: any) => (
            <p key={t.id} className="text-sm text-muted-foreground">
              {hives.find(h => h.id === t.hiveId)?.name}: {t.medication} — لا تحصد حتى {getWithdrawalEnd(t)}
            </p>
          ))}
        </div>
      )}

      {/* Add Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-6 gap-2 gradient-honey text-primary-foreground">
            <Plus className="w-5 h-5" />
            تسجيل علاج جديد
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تسجيل علاج</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>الخلية *</Label>
              <Select onValueChange={v => setForm(f => ({ ...f, hiveId: +v }))}>
                <SelectTrigger><SelectValue placeholder="اختر الخلية" /></SelectTrigger>
                <SelectContent>
                  {hives.map(h => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الدواء *</Label>
              <Select onValueChange={handleSelectMed}>
                <SelectTrigger><SelectValue placeholder="اختر من القائمة" /></SelectTrigger>
                <SelectContent>
                  {commonMeds.map(m => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name} ({m.target})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                placeholder="أو اكتب اسم الدواء يدوياً"
                value={form.medication}
                onChange={e => setForm(f => ({ ...f, medication: e.target.value }))}
              />
            </div>
            <div>
              <Label>الجرعة</Label>
              <Input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} placeholder="مثال: 2 شريحة" />
            </div>
            <div>
              <Label>طريقة التطبيق</Label>
              <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="strip">شرائح</SelectItem>
                  <SelectItem value="spray">رش</SelectItem>
                  <SelectItem value="drip">تنقيط</SelectItem>
                  <SelectItem value="fumigation">تبخير</SelectItem>
                  <SelectItem value="feed">تغذية</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>تاريخ البداية</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <Label>تاريخ النهاية</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>فترة السحب (أيام)</Label>
              <Input type="number" min={0} value={form.withdrawalDays} onChange={e => setForm(f => ({ ...f, withdrawalDays: +e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">المدة قبل جمع العسل بعد العلاج</p>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <Button onClick={handleSave} className="w-full">حفظ العلاج</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Treatments List */}
      <div className="space-y-3">
        {treatments.map((t: any) => {
          const hive = hives.find(h => h.id === t.hiveId);
          const inWithdrawal = isInWithdrawal(t);
          return (
            <div key={t.id} className={`bg-card rounded-2xl p-4 border ${inWithdrawal ? "border-destructive/40" : "border-border"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold flex items-center gap-2">
                    <Pill className="w-4 h-4 text-primary" />
                    {t.medication}
                  </p>
                  <p className="text-sm text-muted-foreground">{hive?.name || "خلية محذوفة"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {inWithdrawal && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      سحب حتى {getWithdrawalEnd(t)}
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteTreatment(t.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {t.dosage && <span>💊 {t.dosage}</span>}
                <span>📅 {new Date(t.date).toLocaleDateString("ar-SA")}</span>
                {t.notes && <span>📝 {t.notes}</span>}
              </div>
            </div>
          );
        })}
        {treatments.length === 0 && (
          <p className="text-center text-muted-foreground py-12">لا توجد سجلات علاج بعد</p>
        )}
      </div>
    </AppLayout>
  );
};

export default TreatmentsPage;
