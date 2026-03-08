import AppLayout from "@/components/AppLayout";
import { User, Settings, Bell, HelpCircle, LogOut, ChevronLeft, Moon, Globe, Download, Upload, Pencil, MapPin, Phone, Mail, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import beeLogo from "@/assets/bee-logo.png";
import { useHiveStats, useProfile, updateProfile } from "@/hooks/useDatabase";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { exportDatabase, downloadBackup, importDatabase } from "@/lib/backup";
import { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const stats = useHiveStats();
  const profile = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { logout, authEnabled, setAuthRequired, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    startYear: 2018,
    phone: "",
    email: "",
    location: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        title: profile.title || "",
        startYear: profile.startYear || 2018,
        phone: profile.phone || "",
        email: profile.email || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const trimmed = {
      name: form.name.trim().slice(0, 100),
      title: form.title.trim().slice(0, 100),
      startYear: Math.max(1950, Math.min(new Date().getFullYear(), form.startYear)),
      phone: form.phone.trim().slice(0, 20),
      email: form.email.trim().slice(0, 255),
      location: form.location.trim().slice(0, 100),
    };
    if (!trimmed.name) {
      toast({ title: "الاسم مطلوب", variant: "destructive" });
      return;
    }
    await updateProfile(trimmed);
    setEditOpen(false);
    toast({ title: "تم تحديث الملف الشخصي ✅" });
  };

  const handleExport = async () => {
    try {
      const json = await exportDatabase();
      downloadBackup(json);
      toast({ title: "تم حفظ النسخة الاحتياطية بنجاح ✅" });
    } catch {
      toast({ title: "حدث خطأ أثناء الحفظ", variant: "destructive" });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importDatabase(text);
      toast({ title: "تم استعادة البيانات بنجاح ✅" });
    } catch {
      toast({ title: "ملف النسخة الاحتياطية غير صالح", variant: "destructive" });
    }
    e.target.value = "";
  };

  const yearsExperience = new Date().getFullYear() - (profile?.startYear || 2018);

  const menuItems = [
    { icon: Bell, label: "الإشعارات", value: "مفعّلة" },
    { icon: Globe, label: "اللغة", value: "العربية" },
    { icon: Moon, label: "الوضع الليلي", toggle: true },
    { icon: Settings, label: "إعدادات التطبيق" },
    { icon: HelpCircle, label: "المساعدة والدعم" },
  ];

  return (
    <AppLayout title="حسابي">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-center relative">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 left-3">
              <Pencil className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>الاسم *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={100}
                  placeholder="اسمك الكامل"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={100}
                  placeholder="مثال: نحّال محترف"
                />
              </div>
              <div>
                <Label>سنة البداية</Label>
                <Input
                  type="number"
                  value={form.startYear}
                  onChange={(e) => setForm((f) => ({ ...f, startYear: parseInt(e.target.value) || 2018 }))}
                  min={1950}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  maxLength={20}
                  placeholder="+966..."
                  dir="ltr"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  maxLength={255}
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>الموقع</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  maxLength={100}
                  placeholder="المدينة أو المنطقة"
                />
              </div>
              <Button onClick={handleSaveProfile} className="w-full gradient-honey text-primary-foreground">
                حفظ التغييرات
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-honey flex items-center justify-center shadow-honey">
          <User className="w-12 h-12 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-1">{profile?.name || "..."}</h2>
        <p className="text-muted-foreground text-sm">{profile?.title || ""} منذ {profile?.startYear || ""}</p>

        {/* Contact info */}
        {(profile?.location || profile?.phone || profile?.email) && (
          <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs text-muted-foreground">
            {profile?.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
            )}
            {profile?.phone && (
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.phone}</span>
            )}
            {profile?.email && (
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.email}</span>
            )}
          </div>
        )}

        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xl font-bold text-primary">{stats?.total ?? 0}</p>
            <p className="text-xs text-muted-foreground">خلية</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-nature">{stats?.totalProduction ?? 0}</p>
            <p className="text-xs text-muted-foreground">كغ عسل</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-accent">{yearsExperience}</p>
            <p className="text-xs text-muted-foreground">سنوات</p>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <h3 className="font-bold mb-3">النسخ الاحتياطي</h3>
        <div className="flex gap-3">
          <Button onClick={handleExport} className="flex-1 gap-2" variant="outline">
            <Download className="w-4 h-4" />
            حفظ البيانات
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} className="flex-1 gap-2" variant="outline">
            <Upload className="w-4 h-4" />
            استعادة البيانات
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Subscription Badge */}
      <div className="gradient-nature rounded-2xl p-4 mb-6 flex items-center gap-4 text-secondary-foreground">
        <img src={beeLogo} alt="Premium" className="w-12 h-12" />
        <div className="flex-1">
          <p className="font-bold">عضوية ذهبية</p>
          <p className="text-sm opacity-90">صالحة حتى ديسمبر 2026</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              {item.value && <p className="text-sm text-muted-foreground">{item.value}</p>}
            </div>
            {item.toggle ? <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} /> : <ChevronLeft className="w-5 h-5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">تسجيل الخروج</span>
      </button>

      <p className="text-center text-xs text-muted-foreground mt-8">نحّالي الإصدار 1.0.0</p>
    </AppLayout>
  );
};

export default ProfilePage;
