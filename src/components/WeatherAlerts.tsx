import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Thermometer, Wind, CloudRain, CloudSnow } from "lucide-react";

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

const checkWeatherDangers = (
  apiaryName: string,
  temp: number,
  windSpeed: number,
  weatherCode: number
): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  const id = `${apiaryName}-${Date.now()}`;

  // Extreme heat
  if (temp >= 45) {
    alerts.push({
      id: `${id}-heat-danger`,
      apiaryName,
      type: "heat",
      severity: "danger",
      message: `⚠️ حرارة شديدة الخطورة (${temp}°)! خطر انهيار الطوائف. وفر تظليل وماء فوراً!`,
      temp,
    });
  } else if (temp >= 40) {
    alerts.push({
      id: `${id}-heat-warning`,
      apiaryName,
      type: "heat",
      severity: "warning",
      message: `حرارة مرتفعة جداً (${temp}°). النحل يحتاج ماء إضافي وتهوية.`,
      temp,
    });
  }

  // Extreme cold
  if (temp <= 0) {
    alerts.push({
      id: `${id}-cold-danger`,
      apiaryName,
      type: "cold",
      severity: "danger",
      message: `⚠️ صقيع (${temp}°)! تأكد من عزل الخلايا وإغلاق الفتحات.`,
      temp,
    });
  } else if (temp <= 5) {
    alerts.push({
      id: `${id}-cold-warning`,
      apiaryName,
      type: "cold",
      severity: "warning",
      message: `برودة شديدة (${temp}°). النحل سيتكتل داخل الخلية.`,
      temp,
    });
  }

  // High winds
  if (windSpeed >= 50) {
    alerts.push({
      id: `${id}-wind-danger`,
      apiaryName,
      type: "wind",
      severity: "danger",
      message: `⚠️ عاصفة قوية (${windSpeed} كم/س)! ثبّت الخلايا فوراً!`,
      windSpeed,
    });
  } else if (windSpeed >= 35) {
    alerts.push({
      id: `${id}-wind-warning`,
      apiaryName,
      type: "wind",
      severity: "warning",
      message: `رياح قوية (${windSpeed} كم/س). أغلق مداخل الخلايا جزئياً.`,
      windSpeed,
    });
  }

  // Storm conditions (WMO codes 95, 96, 99)
  if ([95, 96, 99].includes(weatherCode)) {
    alerts.push({
      id: `${id}-storm`,
      apiaryName,
      type: "storm",
      severity: "danger",
      message: `⚠️ عاصفة رعدية متوقعة! احمِ الخلايا من البرَد والصواعق.`,
    });
  }

  // Heavy rain (WMO codes 65, 82)
  if ([65, 82].includes(weatherCode)) {
    alerts.push({
      id: `${id}-rain`,
      apiaryName,
      type: "rain",
      severity: "warning",
      message: `أمطار غزيرة متوقعة. تأكد من تصريف المياه حول الخلايا.`,
    });
  }

  return alerts;
};

const getAlertIcon = (type: WeatherAlert["type"]) => {
  switch (type) {
    case "heat":
      return <Thermometer className="h-5 w-5" />;
    case "cold":
      return <CloudSnow className="h-5 w-5" />;
    case "wind":
      return <Wind className="h-5 w-5" />;
    case "storm":
      return <AlertTriangle className="h-5 w-5" />;
    case "rain":
      return <CloudRain className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

interface WeatherAlertsProps {
  className?: string;
}

const WeatherAlerts = ({ className }: WeatherAlertsProps) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);

  const checkAllApiaries = useCallback(async () => {
    const saved = localStorage.getItem("nahali-apiary-locations");
    if (!saved) return;

    let apiaries: ApiaryLocation[] = [];
    try {
      apiaries = JSON.parse(saved);
    } catch {
      return;
    }

    if (apiaries.length === 0) return;

    setChecking(true);
    const newAlerts: WeatherAlert[] = [];

    for (const apiary of apiaries) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${apiary.lat}&longitude=${apiary.lng}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
        );
        const data = await res.json();
        const temp = Math.round(data.current.temperature_2m);
        const windSpeed = Math.round(data.current.wind_speed_10m);
        const weatherCode = data.current.weather_code;

        const apiaryAlerts = checkWeatherDangers(apiary.name, temp, windSpeed, weatherCode);
        newAlerts.push(...apiaryAlerts);
      } catch {
        console.error(`Failed to check weather for ${apiary.name}`);
      }
    }

    setAlerts(newAlerts);
    setChecking(false);
  }, []);

  useEffect(() => {
    checkAllApiaries();
    // Check every 30 minutes
    const interval = setInterval(checkAllApiaries, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAllApiaries]);

  const dismissAlert = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-bold text-destructive">
        <AlertTriangle className="w-4 h-4" />
        تنبيهات الطقس للمناحل ({visibleAlerts.length})
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
