import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Flame, Bell } from "lucide-react";

const SmokerTimerPage = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [alertAt, setAlertAt] = useState(300); // 5 min default
  const [alerted, setAlerted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Alert when time reached
  useEffect(() => {
    if (seconds >= alertAt && !alerted && running) {
      setAlerted(true);
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
      try { new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1..").play().catch(() => {}); } catch {}
    }
  }, [seconds, alertAt, alerted, running]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    setAlerted(false);
  };

  const progress = Math.min((seconds / alertAt) * 100, 100);
  const isOvertime = seconds > alertAt;

  const presets = [
    { label: "3 دقائق", value: 180 },
    { label: "5 دقائق", value: 300 },
    { label: "10 دقائق", value: 600 },
    { label: "15 دقيقة", value: 900 },
  ];

  return (
    <AppLayout title="مؤقت الدخان">
      <div className="flex flex-col items-center">
        {/* Smoker Visual */}
        <div className="relative mb-8">
          <div
            className={`w-56 h-56 rounded-full flex items-center justify-center border-8 transition-all duration-500 ${
              isOvertime
                ? "border-destructive bg-destructive/10 animate-pulse"
                : running
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
            style={{
              background: running
                ? `conic-gradient(hsl(var(--primary)) ${progress}%, transparent ${progress}%)`
                : undefined,
            }}
          >
            <div className="w-44 h-44 rounded-full bg-card flex flex-col items-center justify-center">
              <Flame className={`w-10 h-10 mb-2 ${running ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <span className={`text-4xl font-bold tabular-nums ${isOvertime ? "text-destructive" : "text-foreground"}`}>
                {formatTime(seconds)}
              </span>
              {isOvertime && (
                <span className="text-xs text-destructive font-medium mt-1">⚠️ تجاوز الوقت!</span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={reset}
            variant="outline"
            size="icon"
            className="w-14 h-14 rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
          <Button
            onClick={() => { setRunning(!running); if (!running) setAlerted(false); }}
            className={`w-20 h-20 rounded-full text-lg shadow-lg ${
              running ? "bg-destructive hover:bg-destructive/90" : "gradient-honey"
            } text-primary-foreground`}
          >
            {running ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 mr-[-2px]" />}
          </Button>
          <div className="w-14 h-14" /> {/* Spacer for symmetry */}
        </div>

        {/* Alert Time Presets */}
        <div className="w-full bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-primary" />
            <Label className="font-bold text-sm">تنبيه بعد:</Label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presets.map(p => (
              <button
                key={p.value}
                onClick={() => { setAlertAt(p.value); setAlerted(false); }}
                className={`rounded-xl p-2 text-sm border-2 transition-all ${
                  alertAt === p.value
                    ? "border-primary bg-primary/10 font-bold"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="w-full bg-card rounded-2xl border border-border p-4">
          <h3 className="font-bold mb-3">💨 نصائح استخدام المدخن</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• استخدم وقوداً طبيعياً: خيش، قش، أوراق جافة</li>
            <li>• ادخن 2-3 نفثات عند فتح الخلية</li>
            <li>• لا تفرط في التدخين — قد يسبب هروب النحل</li>
            <li>• أبقِ المدخن بعيداً عن العسل المفتوح</li>
            <li>• أطفئ المدخن تماماً بعد الانتهاء</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-sm font-medium ${className}`}>{children}</span>
);

export default SmokerTimerPage;
