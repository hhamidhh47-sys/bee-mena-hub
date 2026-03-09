import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import HiveCard from "@/components/HiveCard";
import TaskCard from "@/components/TaskCard";
import { Grid3X3, Droplets, AlertTriangle, TrendingUp, Plus, ChevronLeft, X, Bug, CalendarPlus, Wheat, Cloud, Flower2, BookOpen, Users, MapPin, QrCode, Pill, Calculator, Timer, Download, Crown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-honey.jpg";
import { useHives, useHiveStats, useTasks, useProfile } from "@/hooks/useDatabase";
import { useState } from "react";
import { generateHiveAlerts } from "@/lib/smartSuggestions";
import WeatherAlerts from "@/components/WeatherAlerts";

const Dashboard = () => {
  const [fabOpen, setFabOpen] = useState(false);
  const navigate = useNavigate();
  const hives = useHives() ?? [];
  const hiveStats = useHiveStats();
  const tasks = useTasks(new Date().toISOString().split("T")[0]);
  const profile = useProfile();

  const alerts = generateHiveAlerts(hives);
  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const warningAlerts = alerts.filter(a => a.severity === "warning");

  const stats = [
    {
      title: "إجمالي الخلايا",
      value: hiveStats?.total ?? 0,
      icon: <Grid3X3 className="w-5 h-5" />,
      variant: "honey" as const,
      trend: { value: 12, label: "هذا الشهر" },
    },
    {
      title: "إنتاج العسل",
      value: `${hiveStats?.totalProduction ?? 0} كغ`,
      icon: <Droplets className="w-5 h-5" />,
      variant: "nature" as const,
      trend: { value: 8, label: "من الشهر الماضي" },
    },
    {
      title: "تنبيهات",
      value: criticalAlerts.length + warningAlerts.length,
      icon: <AlertTriangle className="w-5 h-5" />,
      variant: "warm" as const,
    },
    {
      title: "نمو الإنتاج",
      value: "+23%",
      icon: <TrendingUp className="w-5 h-5" />,
      variant: "default" as const,
    },
  ];

  const recentHives = hives.slice(0, 2);
  const upcomingTasks = (tasks ?? []).filter((t) => !t.completed).slice(0, 3);

  const severityStyles: Record<string, string> = {
    critical: "border-destructive/60 bg-destructive/10",
    warning: "border-yellow-500/60 bg-yellow-500/10",
    info: "border-primary/40 bg-primary/5",
  };

  return (
    <AppLayout title="نحّالي">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-6 mb-8 overflow-hidden">
        <div className="relative h-48">
          <img src={heroImage} alt="عسل طبيعي" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 right-4 left-4">
            <h2 className="text-2xl font-bold text-foreground mb-1">صباح الخير، {profile?.name || "نحّال"}! 🐝</h2>
            <p className="text-muted-foreground">
              لديك {upcomingTasks.length} مهام اليوم و {criticalAlerts.length + warningAlerts.length} تنبيهات
            </p>
          </div>
        </div>
      </section>

      {/* Critical Alerts */}
      {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            تنبيهات مهمة
          </h3>
          <div className="space-y-2">
            {[...criticalAlerts, ...warningAlerts].slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border ${severityStyles[alert.severity]} transition-all`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {(criticalAlerts.length + warningAlerts.length) > 4 && (
              <Link to="/schedule" className="block text-center text-sm text-primary hover:underline py-1">
                عرض كل التنبيهات ({criticalAlerts.length + warningAlerts.length})
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Quick Access - Features */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3">اكتشف المزيد</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Cloud, label: "الطقس", path: "/weather", color: "bg-blue-500/10 text-blue-500" },
            { icon: Flower2, label: "المواسم", path: "/seasons", color: "bg-nature/10 text-nature" },
            { icon: BookOpen, label: "التعلّم", path: "/education", color: "bg-primary/10 text-primary" },
            { icon: Users, label: "الخبراء", path: "/experts", color: "bg-accent/10 text-accent" },
            { icon: MapPin, label: "الخريطة", path: "/map", color: "bg-blue-600/10 text-blue-600" },
            { icon: QrCode, label: "QR", path: "/qrcode", color: "bg-muted text-foreground" },
            { icon: Pill, label: "العلاجات", path: "/treatments", color: "bg-destructive/10 text-destructive" },
            { icon: Crown, label: "الملكات", path: "/queens", color: "bg-primary/10 text-primary" },
            { icon: Calculator, label: "التغذية", path: "/feeding", color: "bg-nature/10 text-nature" },
            { icon: Timer, label: "المدخن", path: "/smoker-timer", color: "bg-accent/10 text-accent" },
            { icon: DollarSign, label: "العائد", path: "/roi", color: "bg-nature/10 text-nature" },
            { icon: Download, label: "تصدير", path: "/export", color: "bg-muted text-foreground" },
          ].map(item => (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Hives */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">الخلايا الأخيرة</h3>
          <Link to="/hives" className="flex items-center gap-1 text-sm text-primary hover:underline">
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentHives.map((hive) => (
            <HiveCard key={hive.id} id={String(hive.id)} {...hive} />
          ))}
        </div>
      </section>

      {/* Weather Alerts */}
      <section className="mb-8">
        <WeatherAlerts />
      </section>

      {/* Upcoming Tasks */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">المهام القادمة</h3>
          <Link to="/schedule" className="flex items-center gap-1 text-sm text-primary hover:underline">
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <TaskCard key={task.id} {...task} />
          ))}
          {upcomingTasks.length === 0 && (
            <p className="text-muted-foreground text-center py-4">لا توجد مهام لليوم</p>
          )}
        </div>
      </section>

      {/* Quick Actions FAB */}
      {fabOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setFabOpen(false)} />
      )}
      <div className="fixed left-4 bottom-24 z-50 flex flex-col-reverse items-center gap-3">
        {fabOpen && (
          <>
            <Button
              onClick={() => { setFabOpen(false); navigate("/hives"); }}
              className="w-12 h-12 rounded-full shadow-lg bg-nature text-nature-foreground hover:bg-nature/90 animate-in fade-in slide-in-from-bottom-2"
            >
              <Bug className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => { setFabOpen(false); navigate("/schedule"); }}
              className="w-12 h-12 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90 animate-in fade-in slide-in-from-bottom-2"
            >
              <CalendarPlus className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => { setFabOpen(false); navigate("/analytics"); }}
              className="w-12 h-12 rounded-full shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 animate-in fade-in slide-in-from-bottom-2"
            >
              <Wheat className="w-5 h-5" />
            </Button>
          </>
        )}
        <Button
          onClick={() => setFabOpen((o) => !o)}
          className="w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground transition-transform duration-200"
          style={{ transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
