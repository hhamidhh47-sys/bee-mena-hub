import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Save, X, ChevronRight, Bug, Droplets, Crown, Users, Thermometer, AlertTriangle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useHive } from "@/hooks/useDatabase";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

const InspectionPage = () => {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const hive = useHive(Number(hiveId));

  const [form, setForm] = useState({
    queenStatus: "mated" as "mated" | "weak" | "virgin" | "cell" | "missing",
    beeCount: "medium" as "low" | "medium" | "high",
    honeyProduction: 0,
    diseases: "",
    notes: "",
    temperament: "calm" as "calm" | "moderate" | "aggressive",
    broodPattern: "good" as "good" | "spotty" | "none",
    foodStores: "sufficient" as "low" | "sufficient" | "abundant",
    varroa: "none" as "none" | "low" | "moderate" | "high",
    swarmCells: false,
  });

  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "حجم الصورة كبير جداً (الحد 5 ميجا)", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!hiveId) return;
    
    await db.inspections.add({
      hiveId: Number(hiveId),
      date: new Date(),
      queenStatus: form.queenStatus,
      beeCount: form.beeCount,
      honeyProduction: form.honeyProduction,
      diseases: form.diseases || undefined,
      notes: form.notes || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });

    // Update hive with latest inspection data
    await db.hives.update(Number(hiveId), {
      queenStatus: form.queenStatus,
      lastInspection: "اليوم",
      honeyProduction: form.honeyProduction,
      updatedAt: new Date(),
    });

    toast({ title: "تم حفظ الفحص بنجاح ✅" });
    navigate(`/hives`);
  };

  if (!hive) {
    return (
      <AppLayout title="فحص الخلية">
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      </AppLayout>
    );
  }

  const queenStatusOptions = [
    { value: "mated", label: "ملقحة", icon: "👑", color: "bg-nature/10 text-nature" },
    { value: "weak", label: "ضعيفة", icon: "⚠️", color: "bg-yellow-500/10 text-yellow-600" },
    { value: "virgin", label: "عذراء", icon: "🌸", color: "bg-primary/10 text-primary" },
    { value: "cell", label: "بيت ملكة", icon: "🏠", color: "bg-accent/10 text-accent" },
    { value: "missing", label: "مفقودة", icon: "❌", color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <AppLayout title={`فحص: ${hive.name}`}>
      {/* Hive Info Header */}
      <div className="bg-card rounded-2xl p-4 border border-border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{hive.name}</h3>
            <p className="text-sm text-muted-foreground">{hive.location}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date().toLocaleDateString("ar-SA")}
          </Badge>
        </div>
      </div>

      {/* Queen Status */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">حالة الملكة</Label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {queenStatusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, queenStatus: opt.value as any }))}
              className={`rounded-xl p-3 border-2 transition-all text-center ${
                form.queenStatus === opt.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-xl block mb-1">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bee Population */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">كثافة النحل</Label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "low", label: "قليل", emoji: "🐝" },
            { value: "medium", label: "متوسط", emoji: "🐝🐝" },
            { value: "high", label: "كثيف", emoji: "🐝🐝🐝" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, beeCount: opt.value as any }))}
              className={`rounded-xl p-3 border-2 transition-all text-center ${
                form.beeCount === opt.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-lg block mb-1">{opt.emoji}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Honey Production */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">إنتاج العسل (كغ)</Label>
        </div>
        <Input
          type="number"
          min={0}
          value={form.honeyProduction}
          onChange={e => setForm(f => ({ ...f, honeyProduction: +e.target.value }))}
          className="text-lg"
        />
      </section>

      {/* Brood Pattern */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">نمط الحضنة</Label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "good", label: "جيد", emoji: "✅" },
            { value: "spotty", label: "متقطع", emoji: "⚠️" },
            { value: "none", label: "لا يوجد", emoji: "❌" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, broodPattern: opt.value as any }))}
              className={`rounded-xl p-3 border-2 transition-all text-center ${
                form.broodPattern === opt.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-lg block mb-1">{opt.emoji}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Food Stores */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Thermometer className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">مخزون الغذاء</Label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "low", label: "منخفض", emoji: "🔴" },
            { value: "sufficient", label: "كافٍ", emoji: "🟡" },
            { value: "abundant", label: "وفير", emoji: "🟢" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, foodStores: opt.value as any }))}
              className={`rounded-xl p-3 border-2 transition-all text-center ${
                form.foodStores === opt.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-lg block mb-1">{opt.emoji}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Varroa */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bug className="w-5 h-5 text-destructive" />
          <Label className="font-bold text-base">حلم الفاروا</Label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: "none", label: "لا يوجد", emoji: "✅" },
            { value: "low", label: "قليل", emoji: "🟡" },
            { value: "moderate", label: "متوسط", emoji: "🟠" },
            { value: "high", label: "شديد", emoji: "🔴" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setForm(f => ({ ...f, varroa: opt.value as any }))}
              className={`rounded-xl p-2 border-2 transition-all text-center ${
                form.varroa === opt.value
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-lg block">{opt.emoji}</span>
              <span className="text-[10px] font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Swarm Cells */}
      <section className="mb-6">
        <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">بيوت تطريد</span>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, swarmCells: !f.swarmCells }))}
            className={`w-14 h-7 rounded-full transition-all ${
              form.swarmCells ? "bg-destructive" : "bg-muted"
            } relative`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
              form.swarmCells ? "right-1" : "left-1"
            }`} />
          </button>
        </div>
      </section>

      {/* Diseases */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Bug className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">أمراض أو آفات</Label>
        </div>
        <Input
          placeholder="مثال: تعفن أمريكي، نوزيما..."
          value={form.diseases}
          onChange={e => setForm(f => ({ ...f, diseases: e.target.value }))}
        />
      </section>

      {/* Photos */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="w-5 h-5 text-primary" />
          <Label className="font-bold text-base">صور الفحص</Label>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <img src={photo} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          
          <label className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
            <Camera className="w-6 h-6 text-primary/50 mb-1" />
            <span className="text-[10px] text-muted-foreground">إضافة صورة</span>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">يمكنك إضافة حتى 10 صور (الحد الأقصى 5 ميجا لكل صورة)</p>
      </section>

      {/* Notes */}
      <section className="mb-6">
        <Label className="font-bold text-base mb-3 block">ملاحظات إضافية</Label>
        <Textarea
          placeholder="أي ملاحظات عن حالة الخلية..."
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </section>

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <Button className="flex-1 h-12 text-base" onClick={handleSave}>
          <Save className="w-5 h-5 ml-2" />
          حفظ الفحص
        </Button>
        <Button variant="outline" className="h-12" onClick={() => navigate("/hives")}>
          إلغاء
        </Button>
      </div>
    </AppLayout>
  );
};

export default InspectionPage;
