import AppLayout from "@/components/AppLayout";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronRight, ChevronLeft, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTasks, toggleTask, addTask, useHives } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { generateSmartSuggestions, type SmartSuggestion } from "@/lib/smartSuggestions";

const SchedulePage = () => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [open, setOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const selectedDate = new Date(today.getFullYear(), today.getMonth(), selectedDay);
  const dateStr = selectedDate.toISOString().split("T")[0];
  const tasks = useTasks(dateStr);
  const allTasks = useTasks() ?? [];
  const hives = useHives() ?? [];

  const suggestions = generateSmartSuggestions(hives, allTasks);

  const [form, setForm] = useState({
    title: "",
    description: "",
    time: "",
    type: "inspection" as "inspection" | "feeding" | "harvest" | "medication" | "other",
  });

  const resetForm = () => setForm({ title: "", description: "", time: "", type: "inspection" });

  const handleAdd = async () => {
    if (!form.title) return;
    await addTask({ ...form, date: dateStr, completed: false });
    toast({ title: "تمت الإضافة", description: "تمت إضافة المهمة بنجاح" });
    resetForm();
    setOpen(false);
  };

  const handleAddSuggestion = async (s: SmartSuggestion) => {
    await addTask({
      title: s.title,
      description: s.description,
      time: "",
      date: dateStr,
      type: s.type,
      completed: false,
      hiveId: s.hiveId,
    });
    toast({ title: "تمت الإضافة ✅", description: s.title });
  };

  // Generate week days around today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    const dayNames = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
    return { num: d.getDate(), name: dayNames[d.getDay()] };
  });

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  const typeLabels: Record<string, string> = {
    inspection: "فحص",
    feeding: "تغذية",
    harvest: "حصاد",
    medication: "علاج",
    other: "أخرى",
  };

  const priorityColors: Record<string, string> = {
    high: "border-destructive/50 bg-destructive/5",
    medium: "border-yellow-500/50 bg-yellow-500/5",
    low: "border-primary/30 bg-primary/5",
  };

  const priorityLabels: Record<string, string> = {
    high: "عاجل",
    medium: "متوسط",
    low: "منخفض",
  };

  const handleToggle = async (taskId: number, completed: boolean) => {
    await toggleTask(taskId, !completed);
  };

  return (
    <AppLayout title="الجدولة والتذكيرات">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold">{monthNames[today.getMonth()]} {today.getFullYear()}</h2>
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

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <section className="mb-6">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 mb-3 w-full"
          >
            <div className="flex items-center gap-2 flex-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">اقتراحات ذكية</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {suggestions.length}
              </span>
            </div>
            <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${showSuggestions ? "rotate-90" : ""}`} />
          </button>

          {showSuggestions && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border ${priorityColors[s.priority]} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{s.title}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          s.priority === "high" ? "bg-destructive/20 text-destructive" :
                          s.priority === "medium" ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {priorityLabels[s.priority]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                      {s.hiveName && (
                        <p className="text-[10px] text-muted-foreground mt-1">🐝 {s.hiveName}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-8 text-xs"
                      onClick={() => handleAddSuggestion(s)}
                    >
                      <Plus className="w-3 h-3 ml-1" />
                      إضافة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Today's Tasks */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">مهام اليوم</h3>
        <div className="space-y-3">
          {tasks?.map((task) => (
            <div key={task.id} onClick={() => handleToggle(task.id!, task.completed)}>
              <TaskCard {...task} />
            </div>
          ))}
          {tasks?.length === 0 && (
            <p className="text-muted-foreground text-center py-8">لا توجد مهام لهذا اليوم</p>
          )}
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
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogTrigger asChild>
          <Button className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground z-50">
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مهمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="عنوان المهمة" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Input placeholder="وصف المهمة (اختياري)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input placeholder="الوقت (مثال: 10:00 صباحاً)" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof form.type }))}
            >
              {Object.entries(typeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <Button className="w-full" onClick={handleAdd}>إضافة المهمة</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SchedulePage;
