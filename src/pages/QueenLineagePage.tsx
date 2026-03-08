import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Crown, Plus, GitBranch, Calendar, Trash2, Star } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useHives } from "@/hooks/useDatabase";
import { toast } from "@/hooks/use-toast";

const QueenLineagePage = () => {
  const hives = useHives() ?? [];
  const queens = useLiveQuery(() => db.table("queens").toArray()) ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    hiveId: 0,
    name: "",
    breed: "",
    source: "local" as string,
    parentQueenId: 0,
    introducedDate: new Date().toISOString().split("T")[0],
    marking: "",
    rating: 5,
    notes: "",
    status: "active" as string,
  });

  const breeds = ["كرنيولي", "إيطالي", "قوقازي", "بلدي (عربي)", "باكفاست", "مصري", "أخرى"];
  const sources = [
    { value: "local", label: "تربية محلية" },
    { value: "purchased", label: "مشتراة" },
    { value: "swarm", label: "من طرد" },
    { value: "split", label: "من تقسيم" },
    { value: "emergency", label: "بيت ملكة طوارئ" },
  ];

  const handleSave = async () => {
    if (!form.hiveId) {
      toast({ title: "اختر الخلية", variant: "destructive" });
      return;
    }
    await db.table("queens").add({
      ...form,
      name: form.name.trim() || `ملكة ${hives.find(h => h.id === form.hiveId)?.name}`,
      introducedDate: new Date(form.introducedDate),
      createdAt: new Date(),
    });
    setDialogOpen(false);
    setForm({ hiveId: 0, name: "", breed: "", source: "local", parentQueenId: 0, introducedDate: new Date().toISOString().split("T")[0], marking: "", rating: 5, notes: "", status: "active" });
    toast({ title: "تم إضافة سجل الملكة 👑" });
  };

  const deleteQueen = async (id: number) => {
    await db.table("queens").delete(id);
    toast({ title: "تم حذف السجل" });
  };

  const getChildren = (queenId: number) => queens.filter((q: any) => q.parentQueenId === queenId);

  const statusColors: Record<string, string> = {
    active: "bg-nature/10 text-nature",
    replaced: "bg-muted text-muted-foreground",
    dead: "bg-destructive/10 text-destructive",
    swarmed: "bg-yellow-500/10 text-yellow-600",
  };

  const statusLabels: Record<string, string> = {
    active: "نشطة",
    replaced: "تم استبدالها",
    dead: "نافقة",
    swarmed: "طردت",
  };

  return (
    <AppLayout title="سلالة الملكات">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-6 gap-2 gradient-honey text-primary-foreground">
            <Plus className="w-5 h-5" />
            إضافة ملكة جديدة
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تسجيل ملكة</DialogTitle>
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
              <Label>اسم الملكة</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اختياري" />
            </div>
            <div>
              <Label>السلالة</Label>
              <Select onValueChange={v => setForm(f => ({ ...f, breed: v }))}>
                <SelectTrigger><SelectValue placeholder="اختر السلالة" /></SelectTrigger>
                <SelectContent>
                  {breeds.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المصدر</Label>
              <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sources.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الأم (ملكة سابقة)</Label>
              <Select onValueChange={v => setForm(f => ({ ...f, parentQueenId: +v }))}>
                <SelectTrigger><SelectValue placeholder="بدون أم معروفة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">بدون أم معروفة</SelectItem>
                  {queens.map((q: any) => (
                    <SelectItem key={q.id} value={String(q.id)}>{q.name} ({hives.find(h => h.id === q.hiveId)?.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تاريخ الإدخال</Label>
              <Input type="date" value={form.introducedDate} onChange={e => setForm(f => ({ ...f, introducedDate: e.target.value }))} />
            </div>
            <div>
              <Label>علامة التلوين</Label>
              <Input value={form.marking} onChange={e => setForm(f => ({ ...f, marking: e.target.value }))} placeholder="مثال: أزرق 2025" />
            </div>
            <div>
              <Label>التقييم (1-10)</Label>
              <Input type="number" min={1} max={10} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <Button onClick={handleSave} className="w-full">حفظ</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Queens List */}
      <div className="space-y-3">
        {queens.map((q: any) => {
          const hive = hives.find(h => h.id === q.hiveId);
          const parent = queens.find((p: any) => p.id === q.parentQueenId);
          const children = getChildren(q.id);
          return (
            <div key={q.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{hive?.name || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${statusColors[q.status] || ""}`}>
                    {statusLabels[q.status] || q.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => deleteQueen(q.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                {q.breed && <span>🧬 {q.breed}</span>}
                {q.marking && <span>🎨 {q.marking}</span>}
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-primary" />{q.rating}/10
                </span>
                <span>
                  <Calendar className="w-3 h-3 inline ml-1" />
                  {new Date(q.introducedDate).toLocaleDateString("ar-SA")}
                </span>
              </div>
              {(parent || children.length > 0) && (
                <div className="mt-3 pt-3 border-t border-border text-xs">
                  {parent && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> الأم: {parent.name}
                    </p>
                  )}
                  {children.length > 0 && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <GitBranch className="w-3 h-3 rotate-180" /> البنات: {children.map((c: any) => c.name).join("، ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {queens.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد سجلات ملكات بعد</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default QueenLineagePage;
