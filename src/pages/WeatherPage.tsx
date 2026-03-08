import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, AlertTriangle, MapPin, RefreshCw, CloudSnow, CloudLightning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  city: string;
}

// Simulated weather for MENA cities (since we don't have an API key)
const simulatedWeather: Record<string, WeatherData> = {
  "الرياض": { temp: 38, humidity: 15, windSpeed: 12, description: "صافٍ", icon: "sun", city: "الرياض" },
  "جدة": { temp: 34, humidity: 65, windSpeed: 8, description: "غائم جزئياً", icon: "cloud-sun", city: "جدة" },
  "القاهرة": { temp: 32, humidity: 45, windSpeed: 10, description: "صافٍ", icon: "sun", city: "القاهرة" },
  "بيروت": { temp: 27, humidity: 70, windSpeed: 15, description: "غائم", icon: "cloud", city: "بيروت" },
  "الرباط": { temp: 24, humidity: 60, windSpeed: 18, description: "رياح خفيفة", icon: "wind", city: "الرباط" },
  "بغداد": { temp: 40, humidity: 20, windSpeed: 14, description: "حار وجاف", icon: "sun", city: "بغداد" },
  "عمّان": { temp: 28, humidity: 35, windSpeed: 11, description: "صافٍ", icon: "sun", city: "عمّان" },
  "تونس": { temp: 29, humidity: 55, windSpeed: 13, description: "غائم جزئياً", icon: "cloud-sun", city: "تونس" },
};

const beeImpact = (temp: number, humidity: number, windSpeed: number) => {
  const impacts: { text: string; severity: "good" | "warning" | "danger" }[] = [];

  if (temp >= 15 && temp <= 35) {
    impacts.push({ text: "درجة الحرارة مثالية لنشاط النحل", severity: "good" });
  } else if (temp > 35 && temp <= 42) {
    impacts.push({ text: "حرارة مرتفعة - النحل سيحتاج ماء إضافي", severity: "warning" });
  } else if (temp > 42) {
    impacts.push({ text: "⚠️ حرارة خطيرة - خطر انهيار الطوائف!", severity: "danger" });
  } else if (temp < 10) {
    impacts.push({ text: "برودة شديدة - النحل سيبقى في الخلية", severity: "warning" });
  }

  if (humidity > 80) {
    impacts.push({ text: "رطوبة عالية - خطر العفن والأمراض الفطرية", severity: "warning" });
  } else if (humidity < 20) {
    impacts.push({ text: "رطوبة منخفضة جداً - وفر مصادر مياه قريبة", severity: "warning" });
  }

  if (windSpeed > 25) {
    impacts.push({ text: "رياح قوية - النحل لن يخرج للرعي", severity: "warning" });
  } else if (windSpeed > 35) {
    impacts.push({ text: "عاصفة - ثبّت الخلايا وتأكد من إغلاقها", severity: "danger" });
  }

  if (impacts.length === 0) {
    impacts.push({ text: "ظروف جيدة لنشاط النحل", severity: "good" });
  }

  return impacts;
};

const getWeatherIcon = (icon: string, className: string) => {
  switch (icon) {
    case "sun": return <Sun className={className} />;
    case "cloud": return <Cloud className={className} />;
    case "cloud-sun": return <Cloud className={className} />;
    case "rain": return <CloudRain className={className} />;
    case "wind": return <Wind className={className} />;
    case "snow": return <CloudSnow className={className} />;
    case "storm": return <CloudLightning className={className} />;
    default: return <Sun className={className} />;
  }
};

// Weekly forecast (simulated)
const weeklyForecast = [
  { day: "اليوم", temp: 38, icon: "sun" },
  { day: "غداً", temp: 36, icon: "cloud-sun" },
  { day: "الأربعاء", temp: 34, icon: "cloud" },
  { day: "الخميس", temp: 37, icon: "sun" },
  { day: "الجمعة", temp: 39, icon: "sun" },
  { day: "السبت", temp: 35, icon: "wind" },
  { day: "الأحد", temp: 33, icon: "cloud-sun" },
];

