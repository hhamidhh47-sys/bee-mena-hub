import { useEffect, useState, useCallback, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Thermometer, Wind, CloudRain, CloudSnow, Volume2, VolumeX } from "lucide-react";

interface ApiaryLocation {
  id?: number;
  name: string;
  lat: number;
  lng: number;
}

interface WeatherAlert {
  id: string;
  apiaryName: string;
  type: "heat" | "cold" | "wind" | "storm" | "rain";
  severity: "warning" | "danger";
  message: string;
  temp?: number;
  windSpeed?: number;
}

// ── Audio helpers using Web Audio API ────────────────────────────────────────
const playAlertSound = (severity: "warning" | "danger") => {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const beep = (startTime: number, freq: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };

    if (severity === "danger") {
      // Urgent triple beep — descending, loud
      beep(ctx.currentTime + 0.0, 880, 0.18, 0.6);
      beep(ctx.currentTime + 0.22, 880, 0.18, 0.6);
      beep(ctx.currentTime + 0.44, 660, 0.35, 0.7);
    } else {
      // Single gentle double-beep for warnings
      beep(ctx.currentTime + 0.0, 520, 0.15, 0.35);
      beep(ctx.currentTime + 0.22, 520, 0.15, 0.35);
    }
  } catch {
    // silently fail if audio context not available
  }
};

const checkWeatherDangers = (
  apiaryName: string,
  temp: number,
  windSpeed: number,
  weatherCode: number
): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  const id = `${apiaryName}-${Date.now()}`;

  if (temp >= 45) {
    alerts.push({ id: `${id}-heat-danger`, apiaryName, type: "heat", severity: "danger", message: `⚠️ حرارة شديدة الخطورة (${temp}°)! خطر انهيار الطوائف. وفر تظليل وماء فوراً!`, temp });
  } else if (temp >= 40) {
    alerts.push({ id: `${id}-heat-warning`, apiaryName, type: "heat", severity: "warning", message: `حرارة مرتفعة جداً (${temp}°). النحل يحتاج ماء إضافي وتهوية.`, temp });
  }

  if (temp <= 0) {
    alerts.push({ id: `${id}-cold-danger`, apiaryName, type: "cold", severity: "danger", message: `⚠️ صقيع (${temp}°)! تأكد من عزل الخلايا وإغلاق الفتحات.`, temp });
  } else if (temp <= 5) {
    alerts.push({ id: `${id}-cold-warning`, apiaryName, type: "cold", severity: "warning", message: `برودة شديدة (${temp}°). النحل سيتكتل داخل الخلية.`, temp });
  }

  if (windSpeed >= 50) {
    alerts.push({ id: `${id}-wind-danger`, apiaryName, type: "wind", severity: "danger", message: `⚠️ عاصفة قوية (${windSpeed} كم/س)! ثبّت الخلايا فوراً!`, windSpeed });
  } else if (windSpeed >= 35) {
    alerts.push({ id: `${id}-wind-warning`, apiaryName, type: "wind", severity: "warning", message: `رياح قوية (${windSpeed} كم/س). أغلق مداخل الخلايا جزئياً.`, windSpeed });
  }

  if ([95, 96, 99].includes(weatherCode)) {
    alerts.push({ id: `${id}-storm`, apiaryName, type: "storm", severity: "danger", message: `⚠️ عاصفة رعدية متوقعة! احمِ الخلايا من البرَد والصواعق.` });
  }

  if ([65, 82].includes(weatherCode)) {
    alerts.push({ id: `${id}-rain`, apiaryName, type: "rain", severity: "warning", message: `أمطار غزيرة متوقعة. تأكد من تصريف المياه حول الخلايا.` });
  }

  return alerts;
};

const getAlertIcon = (type: WeatherAlert["type"]) => {
  switch (type) {
    case "heat": return <Thermometer className="h-5 w-5" />;
    case "cold": return <CloudSnow className="h-5 w-5" />;
    case "wind": return <Wind className="h-5 w-5" />;
    case "storm": return <AlertTriangle className="h-5 w-5" />;
    case "rain": return <CloudRain className="h-5 w-5" />;
    default: return <AlertTriangle className="h-5 w-5" />;
  }
};

interface WeatherAlertsProps {
  className?: string;
}

const WeatherAlerts = ({ className }: WeatherAlertsProps) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevAlertIdsRef = useRef<Set<string>>(new Set());

  const checkAllApiaries = useCallback(async () => {
    const saved = localStorage.getItem("nahali-apiary-locations");
    if (!saved) return;

    let apiaries: ApiaryLocation[] = [];
    try { apiaries = JSON.parse(saved); } catch { return; }
    if (apiaries.length === 0) return;

    const newAlerts: WeatherAlert[] = [];

    for (const apiary of apiaries) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${apiary.lat}&longitude=${apiary.lng}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
        );
        const data = await res.json();
        const apiaryAlerts = checkWeatherDangers(
          apiary.name,
          Math.round(data.current.temperature_2m),
          Math.round(data.current.wind_speed_10m),
          data.current.weather_code
        );
        newAlerts.push(...apiaryAlerts);
      } catch {
        console.error(`Failed to check weather for ${apiary.name}`);
      }
    }

    // Play sound only for genuinely new alerts
    if (soundEnabled && newAlerts.length > 0) {
      const hasDanger = newAlerts.some(a => a.severity === "danger");
      const hasNew = newAlerts.some(a => !prevAlertIdsRef.current.has(a.id.split("-").slice(0, -1).join("-")));
      if (hasNew) playAlertSound(hasDanger ? "danger" : "warning");
    }

    prevAlertIdsRef.current = new Set(newAlerts.map(a => a.id.split("-").slice(0, -1).join("-")));
    setAlerts(newAlerts);
  }, [soundEnabled]);

  useEffect(() => {
    checkAllApiaries();
    const interval = setInterval(checkAllApiaries, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAllApiaries]);

  const dismissAlert = (id: string) => setDismissed(prev => new Set([...prev, id]));

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-destructive">
          <AlertTriangle className="w-4 h-4" />
          تنبيهات الطقس للمناحل ({visibleAlerts.length})
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1.5 text-xs text-muted-foreground"
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playAlertSound("warning");
          }}
          title={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {soundEnabled ? "صوت مفعّل" : "صوت مكتوم"}
        </Button>
      </div>

      {visibleAlerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.severity === "danger" ? "destructive" : "default"}
          className={`relative ${
            alert.severity === "danger"
              ? "border-destructive/50 bg-destructive/10"
              : "border-yellow-500/50 bg-yellow-500/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={alert.severity === "danger" ? "text-destructive" : "text-yellow-600"}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1">
              <AlertTitle className="text-sm font-bold flex items-center gap-2">
                🐝 {alert.apiaryName}
              </AlertTitle>
              <AlertDescription className="text-sm mt-1">{alert.message}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default WeatherAlerts;
