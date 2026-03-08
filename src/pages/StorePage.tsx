import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Package, Droplets, Users, Pencil, Trash2 } from "lucide-react";
import { useHiveStock, useHoneyStock, useCustomers, addHiveStock, updateHiveStock, deleteHiveStock, addHoneyStock, updateHoneyStock, deleteHoneyStock, addCustomer, updateCustomer, deleteCustomer } from "@/hooks/useDatabase";
import type { HiveStock, HoneyStock, Customer } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

// --- Hive Stock Tab ---
const HiveStockTab = () => {
  const items = useHiveStock();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<HiveStock | null>(null);
  const [form, setForm] = useState({ name: "", quantity: 1, pricePerUnit: 0, status: "available" as HiveStock["status"], notes: "" });

  const resetForm = () => {
    setForm({ name: "", quantity: 1, pricePerUnit: 0, status: "available", notes: "" });
    setEditItem(null);
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editItem?.id) {
      await updateHiveStock(editItem.id, form);
      toast({ title: "تم التعديل", description: "تم تحديث بيانات الخلية بنجاح" });
    } else {
      await addHiveStock(form);
      toast({ title: "تمت الإضافة", description: "تمت إضافة خلية جديدة للمخزون" });
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (item: HiveStock) => {
    setEditItem(item);
    setForm({ name: item.name, quantity: item.quantity, pricePerUnit: item.pricePerUnit, status: item.status, notes: item.notes || "" });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteHiveStock(id);
    toast({ title: "تم الحذف", description: "تم حذف الخلية من المخزون" });
  };

  const filtered = items?.filter(i => i.name.includes(search)) || [];

  const statusLabel = (s: string) => {
    switch (s) {
      case "available": return "متاح";
      case "sold": return "مباع";
      case "reserved": return "محجوز";
      default: return s;
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "available": return "default" as const;
      case "sold": return "secondary" as const;
      case "reserved": return "outline" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في مخزون الخلايا..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "تعديل خلية" : "إضافة خلية للبيع"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="اسم الخلية / النوع" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="الكمية" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                <Input type="number" placeholder="السعر للوحدة" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: +e.target.value }))} />
              </div>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as HiveStock["status"] }))}>
                <option value="available">متاح</option>
                <option value="reserved">محجوز</option>
                <option value="sold">مباع</option>
              </select>
              <Input placeholder="ملاحظات (اختياري)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button className="w-full" onClick={handleSave}>حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد خلايا في المخزون بعد</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.pricePerUnit} ر.س</TableCell>
                  <TableCell><Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => item.id && handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

// --- Honey Stock Tab ---
const HoneyStockTab = () => {
  const items = useHoneyStock();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<HoneyStock | null>(null);
  const [form, setForm] = useState({ type: "", quantity: 1, unit: "كغ", pricePerUnit: 0, status: "available" as HoneyStock["status"], notes: "" });

  const resetForm = () => {
    setForm({ type: "", quantity: 1, unit: "كغ", pricePerUnit: 0, status: "available", notes: "" });
    setEditItem(null);
  };

  const handleSave = async () => {
    if (!form.type) return;
    if (editItem?.id) {
      await updateHoneyStock(editItem.id, form);
      toast({ title: "تم التعديل", description: "تم تحديث بيانات العسل بنجاح" });
    } else {
      await addHoneyStock(form);
      toast({ title: "تمت الإضافة", description: "تمت إضافة عسل جديد للمخزون" });
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (item: HoneyStock) => {
    setEditItem(item);
    setForm({ type: item.type, quantity: item.quantity, unit: item.unit, pricePerUnit: item.pricePerUnit, status: item.status, notes: item.notes || "" });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteHoneyStock(id);
    toast({ title: "تم الحذف", description: "تم حذف العسل من المخزون" });
  };

  const filtered = items?.filter(i => i.type.includes(search)) || [];

  const statusLabel = (s: string) => {
    switch (s) {
      case "available": return "متاح";
      case "sold": return "مباع";
      case "reserved": return "محجوز";
      default: return s;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في مخزون العسل..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "تعديل عسل" : "إضافة عسل للبيع"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="نوع العسل (سدر، زهور، ...)" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3">
                <Input type="number" placeholder="الكمية" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  <option value="كغ">كغ</option>
                  <option value="غرام">غرام</option>
                  <option value="لتر">لتر</option>
                  <option value="برطمان">برطمان</option>
                </select>
                <Input type="number" placeholder="السعر" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: +e.target.value }))} />
              </div>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as HoneyStock["status"] }))}>
                <option value="available">متاح</option>
                <option value="reserved">محجوز</option>
                <option value="sold">مباع</option>
              </select>
              <Input placeholder="ملاحظات (اختياري)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button className="w-full" onClick={handleSave}>حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا يوجد عسل في المخزون بعد</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.pricePerUnit} ر.س</TableCell>
                  <TableCell><Badge variant={item.status === "available" ? "default" : "secondary"}>{statusLabel(item.status)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => item.id && handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

// --- Customers Tab ---
const CustomersTab = () => {
  const customers = useCustomers();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", location: "", notes: "" });

  const resetForm = () => {
    setForm({ name: "", phone: "", location: "", notes: "" });
    setEditItem(null);
  };

  const handleSave = async () => {
    if (!form.name) return;
    if (editItem?.id) {
      await updateCustomer(editItem.id, form);
      toast({ title: "تم التعديل", description: "تم تحديث بيانات العميل بنجاح" });
    } else {
      await addCustomer(form);
      toast({ title: "تمت الإضافة", description: "تمت إضافة عميل جديد" });
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (item: Customer) => {
    setEditItem(item);
    setForm({ name: item.name, phone: item.phone || "", location: item.location || "", notes: item.notes || "" });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCustomer(id);
    toast({ title: "تم الحذف", description: "تم حذف العميل" });
  };

  const filtered = customers?.filter(c => c.name.includes(search) || (c.phone && c.phone.includes(search))) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو رقم الهاتف..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "تعديل عميل" : "إضافة عميل جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="اسم العميل" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="رقم الهاتف" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Input placeholder="الموقع / المدينة" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <Input placeholder="ملاحظات (اختياري)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button className="w-full" onClick={handleSave}>حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا يوجد عملاء بعد</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell dir="ltr" className="text-right">{item.phone || "-"}</TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => item.id && handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

// --- Main Store Page ---
const StorePage = () => {
  return (
    <AppLayout title="المتجر">
      <Tabs defaultValue="hives" dir="rtl" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="hives" className="gap-1.5">
            <Package className="w-4 h-4" />
            مخزون الخلايا
          </TabsTrigger>
          <TabsTrigger value="honey" className="gap-1.5">
            <Droplets className="w-4 h-4" />
            مخزون العسل
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5">
            <Users className="w-4 h-4" />
            العملاء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hives">
          <HiveStockTab />
        </TabsContent>
        <TabsContent value="honey">
          <HoneyStockTab />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default StorePage;
