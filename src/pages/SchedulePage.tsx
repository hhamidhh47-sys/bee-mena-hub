import AppLayout from "@/components/AppLayout";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

const SchedulePage = () => {
  const [selectedDay, setSelectedDay] = useState(8);

  const days = [
    { num: 6, name: "سبت" },
    { num: 7, name: "أحد" },
    { num: 8, name: "إثنين" },
    { num: 9, name: "ثلاثاء" },
    { num: 10, name: "أربعاء" },
    { num: 11, name: "خميس" },
    { num: 12, name: "جمعة" },
  ];

  const tasks = [
    {
      title: "فحص خلية الورد",
      description: "فحص دوري للملكة والإنتاج",
      time: "10:00 صباحاً",
      type: "inspection" as const,
      completed: false,
    },
    {
      title: "تغذية الخلايا 5-10",
      description: "تغذية شتوية بمحلول السكر",
      time: "11:30 صباحاً",
      type: "feeding" as const,
      completed: true,
    },
    {
      title: "حصاد خلية البرتقال",
      description: "حصاد العسل الموسمي",
      time: "2:00 مساءً",
      type: "harvest" as const,
      completed: false,
    },
    {
      title: "إعطاء الدواء لخلية السدر",
      description: "علاج الفاروا الدوري",
      time: "4:00 مساءً",
      type: "medication" as const,
      completed: false,
    },
  ];

  const monthlyTasks = [
    { title: "فحص شامل للخلايا", date: "15 مارس", status: "upcoming" },
    { title: "موسم إزهار الحمضيات", date: "20-30 مارس", status: "upcoming" },
    { title: "تجهيز صناديق العسل", date: "25 مارس", status: "upcoming" },
  ];

  return (
    <AppLayout title="الجدولة والتذكيرات">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold">مارس 2026</h2>
        <Button variant="ghost" size="icon">
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Days Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {days.map((day) => (
          <button
            key={day.num}
            onClick={() => setSelectedDay(day.num)}
            className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[60px] transition-all ${
              selectedDay === day.num
                ? "gradient-honey text-primary-foreground shadow-honey"
                : "bg-card border border-border"
            }`}
          >
            <span className="text-xs opacity-80">{day.name}</span>
            <span className="text-lg font-bold">{day.num}</span>
          </button>
        ))}
      </div>

      {/* Today's Tasks */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">مهام اليوم</h3>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </div>
      </section>

      {/* Monthly Overview */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">نظرة عامة على الشهر</h3>
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="space-y-4">
            {monthlyTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Tips */}
      <section className="mb-8">
        <div className="gradient-nature rounded-2xl p-5 text-secondary-foreground">
          <h4 className="font-bold mb-2">🌸 نصيحة الموسم</h4>
          <p className="text-sm opacity-90">
            موسم إزهار الحمضيات على الأبواب! تأكد من تجهيز صناديق العسل الإضافية واستعد للحصاد الوفير.
          </p>
        </div>
      </section>

      {/* Add Button */}
      <Button className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground">
        <Plus className="w-6 h-6" />
      </Button>
    </AppLayout>
  );
};

export default SchedulePage;
