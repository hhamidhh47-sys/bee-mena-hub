import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import AppLayout from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Package, Droplets, Users, Pencil, Trash2, Check, ChevronsUpDown, Receipt, AlertCircle, DollarSign, Eye, X, Phone, MapPin, Printer } from "lucide-react";
import { useHives, useHiveStock, useHoneyStock, useCustomers, addHiveStock, updateHiveStock, deleteHiveStock, addHoneyStock, updateHoneyStock, deleteHoneyStock, addCustomer, updateCustomer, deleteCustomer, useInvoices, addInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber, useCustomerDebts, addPayment, usePayments } from "@/hooks/useDatabase";
import type { HiveStock, HoneyStock, Customer, InvoiceItem } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Hive Stock Tab ---
const HiveStockTab = () => {
  const items = useHiveStock();
  const hives = useHives();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<HiveStock | null>(null);
  const [form, setForm] = useState({ name: "", quantity: 1, pricePerUnit: 0, status: "available" as HiveStock["status"], notes: "" });
  const [hivePickerOpen, setHivePickerOpen] = useState(false);

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
              <div>
                <Label>اختر خلية</Label>
                <Popover open={hivePickerOpen} onOpenChange={setHivePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                      {form.name || "ابحث واختر من خلاياك..."}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ابحث بالاسم أو الكود..." />
                      <CommandList>
                        <CommandEmpty>لا توجد خلايا مطابقة</CommandEmpty>
                        <CommandGroup>
                          {hives?.map(h => (
                            <CommandItem
                              key={h.id}
                              value={`${h.name} ${h.code || ""} ${h.location}`}
                              onSelect={() => {
                                setForm(f => ({ ...f, name: h.name }));
                                setHivePickerOpen(false);
                              }}
                            >
                              <Check className={cn("ml-2 h-4 w-4", form.name === h.name ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <span>{h.name} {h.code ? `(${h.code})` : ""}</span>
                                <span className="text-xs text-muted-foreground">{h.location}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الكمية</Label>
                  <Input type="number" placeholder="الكمية" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                </div>
                <div>
                  <Label>السعر للوحدة</Label>
                  <Input type="number" placeholder="السعر للوحدة" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: +e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as HiveStock["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="reserved">محجوز</SelectItem>
                    <SelectItem value="sold">مباع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
  const hives = useHives();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<HoneyStock | null>(null);
  const [form, setForm] = useState({ type: "", quantity: 1, unit: "كغ", pricePerUnit: 0, status: "available" as HoneyStock["status"], notes: "" });
  const [honeyHivePickerOpen, setHoneyHivePickerOpen] = useState(false);

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
              <div>
                <Label>مصدر العسل (خلية)</Label>
                <Popover open={honeyHivePickerOpen} onOpenChange={setHoneyHivePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                      {form.type || "ابحث واختر الخلية المصدر..."}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ابحث بالاسم أو الكود..." />
                      <CommandList>
                        <CommandEmpty>لا توجد خلايا مطابقة</CommandEmpty>
                        <CommandGroup heading="خلاياك">
                          {hives?.map(h => (
                            <CommandItem
                              key={h.id}
                              value={`${h.name} ${h.code || ""} ${h.location}`}
                              onSelect={() => {
                                setForm(f => ({ ...f, type: `عسل ${h.name}` }));
                                setHoneyHivePickerOpen(false);
                              }}
                            >
                              <Check className={cn("ml-2 h-4 w-4", form.type === `عسل ${h.name}` ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <span>{h.name} {h.code ? `(${h.code})` : ""}</span>
                                <span className="text-xs text-muted-foreground">{h.location} - {h.honeyProduction} كغ</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="أنواع عامة">
                          {["سدر", "زهور", "طلح", "أخرى"].map(t => (
                            <CommandItem
                              key={t}
                              value={t}
                              onSelect={() => {
                                setForm(f => ({ ...f, type: t }));
                                setHoneyHivePickerOpen(false);
                              }}
                            >
                              <Check className={cn("ml-2 h-4 w-4", form.type === t ? "opacity-100" : "opacity-0")} />
                              {t}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>الكمية</Label>
                  <Input type="number" placeholder="الكمية" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                </div>
                <div>
                  <Label>الوحدة</Label>
                  <Select value={form.unit} onValueChange={(v) => setForm(f => ({ ...f, unit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="كغ">كغ</SelectItem>
                      <SelectItem value="غرام">غرام</SelectItem>
                      <SelectItem value="لتر">لتر</SelectItem>
                      <SelectItem value="برطمان">برطمان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>السعر</Label>
                  <Input type="number" placeholder="السعر" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: +e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as HoneyStock["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="reserved">محجوز</SelectItem>
                    <SelectItem value="sold">مباع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

// --- Customer Detail Dialog ---
const CustomerDetailDialog = ({ customerId, onClose, onOpenInvoice }: { customerId: number; onClose: () => void; onOpenInvoice: (id: number) => void }) => {
  const customer = useLiveQuery(() => db.customers.get(customerId), [customerId]);
  const invoices = useInvoices(customerId);

  if (!customer) return null;

  const totalInvoices = invoices?.reduce((s, i) => s + i.totalAmount, 0) || 0;
  const totalPaid = invoices?.reduce((s, i) => s + i.paidAmount, 0) || 0;
  const totalDebt = totalInvoices - totalPaid;

  const statusLabel = (s: string) => {
    switch (s) { case "paid": return "مدفوعة"; case "partial": return "جزئية"; case "unpaid": return "غير مدفوعة"; default: return s; }
  };
  const statusVariant = (s: string) => {
    switch (s) { case "paid": return "default" as const; case "partial": return "outline" as const; case "unpaid": return "destructive" as const; default: return "default" as const; }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل العميل</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold">{customer.name}</h3>
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{customer.phone}</span>
              </div>
            )}
            {customer.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{customer.location}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">الفواتير</p>
                <p className="text-lg font-bold">{invoices?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">المدفوع</p>
                <p className="text-lg font-bold text-primary">{totalPaid} <span className="text-xs">ر.س</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">الديون</p>
                <p className={cn("text-lg font-bold", totalDebt > 0 ? "text-destructive" : "text-primary")}>{totalDebt} <span className="text-xs">ر.س</span></p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">الفواتير ({invoices?.length || 0})</Label>
            {(!invoices || invoices.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد فواتير لهذا العميل</p>
            ) : (
              <div className="space-y-2">
                {invoices.map(inv => (
                  <Card key={inv.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { onClose(); onOpenInvoice(inv.id!); }}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString("ar-SA")}</p>
                        </div>
                        <div className="text-left">
                          <Badge variant={statusVariant(inv.status)}>{statusLabel(inv.status)}</Badge>
                          <p className="text-sm font-semibold mt-1">{inv.totalAmount} ر.س</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {customer.notes && (
            <p className="text-sm text-muted-foreground">ملاحظات: {customer.notes}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
  const [detailCustomerId, setDetailCustomerId] = useState<number | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = useState<number | null>(null);

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
      {detailCustomerId && (
        <CustomerDetailDialog
          customerId={detailCustomerId}
          onClose={() => setDetailCustomerId(null)}
          onOpenInvoice={(id) => setDetailInvoiceId(id)}
        />
      )}
      {detailInvoiceId && (
        <InvoiceViewDialog invoiceId={detailInvoiceId} onClose={() => setDetailInvoiceId(null)} />
      )}

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
                <TableRow key={item.id} className="cursor-pointer" onClick={() => item.id && setDetailCustomerId(item.id)}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell dir="ltr" className="text-right">{item.phone || "-"}</TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
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

// --- Sales/Invoices Tab ---
const SalesTab = () => {
  const invoices = useInvoices();
  const customers = useCustomers();
  const hiveStock = useHiveStock();
  const honeyStock = useHoneyStock();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewInvoice, setViewInvoice] = useState<number | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerId: undefined as number | undefined,
    items: [] as InvoiceItem[],
    paidAmount: 0,
    notes: "",
    dueDate: "",
  });

  const [newItem, setNewItem] = useState({ productType: "honey" as "hive" | "honey" | "other", productName: "", quantity: 1, unitPrice: 0 });

  const resetForm = () => {
    setForm({ customerName: "", customerId: undefined, items: [], paidAmount: 0, notes: "", dueDate: "" });
    setNewItem({ productType: "honey", productName: "", quantity: 1, unitPrice: 0 });
  };

  const addItemToInvoice = () => {
    if (!newItem.productName || newItem.quantity <= 0) return;
    const total = newItem.quantity * newItem.unitPrice;
    setForm(f => ({
      ...f,
      items: [...f.items, { ...newItem, total }],
    }));
    setNewItem({ productType: "honey", productName: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (idx: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const totalAmount = form.items.reduce((s, i) => s + i.total, 0);

  const handleSave = async () => {
    if (!form.customerName || form.items.length === 0) {
      toast({ title: "يجب اختيار عميل وإضافة منتج واحد على الأقل", variant: "destructive" });
      return;
    }
    const invoiceNumber = await generateInvoiceNumber();
    const status = form.paidAmount >= totalAmount ? "paid" : form.paidAmount > 0 ? "partial" : "unpaid";
    await addInvoice({
      invoiceNumber,
      customerId: form.customerId,
      customerName: form.customerName,
      items: form.items,
      totalAmount,
      paidAmount: form.paidAmount,
      status: status as "paid" | "partial" | "unpaid",
      date: new Date(),
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      notes: form.notes || undefined,
    });
    toast({ title: "تم إنشاء الفاتورة بنجاح ✅", description: `فاتورة رقم ${invoiceNumber}` });
    resetForm();
    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteInvoice(id);
    toast({ title: "تم حذف الفاتورة" });
  };

  const filtered = invoices?.filter(i =>
    i.customerName.includes(search) || i.invoiceNumber.includes(search)
  ) || [];

  const statusLabel = (s: string) => {
    switch (s) {
      case "paid": return "مدفوعة";
      case "partial": return "مدفوعة جزئياً";
      case "unpaid": return "غير مدفوعة";
      default: return s;
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "paid": return "default" as const;
      case "partial": return "outline" as const;
      case "unpaid": return "destructive" as const;
      default: return "default" as const;
    }
  };

  // Available products for adding
  const availableProducts = [
    ...(hiveStock?.filter(h => h.status === "available").map(h => ({ type: "hive" as const, name: h.name, price: h.pricePerUnit })) || []),
    ...(honeyStock?.filter(h => h.status === "available").map(h => ({ type: "honey" as const, name: h.type, price: h.pricePerUnit })) || []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث بالعميل أو رقم الفاتورة..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 ml-1" /> فاتورة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Customer selector */}
              <div>
                <Label>العميل</Label>
                <Popover open={customerPickerOpen} onOpenChange={setCustomerPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                      {form.customerName || "اختر العميل..."}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ابحث بالاسم أو الهاتف..." />
                      <CommandList>
                        <CommandEmpty>لا يوجد عملاء مطابقون</CommandEmpty>
                        <CommandGroup>
                          {customers?.map(c => (
                            <CommandItem
                              key={c.id}
                              value={`${c.name} ${c.phone || ""}`}
                              onSelect={() => {
                                setForm(f => ({ ...f, customerName: c.name, customerId: c.id }));
                                setCustomerPickerOpen(false);
                              }}
                            >
                              <Check className={cn("ml-2 h-4 w-4", form.customerName === c.name ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <span>{c.name}</span>
                                <span className="text-xs text-muted-foreground">{c.phone || ""} {c.location ? `- ${c.location}` : ""}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Add product item */}
              <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                <Label className="text-sm font-semibold">إضافة منتج</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newItem.productType} onValueChange={(v) => setNewItem(n => ({ ...n, productType: v as any, productName: "" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hive">خلية</SelectItem>
                      <SelectItem value="honey">عسل</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  {newItem.productType === "other" ? (
                    <Input placeholder="اسم المنتج" value={newItem.productName} onChange={e => setNewItem(n => ({ ...n, productName: e.target.value }))} />
                  ) : (
                    <Select value={newItem.productName} onValueChange={(v) => {
                      const product = availableProducts.find(p => p.name === v && p.type === newItem.productType);
                      setNewItem(n => ({ ...n, productName: v, unitPrice: product?.price || 0 }));
                    }}>
                      <SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                      <SelectContent>
                        {availableProducts.filter(p => p.type === newItem.productType).map((p, i) => (
                          <SelectItem key={i} value={p.name}>{p.name} - {p.price} ر.س</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">الكمية</Label>
                    <Input type="number" min={1} value={newItem.quantity} onChange={e => setNewItem(n => ({ ...n, quantity: +e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">سعر الوحدة</Label>
                    <Input type="number" min={0} value={newItem.unitPrice} onChange={e => setNewItem(n => ({ ...n, unitPrice: +e.target.value }))} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={addItemToInvoice}>
                  <Plus className="w-3 h-3 ml-1" /> إضافة للفاتورة
                </Button>
              </div>

              {/* Items list */}
              {form.items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right text-xs">المنتج</TableHead>
                        <TableHead className="text-right text-xs">الكمية</TableHead>
                        <TableHead className="text-right text-xs">المجموع</TableHead>
                        <TableHead className="text-xs w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm">{item.productName}</TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm">{item.total} ر.س</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(idx)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Totals */}
              <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>الإجمالي:</span>
                  <span>{totalAmount} ر.س</span>
                </div>
                <div>
                  <Label className="text-xs">المبلغ المدفوع</Label>
                  <Input type="number" min={0} max={totalAmount} value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: +e.target.value }))} />
                </div>
                {form.paidAmount < totalAmount && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>المتبقي (دين):</span>
                    <span>{totalAmount - form.paidAmount} ر.س</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs">تاريخ الاستحقاق (اختياري)</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <Input placeholder="ملاحظات (اختياري)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <Button className="w-full" onClick={handleSave}>إنشاء الفاتورة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice View Dialog */}
      {viewInvoice && <InvoiceViewDialog invoiceId={viewInvoice} onClose={() => setViewInvoice(null)} />}

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد فواتير بعد</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => (
            <Card key={inv.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewInvoice(inv.id!)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{inv.customerName}</p>
                  </div>
                  <Badge variant={statusVariant(inv.status)}>{statusLabel(inv.status)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(inv.date).toLocaleDateString("ar-SA")}</span>
                  <span className="font-semibold">{inv.totalAmount} ر.س</span>
                </div>
                {inv.status !== "paid" && (
                  <p className="text-xs text-destructive mt-1">متبقي: {inv.totalAmount - inv.paidAmount} ر.س</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Invoice View Dialog ---
const InvoiceViewDialog = ({ invoiceId, onClose }: { invoiceId: number; onClose: () => void }) => {
  const { toast } = useToast();
  const invoice = useLiveQuery(() => db.invoices.get(invoiceId), [invoiceId]);
  const payments = usePayments(invoiceId);
  const customers = useCustomers();
  const hiveStock = useHiveStock();
  const honeyStock = useHoneyStock();
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<"cash" | "transfer" | "other">("cash");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    customerName: string;
    customerId?: number;
    items: InvoiceItem[];
    notes: string;
    dueDate: string;
  }>({ customerName: "", items: [], notes: "", dueDate: "" });
  const [editCustomerPicker, setEditCustomerPicker] = useState(false);
  const [editNewItem, setEditNewItem] = useState({ productType: "honey" as "hive" | "honey" | "other", productName: "", quantity: 1, unitPrice: 0 });

  if (!invoice) return null;

  const remaining = invoice.totalAmount - invoice.paidAmount;

  const startEditing = () => {
    setEditForm({
      customerName: invoice.customerName,
      customerId: invoice.customerId,
      items: [...invoice.items],
      notes: invoice.notes || "",
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
    });
    setIsEditing(true);
  };

  const editTotalAmount = editForm.items.reduce((s, i) => s + i.total, 0);

  const addEditItem = () => {
    if (!editNewItem.productName || editNewItem.quantity <= 0) return;
    const total = editNewItem.quantity * editNewItem.unitPrice;
    setEditForm(f => ({ ...f, items: [...f.items, { ...editNewItem, total }] }));
    setEditNewItem({ productType: "honey", productName: "", quantity: 1, unitPrice: 0 });
  };

  const removeEditItem = (idx: number) => {
    setEditForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const availableProducts = [
    ...(hiveStock?.filter(h => h.status === "available").map(h => ({ type: "hive" as const, name: h.name, price: h.pricePerUnit })) || []),
    ...(honeyStock?.filter(h => h.status === "available").map(h => ({ type: "honey" as const, name: h.type, price: h.pricePerUnit })) || []),
  ];

  const handleSaveEdit = async () => {
    if (!editForm.customerName || editForm.items.length === 0) {
      toast({ title: "يجب اختيار عميل وإضافة منتج واحد على الأقل", variant: "destructive" });
      return;
    }
    const newTotal = editForm.items.reduce((s, i) => s + i.total, 0);
    const status = invoice.paidAmount >= newTotal ? "paid" : invoice.paidAmount > 0 ? "partial" : "unpaid";
    await updateInvoice(invoiceId, {
      customerName: editForm.customerName,
      customerId: editForm.customerId,
      items: editForm.items,
      totalAmount: newTotal,
      status,
      notes: editForm.notes || undefined,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
    });
    toast({ title: "تم تعديل الفاتورة ✅" });
    setIsEditing(false);
  };

  const handlePay = async () => {
    if (payAmount <= 0) return;
    await addPayment({
      invoiceId,
      customerId: invoice.customerId,
      amount: Math.min(payAmount, remaining),
      method: payMethod,
      date: new Date(),
    });
    toast({ title: "تم تسجيل الدفعة ✅" });
    setPayOpen(false);
    setPayAmount(0);
  };

  const handlePrint = () => {
    const itemsRows = invoice.items.map(item =>
      `<tr><td style="padding:8px;border-bottom:1px solid #e5e5e5">${item.productName}</td><td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center">${item.unitPrice}</td><td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:left">${item.total} ر.س</td></tr>`
    ).join("");

    const paymentsRows = payments?.length ? payments.map(p =>
      `<tr><td style="padding:6px;border-bottom:1px solid #eee">${new Date(p.date).toLocaleDateString("ar-SA")}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${p.method === "cash" ? "نقداً" : p.method === "transfer" ? "تحويل" : "أخرى"}</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:left">${p.amount} ر.س</td></tr>`
    ).join("") : "";

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>فاتورة ${invoice.invoiceNumber}</title><style>
      body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;padding:40px;color:#333;direction:rtl}
      .header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #d4a020}
      .header h1{margin:0;color:#d4a020;font-size:28px}
      .header p{margin:4px 0;color:#666;font-size:14px}
      .info{display:flex;justify-content:space-between;margin-bottom:24px}
      .info div{font-size:14px}
      .info .label{color:#888;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#f8f4e8;padding:10px 8px;text-align:right;font-size:13px;color:#666;border-bottom:2px solid #d4a020}
      td{font-size:14px}
      .totals{background:#f8f8f5;border-radius:8px;padding:16px;margin-bottom:20px}
      .totals .row{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
      .totals .row.bold{font-weight:bold;font-size:16px;border-top:1px solid #ddd;padding-top:8px;margin-top:4px}
      .payments{margin-top:16px}
      .payments h3{font-size:15px;margin-bottom:8px;color:#666}
      .notes{margin-top:16px;padding:12px;background:#fffef5;border-right:3px solid #d4a020;border-radius:4px;font-size:13px;color:#666}
      .footer{text-align:center;margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999}
      @media print{body{padding:20px}button{display:none!important}}
    </style></head><body>
      <div class="header">
        <h1>🐝 فاتورة مبيعات</h1>
        <p>رقم الفاتورة: <strong>${invoice.invoiceNumber}</strong></p>
      </div>
      <div class="info">
        <div><span class="label">العميل</span><br/><strong>${invoice.customerName}</strong></div>
        <div><span class="label">التاريخ</span><br/><strong>${new Date(invoice.date).toLocaleDateString("ar-SA")}</strong></div>
        <div><span class="label">الحالة</span><br/><strong>${invoice.status === "paid" ? "✅ مدفوعة" : invoice.status === "partial" ? "⏳ جزئية" : "❌ غير مدفوعة"}</strong></div>
      </div>
      <table>
        <thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:center">سعر الوحدة</th><th style="text-align:left">المجموع</th></tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div class="totals">
        <div class="row bold"><span>الإجمالي</span><span>${invoice.totalAmount} ر.س</span></div>
        <div class="row" style="color:#4a8c5c"><span>المدفوع</span><span>${invoice.paidAmount} ر.س</span></div>
        ${remaining > 0 ? `<div class="row" style="color:#dc2626"><span>المتبقي</span><span>${remaining} ر.س</span></div>` : ""}
      </div>
      ${paymentsRows ? `<div class="payments"><h3>سجل الدفعات</h3><table><thead><tr><th>التاريخ</th><th style="text-align:center">الطريقة</th><th style="text-align:left">المبلغ</th></tr></thead><tbody>${paymentsRows}</tbody></table></div>` : ""}
      ${invoice.notes ? `<div class="notes"><strong>ملاحظات:</strong> ${invoice.notes}</div>` : ""}
      <div class="footer">تم إنشاء هذه الفاتورة من نظام إدارة المناحل</div>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) { setIsEditing(false); onClose(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>فاتورة {invoice.invoiceNumber}</DialogTitle>
            {!isEditing && (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-3 h-3 ml-1" /> طباعة
                </Button>
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="w-3 h-3 ml-1" /> تعديل
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label>العميل</Label>
              <Popover open={editCustomerPicker} onOpenChange={setEditCustomerPicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {editForm.customerName || "اختر العميل..."}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث بالاسم..." />
                    <CommandList>
                      <CommandEmpty>لا يوجد عملاء مطابقون</CommandEmpty>
                      <CommandGroup>
                        {customers?.map(c => (
                          <CommandItem key={c.id} value={`${c.name} ${c.phone || ""}`} onSelect={() => { setEditForm(f => ({ ...f, customerName: c.name, customerId: c.id })); setEditCustomerPicker(false); }}>
                            <Check className={cn("ml-2 h-4 w-4", editForm.customerName === c.name ? "opacity-100" : "opacity-0")} />
                            <span>{c.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {editForm.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right text-xs">المنتج</TableHead>
                      <TableHead className="text-right text-xs">الكمية</TableHead>
                      <TableHead className="text-right text-xs">المجموع</TableHead>
                      <TableHead className="text-xs w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editForm.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{item.productName}</TableCell>
                        <TableCell className="text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-sm">{item.total} ر.س</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEditItem(idx)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
              <Label className="text-sm font-semibold">إضافة منتج</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={editNewItem.productType} onValueChange={(v) => setEditNewItem(n => ({ ...n, productType: v as any, productName: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hive">خلية</SelectItem>
                    <SelectItem value="honey">عسل</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
                {editNewItem.productType === "other" ? (
                  <Input placeholder="اسم المنتج" value={editNewItem.productName} onChange={e => setEditNewItem(n => ({ ...n, productName: e.target.value }))} />
                ) : (
                  <Select value={editNewItem.productName} onValueChange={(v) => {
                    const product = availableProducts.find(p => p.name === v && p.type === editNewItem.productType);
                    setEditNewItem(n => ({ ...n, productName: v, unitPrice: product?.price || 0 }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                    <SelectContent>
                      {availableProducts.filter(p => p.type === editNewItem.productType).map((p, i) => (
                        <SelectItem key={i} value={p.name}>{p.name} - {p.price} ر.س</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">الكمية</Label>
                  <Input type="number" min={1} value={editNewItem.quantity} onChange={e => setEditNewItem(n => ({ ...n, quantity: +e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">سعر الوحدة</Label>
                  <Input type="number" min={0} value={editNewItem.unitPrice} onChange={e => setEditNewItem(n => ({ ...n, unitPrice: +e.target.value }))} />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={addEditItem}>
                <Plus className="w-3 h-3 ml-1" /> إضافة للفاتورة
              </Button>
            </div>

            <div className="bg-primary/5 rounded-lg p-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>الإجمالي الجديد:</span>
                <span>{editTotalAmount} ر.س</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">تاريخ الاستحقاق</Label>
              <Input type="date" value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>

            <div>
              <Label className="text-xs">ملاحظات</Label>
              <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSaveEdit}>حفظ التعديلات</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>إلغاء</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">العميل</p>
                <p className="font-medium">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">التاريخ</p>
                <p className="font-medium">{new Date(invoice.date).toLocaleDateString("ar-SA")}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-xs">المنتج</TableHead>
                  <TableHead className="text-right text-xs">الكمية</TableHead>
                  <TableHead className="text-right text-xs">السعر</TableHead>
                  <TableHead className="text-right text-xs">المجموع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm">{item.productName}</TableCell>
                    <TableCell className="text-sm">{item.quantity}</TableCell>
                    <TableCell className="text-sm">{item.unitPrice}</TableCell>
                    <TableCell className="text-sm">{item.total} ر.س</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between font-bold">
                <span>الإجمالي</span><span>{invoice.totalAmount} ر.س</span>
              </div>
              <div className="flex justify-between text-nature">
                <span>المدفوع</span><span>{invoice.paidAmount} ر.س</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between text-destructive font-semibold">
                  <span>المتبقي</span><span>{remaining} ر.س</span>
                </div>
              )}
            </div>

            {payments && payments.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">سجل الدفعات</Label>
                <div className="space-y-1">
                  {payments.map(p => (
                    <div key={p.id} className="flex justify-between text-sm bg-card border rounded-md px-3 py-2">
                      <span>{new Date(p.date).toLocaleDateString("ar-SA")}</span>
                      <span className="text-muted-foreground">{p.method === "cash" ? "نقداً" : p.method === "transfer" ? "تحويل" : "أخرى"}</span>
                      <span className="font-medium text-nature">{p.amount} ر.س</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {remaining > 0 && (
              <>
                {payOpen ? (
                  <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                    <Label className="text-sm">تسجيل دفعة جديدة</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="المبلغ" min={1} max={remaining} value={payAmount} onChange={e => setPayAmount(+e.target.value)} />
                      <Select value={payMethod} onValueChange={(v) => setPayMethod(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">نقداً</SelectItem>
                          <SelectItem value="transfer">تحويل</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handlePay}>تأكيد الدفع</Button>
                      <Button variant="outline" onClick={() => setPayOpen(false)}>إلغاء</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => { setPayAmount(remaining); setPayOpen(true); }}>
                    <DollarSign className="w-4 h-4 ml-1" /> تسجيل دفعة
                  </Button>
                )}
              </>
            )}

            {invoice.notes && (
              <p className="text-sm text-muted-foreground">ملاحظات: {invoice.notes}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- Debts Tab ---
const DebtsTab = () => {
  const debts = useCustomerDebts();
  const totalDebt = debts?.reduce((s, d) => s + d.totalDebt, 0) || 0;

  return (
    <div className="space-y-4">
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">إجمالي الديون</p>
          <p className="text-3xl font-bold text-destructive">{totalDebt} ر.س</p>
          <p className="text-xs text-muted-foreground mt-1">{debts?.length || 0} عملاء لديهم ديون</p>
        </CardContent>
      </Card>

      {(!debts || debts.length === 0) ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">لا توجد ديون مستحقة 🎉</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {debts.map((d, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{d.customerName}</p>
                    <p className="text-xs text-muted-foreground">{d.invoiceCount} فاتورة غير مسددة</p>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-destructive">{d.totalDebt} ر.س</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Store Page ---
const StorePage = () => {
  return (
    <AppLayout title="المتجر">
      <Tabs defaultValue="sales" dir="rtl" className="w-full">
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="sales" className="gap-1 text-xs px-1">
            <Receipt className="w-3.5 h-3.5" />
            المبيعات
          </TabsTrigger>
          <TabsTrigger value="debts" className="gap-1 text-xs px-1">
            <AlertCircle className="w-3.5 h-3.5" />
            الديون
          </TabsTrigger>
          <TabsTrigger value="hives" className="gap-1 text-xs px-1">
            <Package className="w-3.5 h-3.5" />
            الخلايا
          </TabsTrigger>
          <TabsTrigger value="honey" className="gap-1 text-xs px-1">
            <Droplets className="w-3.5 h-3.5" />
            العسل
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1 text-xs px-1">
            <Users className="w-3.5 h-3.5" />
            العملاء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesTab />
        </TabsContent>
        <TabsContent value="debts">
          <DebtsTab />
        </TabsContent>
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
