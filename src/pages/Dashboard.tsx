import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import HiveCard from "@/components/HiveCard";
import TaskCard from "@/components/TaskCard";
import { Grid3X3, Droplets, AlertTriangle, TrendingUp, Plus, ChevronLeft, X, Bug, CalendarPlus, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-honey.jpg";
import { useHives, useHiveStats, useTasks, useProfile } from "@/hooks/useDatabase";
import { useState } from "react";

const Dashboard = () => {
  const [fabOpen, setFabOpen] = useState(false);
  const navigate = useNavigate();
  const hives = useHives();
  const hiveStats = useHiveStats();
  const tasks = useTasks(new Date().toISOString().split("T")[0]);
  const profile = useProfile();

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
      value: hiveStats?.withAlerts ?? 0,
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

  const recentHives = (hives ?? []).slice(0, 2);
  const upcomingTasks = (tasks ?? []).filter((t) => !t.completed).slice(0, 3);

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
              لديك {upcomingTasks.length} مهام اليوم و {hiveStats?.withAlerts ?? 0} تنبيهات جديدة
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
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

      {/* Quick Action */}
      <Button className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground">
        <Plus className="w-6 h-6" />
      </Button>
    </AppLayout>
  );
};

export default Dashboard;