const WeatherPage = () => {
  const [selectedCity, setSelectedCity] = useState("الرياض");
  const weather = simulatedWeather[selectedCity];
  const impacts = beeImpact(weather.temp, weather.humidity, weather.windSpeed);

  return (
    <AppLayout title="مراقبة الطقس">
      {/* City Selector */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {Object.keys(simulatedWeather).map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCity === city
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Current Weather Card */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-3xl p-6 border border-primary/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">{weather.city}</span>
          </div>
          <Badge variant="outline" className="text-xs">{weather.description}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold">{weather.temp}°</p>
            <p className="text-sm text-muted-foreground mt-1">درجة مئوية</p>
          </div>
          {getWeatherIcon(weather.icon, "w-16 h-16 text-primary")}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-primary/10">
          <div className="text-center">
            <Droplets className="w-5 h-5 mx-auto text-blue-400 mb-1" />
            <p className="text-lg font-bold">{weather.humidity}%</p>
            <p className="text-[10px] text-muted-foreground">الرطوبة</p>
          </div>
          <div className="text-center">
            <Wind className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{weather.windSpeed}</p>
            <p className="text-[10px] text-muted-foreground">كم/س رياح</p>
          </div>
          <div className="text-center">
            <Thermometer className="w-5 h-5 mx-auto text-destructive mb-1" />
            <p className="text-lg font-bold">{weather.temp + 5}°</p>
            <p className="text-[10px] text-muted-foreground">العظمى</p>
          </div>
        </div>
      </div>

      {/* Bee Impact Analysis */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          🐝 تأثير الطقس على النحل
        </h3>
        <div className="space-y-2">
          {impacts.map((impact, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 border-r-4 ${
                impact.severity === "good"
                  ? "bg-nature/10 border-nature"
                  : impact.severity === "warning"
                  ? "bg-yellow-500/10 border-yellow-500"
                  : "bg-destructive/10 border-destructive"
              }`}
            >
              <p className={`text-sm font-medium ${
                impact.severity === "good" ? "text-nature" : impact.severity === "warning" ? "text-yellow-600" : "text-destructive"
              }`}>
                {impact.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Forecast */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-3">توقعات الأسبوع</h3>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {weeklyForecast.map((day, i) => (
            <div key={i} className={`flex items-center justify-between p-3 ${
              i < weeklyForecast.length - 1 ? "border-b border-border" : ""
            } ${i === 0 ? "bg-primary/5" : ""}`}>
              <span className="text-sm font-medium w-20">{day.day}</span>
              {getWeatherIcon(day.icon, "w-5 h-5 text-muted-foreground")}
              <span className="font-bold">{day.temp}°</span>
              <div className="w-16">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      day.temp > 38 ? "bg-destructive" : day.temp > 30 ? "bg-primary" : "bg-nature"
                    }`}
                    style={{ width: `${Math.min(100, (day.temp / 45) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-3">نصائح موسمية</h3>
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <p className="font-medium text-primary mb-1">🌡️ درجة الحرارة المثالية</p>
            <p className="text-sm text-muted-foreground">النحل يعمل بأفضل كفاءة بين 15°-35° مئوية. فوق 40° يتوقف عن الرعي.</p>
          </div>
          <div className="bg-nature/5 rounded-xl p-4 border border-nature/20">
            <p className="font-medium text-nature mb-1">💧 الرطوبة والماء</p>
            <p className="text-sm text-muted-foreground">في الأيام الحارة، ضع أوعية ماء ضحلة بالقرب من الخلايا مع حصى للهبوط.</p>
          </div>
          <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
            <p className="font-medium text-yellow-600 mb-1">🌬️ الرياح القوية</p>
            <p className="text-sm text-muted-foreground">إذا تجاوزت الرياح 25 كم/س، أغلق مداخل الخلايا جزئياً لحماية النحل.</p>
          </div>
        </div>
      </section>

      {/* Note about API */}
      <div className="bg-muted/50 rounded-xl p-4 mb-8 text-center">
        <p className="text-xs text-muted-foreground">
          ⓘ البيانات تجريبية حالياً. يمكن ربط التطبيق بخدمة طقس حقيقية لاحقاً.
        </p>
      </div>
    </AppLayout>
  );
};

export default WeatherPage;
