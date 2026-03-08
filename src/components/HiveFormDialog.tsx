import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import type { Hive } from "@/lib/db";

interface HiveFormData {
  name: string;
  code: string;
  location: string;
  queenStatus: "mated" | "weak" | "virgin" | "cell" | "missing";
  honeyProduction: number;
  frameCount: number;
  notes: string;
}

const defaultForm: HiveFormData = {
  name: "", code: "", location: "", queenStatus: "mated", honeyProduction: 0, frameCount: 10, notes: "",
};

interface HiveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HiveFormData) => Promise<void>;
  initialData?: Partial<Hive> | null;
  title: string;
  submitLabel: string;
}

const HiveFormDialog = ({ open, onOpenChange, onSubmit, initialData, title, submitLabel }: HiveFormDialogProps) => {
  const [form, setForm] = useState<HiveFormData>(defaultForm);

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name || "",
        code: initialData.code || "",
        location: initialData.location || "",
        queenStatus: initialData.queenStatus || "mated",
        honeyProduction: initialData.honeyProduction || 0,
        frameCount: initialData.frameCount || 10,
        notes: initialData.notes || "",
      });
    } else if (open) {
      setForm(defaultForm);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    const name = form.name.trim().slice(0, 100);
    const location = form.location.trim().slice(0, 100);
    if (!name) { toast({ title: "اسم الخلية مطلوب", variant: "destructive" }); return; }
    if (!location) { toast({ title: "الموقع مطلوب", variant: "destructive" }); return; }
    await onSubmit({ ...form, name, location });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto">
          <div>
            <Label>اسم الخلية *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={100} placeholder="مثال: خلية الورد" />
          </div>
          <div>
            <Label>كود الخلية</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} maxLength={50} placeholder="مثال: H-001" />
          </div>
          <div>
            <Label>الموقع *</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} maxLength={100} placeholder="مثال: المزرعة الشمالية" />
          </div>
          <div>
            <Label>حالة الملكة</Label>
            <Select value={form.queenStatus} onValueChange={(v) => setForm((f) => ({ ...f, queenStatus: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mated">ملكة ملقحة</SelectItem>
                <SelectItem value="weak">ملكة ضعيفة</SelectItem>
                <SelectItem value="virgin">ملكة عذراء</SelectItem>
                <SelectItem value="cell">بيت ملكي</SelectItem>
                <SelectItem value="missing">بدون ملكة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>إنتاج العسل (كغ)</Label>
              <Input type="number" value={form.honeyProduction} onChange={(e) => setForm((f) => ({ ...f, honeyProduction: parseFloat(e.target.value) || 0 }))} min={0} />
            </div>
            <div>
              <Label>عدد الإطارات</Label>
              <Input type="number" value={form.frameCount} onChange={(e) => setForm((f) => ({ ...f, frameCount: parseInt(e.target.value) || 0 }))} min={0} max={30} />
            </div>
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} maxLength={500} placeholder="أي ملاحظات إضافية..." rows={3} />
          </div>
          <Button onClick={handleSubmit} className="w-full gradient-honey text-primary-foreground">
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HiveFormDialog;
