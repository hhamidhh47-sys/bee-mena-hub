import AppLayout from "@/components/AppLayout";
import HiveCard from "@/components/HiveCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useHives, useHiveStats, addHive } from "@/hooks/useDatabase";
import { toast } from "@/hooks/use-toast";

const HivesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const hives = useHives(searchQuery);
  const stats = useHiveStats();

  const [form, setForm] = useState({
    name: "",
    location: "",
    queenStatus: "healthy" as "healthy" | "weak" | "missing",
    honeyProduction: 0,
  });

  const resetForm = () => {
    setForm({ name: "", location: "", queenStatus: "healthy", honeyProduction: 0 });
  };

  const handleAdd = async () => {
    const name = form.name.trim().slice(0, 100);
    const location = form.location.trim().slice(0, 100);
    if (!name) {
      toast({ title: "اسم الخلية مطلوب", variant: "destructive" });
      return;
    }
    if (!location) {
      toast({ title: "الموقع مطلوب", variant: "destructive" });
      return;
    }
    await addHive({
      name,
      location,
      queenStatus: form.queenStatus,
      lastInspection: "جديدة",
      honeyProduction: Math.max(0, form.honeyProduction),
    });
    resetForm();
    setAddOpen(false);
    toast({ title: "تمت إضافة الخلية بنجاح ✅" });
  };

  return (
    <AppLayout title="خلايا النحل">
      {/* Summary */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-nature/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-nature">{stats?.healthy ?? 0}</p>
          <p className="text-xs text-muted-foreground">خلايا صحية</p>
        </div>
        <div className="flex-1 bg-destructive/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{stats?.withAlerts ?? 0}</p>
          <p className="text-xs text-muted-foreground">تحتاج اهتمام</p>
        </div>
        <div className="flex-1 bg-primary/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats?.total ?? 0}</p>
          <p className="text-xs text-muted-foreground">إجمالي الخلايا</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن خلية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card"
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Hives Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {hives?.map((hive) => (
          <HiveCard key={hive.id} id={String(hive.id)} {...hive} />
        ))}
        {hives?.length === 0 && (
          <p className="text-muted-foreground text-center col-span-2 py-8">
            لا توجد خلايا مطابقة للبحث
          </p>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>إضافة خلية جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>اسم الخلية *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={100}
                placeholder="مثال: خلية الورد"
              />
            </div>
            <div>
              <Label>الموقع *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                maxLength={100}
                placeholder="مثال: المزرعة الشمالية"
              />
            </div>
            <div>
              <Label>حالة الملكة</Label>
              <Select
                value={form.queenStatus}
                onValueChange={(v) => setForm((f) => ({ ...f, queenStatus: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">صحية</SelectItem>
                  <SelectItem value="weak">ضعيفة</SelectItem>
                  <SelectItem value="missing">غائبة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>إنتاج العسل (كغ)</Label>
              <Input
                type="number"
                value={form.honeyProduction}
                onChange={(e) => setForm((f) => ({ ...f, honeyProduction: parseFloat(e.target.value) || 0 }))}
                min={0}
              />
            </div>
            <Button onClick={handleAdd} className="w-full gradient-honey text-primary-foreground">
              إضافة الخلية
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Button */}
      <Button
        onClick={() => { resetForm(); setAddOpen(true); }}
        className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </AppLayout>
  );
};

export default HivesPage;
