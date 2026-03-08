import AppLayout from "@/components/AppLayout";
import HiveCard from "@/components/HiveCard";
import HiveFormDialog from "@/components/HiveFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useHives, useHiveStats, addHive, updateHive, addHiveStock, addHoneyStock } from "@/hooks/useDatabase";
import { toast } from "@/hooks/use-toast";
import type { Hive } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const HivesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingHive, setEditingHive] = useState<Hive | null>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellHive, setSellHive] = useState<Hive | null>(null);
  const [sellType, setSellType] = useState<"hive" | "honey">("hive");
  const [sellPrice, setSellPrice] = useState(0);
  const [sellQuantity, setSellQuantity] = useState(1);
  const hives = useHives(searchQuery);
  const stats = useHiveStats();
  const navigate = useNavigate();

  const handleAdd = async (data: any) => {
    await addHive({
      name: data.name,
      code: data.code.trim() || undefined,
      location: data.location,
      queenStatus: data.queenStatus,
      lastInspection: "جديدة",
      honeyProduction: Math.max(0, data.honeyProduction),
      frameCount: Math.max(0, data.frameCount),
      notes: data.notes.trim() || undefined,
    });
    toast({ title: "تمت إضافة الخلية بنجاح ✅" });
  };

  const handleEdit = async (data: any) => {
    if (!editingHive?.id) return;
    await updateHive(editingHive.id, {
      name: data.name,
      code: data.code.trim() || undefined,
      location: data.location,
      queenStatus: data.queenStatus,
      honeyProduction: Math.max(0, data.honeyProduction),
      frameCount: Math.max(0, data.frameCount),
      notes: data.notes.trim() || undefined,
    });
    setEditingHive(null);
    toast({ title: "تم تعديل الخلية بنجاح ✅" });
  };

  const openEdit = (hive: Hive) => {
    setEditingHive(hive);
    setEditOpen(true);
  };

  const openSell = (hive: Hive) => {
    setSellHive(hive);
    setSellPrice(0);
    setSellQuantity(1);
    setSellType("hive");
    setSellOpen(true);
  };

  const handleSellToStore = async () => {
    if (!sellHive) return;
    if (sellType === "hive") {
      await addHiveStock({
        name: sellHive.name,
        quantity: sellQuantity,
        pricePerUnit: sellPrice,
        status: "available",
        notes: `من خلية: ${sellHive.name} - ${sellHive.location}`,
      });
      toast({ title: "تمت إضافة الخلية للمتجر ✅" });
    } else {
      await addHoneyStock({
        type: `عسل ${sellHive.name}`,
        quantity: sellQuantity,
        unit: "كغ",
        pricePerUnit: sellPrice,
        status: "available",
        notes: `من خلية: ${sellHive.name}`,
      });
      toast({ title: "تمت إضافة العسل للمتجر ✅" });
    }
    setSellOpen(false);
    setSellHive(null);
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
          <HiveCard key={hive.id} id={String(hive.id)} {...hive} onClick={() => openEdit(hive)} />
        ))}
        {hives?.length === 0 && (
          <p className="text-muted-foreground text-center col-span-2 py-8">
            لا توجد خلايا مطابقة للبحث
          </p>
        )}
      </div>

      {/* Add Dialog */}
      <HiveFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        title="إضافة خلية جديدة"
        submitLabel="إضافة الخلية"
      />

      {/* Edit Dialog */}
      <HiveFormDialog
        open={editOpen}
        onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingHive(null); }}
        onSubmit={handleEdit}
        initialData={editingHive}
        title="تعديل الخلية"
        submitLabel="حفظ التعديلات"
      />

      {/* Add Button */}
      <Button
        onClick={() => setAddOpen(true)}
        className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </AppLayout>
  );
};

export default HivesPage;
