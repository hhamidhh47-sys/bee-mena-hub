import AppLayout from "@/components/AppLayout";
import { User, Settings, Bell, HelpCircle, LogOut, ChevronLeft, Moon, Globe, Download, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import beeLogo from "@/assets/bee-logo.png";
import { useHiveStats } from "@/hooks/useDatabase";
import { useTheme } from "@/hooks/useTheme";
import { exportDatabase, downloadBackup, importDatabase } from "@/lib/backup";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const stats = useHiveStats();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-honey flex items-center justify-center shadow-honey">
          <User className="w-12 h-12 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-1">أحمد محمد</h2>
        <p className="text-muted-foreground text-sm">نحّال محترف منذ 2018</p>
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
            <p className="text-xl font-bold text-accent">6</p>
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
            {item.toggle ? <Switch /> : <ChevronLeft className="w-5 h-5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">تسجيل الخروج</span>
      </button>

      <p className="text-center text-xs text-muted-foreground mt-8">نحّالي الإصدار 1.0.0</p>
    </AppLayout>
  );
};

export default ProfilePage;
