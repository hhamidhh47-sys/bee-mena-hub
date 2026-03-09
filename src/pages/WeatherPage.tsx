import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, Search, CloudSnow, CloudLightning, Loader2, Navigation, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import MapPickerModal from "@/components/MapPickerModal";

interface GeoResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temp: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  daily: { day: string; tempMax: number; tempMin: number; weatherCode: number }[];
}

// WMO weather code descriptions in Arabic
const weatherDescriptions: Record<number, { text: string; icon: string }> = {
  0: { text: "صافٍ", icon: "sun" },
  1: { text: "صافٍ غالباً", icon: "sun" },
  2: { text: "غائم جزئياً", icon: "cloud-sun" },
  3: { text: "غائم", icon: "cloud" },
  45: { text: "ضباب", icon: "cloud" },
  48: { text: "ضباب متجمد", icon: "cloud" },
  51: { text: "رذاذ خفيف", icon: "rain" },
  53: { text: "رذاذ متوسط", icon: "rain" },
  55: { text: "رذاذ كثيف", icon: "rain" },
  61: { text: "مطر خفيف", icon: "rain" },
  63: { text: "مطر متوسط", icon: "rain" },
  65: { text: "مطر غزير", icon: "rain" },
  71: { text: "ثلج خفيف", icon: "snow" },
  73: { text: "ثلج متوسط", icon: "snow" },
  75: { text: "ثلج كثيف", icon: "snow" },
  80: { text: "زخات مطر", icon: "rain" },
  81: { text: "زخات مطر متوسطة", icon: "rain" },
  82: { text: "زخات مطر غزيرة", icon: "rain" },
  95: { text: "عاصفة رعدية", icon: "storm" },
  96: { text: "عاصفة رعدية مع برَد", icon: "storm" },
  99: { text: "عاصفة رعدية شديدة", icon: "storm" },
};

const getWeatherDesc = (code: number) => weatherDescriptions[code] || { text: "غير محدد", icon: "sun" };

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

const beeImpact = (temp: number, humidity: number, windSpeed: number) => {
  const impacts: { text: string; severity: "good" | "warning" | "danger" }[] = [];
  if (temp >= 15 && temp <= 35) impacts.push({ text: "درجة الحرارة مثالية لنشاط النحل", severity: "good" });
  else if (temp > 35 && temp <= 42) impacts.push({ text: "حرارة مرتفعة - النحل سيحتاج ماء إضافي", severity: "warning" });
  else if (temp > 42) impacts.push({ text: "⚠️ حرارة خطيرة - خطر انهيار الطوائف!", severity: "danger" });
  else if (temp < 10) impacts.push({ text: "برودة شديدة - النحل سيبقى في الخلية", severity: "warning" });
  if (humidity > 80) impacts.push({ text: "رطوبة عالية - خطر العفن والأمراض الفطرية", severity: "warning" });
  else if (humidity < 20) impacts.push({ text: "رطوبة منخفضة جداً - وفر مصادر مياه قريبة", severity: "warning" });
  if (windSpeed > 35) impacts.push({ text: "عاصفة - ثبّت الخلايا وتأكد من إغلاقها", severity: "danger" });
  else if (windSpeed > 25) impacts.push({ text: "رياح قوية - النحل لن يخرج للرعي", severity: "warning" });
  if (impacts.length === 0) impacts.push({ text: "ظروف جيدة لنشاط النحل", severity: "good" });
  return impacts;
};

const arabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Popular MENA cities for quick selection
const quickCities: { name: string; lat: number; lng: number; country: string }[] = [
  { name: "الرياض", lat: 24.7136, lng: 46.6753, country: "السعودية" },
  { name: "جدة", lat: 21.4858, lng: 39.1925, country: "السعودية" },
  { name: "القاهرة", lat: 30.0444, lng: 31.2357, country: "مصر" },
  { name: "بيروت", lat: 33.8938, lng: 35.5018, country: "لبنان" },
  { name: "بغداد", lat: 33.3152, lng: 44.3661, country: "العراق" },
  { name: "عمّان", lat: 31.9454, lng: 35.9284, country: "الأردن" },
  { name: "الرباط", lat: 34.0209, lng: -6.8416, country: "المغرب" },
  { name: "تونس", lat: 36.8065, lng: 10.1815, country: "تونس" },
];

const WeatherPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number; country: string }>(quickCities[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiaryLocations, setApiaryLocations] = useState<{ id?: number; name: string; lat: number; lng: number }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("nahali-apiary-locations");
    if (saved) {
      try {
        setApiaryLocations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse apiary locations");
      }
    }
  }, []);

  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
      );
      const data = await res.json();
      const daily = data.daily.time.map((date: string, i: number) => {
        const d = new Date(date);
        return {
          day: i === 0 ? "اليوم" : i === 1 ? "غداً" : arabicDays[d.getDay()],
          tempMax: Math.round(data.daily.temperature_2m_max[i]),
          tempMin: Math.round(data.daily.temperature_2m_min[i]),
          weatherCode: data.daily.weather_code[i],
        };
      });
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        tempMax: daily[0]?.tempMax ?? 0,
        tempMin: daily[0]?.tempMin ?? 0,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        daily,
      });
    } catch {
      toast({ title: "تعذر جلب بيانات الطقس", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch weather on location change
  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lng);
  }, [selectedLocation, fetchWeather]);

  // Search cities
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=6&language=ar`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } catch {
      toast({ title: "تعذر البحث", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const selectGeoResult = (r: GeoResult) => {
    setSelectedLocation({ name: r.name, lat: r.latitude, lng: r.longitude, country: r.country });
    setShowResults(false);
    setSearchQuery("");
  };

  const selectQuickCity = (city: typeof quickCities[0]) => {
    setSelectedLocation(city);
    setShowResults(false);
  };

  const handleLocateMe = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({ name: "موقعي الحالي", lat: pos.coords.latitude, lng: pos.coords.longitude, country: "" });
      },
      () => toast({ title: "لم نتمكن من تحديد موقعك", variant: "destructive" })
    );
  };

  const desc = weather ? getWeatherDesc(weather.weatherCode) : null;
  const impacts = weather ? beeImpact(weather.temp, weather.humidity, weather.windSpeed) : [];

  return (
    <AppLayout title="مراقبة الطقس">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="ابحث عن مدينة..."
              className="pl-10"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button onClick={handleSearch} size="icon" variant="outline" disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          <Button onClick={handleLocateMe} size="icon" variant="outline" title="موقعي الحالي">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            {searchResults.map(r => (
              <button
                key={r.id}
                onClick={() => selectGeoResult(r)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-right border-b border-border last:border-0"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.admin1 ? `${r.admin1}، ` : ""}{r.country}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showResults && !searching && searchResults.length === 0 && searchQuery && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg p-4 text-center text-sm text-muted-foreground">
            لم يتم العثور على نتائج
          </div>
        )}
      </div>

      {/* Apiary Locations */}
      {apiaryLocations.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-primary">
            <MapPin className="w-4 h-4" />
            مناحلي
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ minWidth: "max-content" }}>
            {apiaryLocations.map(loc => (
              <button
                key={loc.name + (loc.id || '')}
                onClick={() => selectQuickCity({ name: loc.name, lat: loc.lat, lng: loc.lng, country: "منحلي" })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  selectedLocation.name === loc.name
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                🐝 {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Cities */}
      <div className="mb-6 overflow-x-auto">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-muted-foreground">
          المدن الكبرى
        </h3>
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {quickCities.map(city => (
            <button
              key={city.name}
              onClick={() => selectQuickCity(city)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedLocation.name === city.name
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="mr-3 text-muted-foreground">جارٍ جلب بيانات الطقس...</span>
        </div>
      )}

      {weather && !loading && desc && (
        <>
          {/* Current Weather Card */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-3xl p-6 border border-primary/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{selectedLocation.name}</span>
                {selectedLocation.country && (
                  <span className="text-xs text-muted-foreground">• {selectedLocation.country}</span>
                )}
              </div>
              <Badge variant="outline" className="text-xs">{desc.text}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-bold">{weather.temp}°</p>
                <p className="text-sm text-muted-foreground mt-1">
                  العظمى {weather.tempMax}° / الصغرى {weather.tempMin}°
                </p>
              </div>
              {getWeatherIcon(desc.icon, "w-16 h-16 text-primary")}
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
                <p className="text-lg font-bold">{weather.tempMax}°</p>
                <p className="text-[10px] text-muted-foreground">العظمى</p>
              </div>
            </div>
          </div>

          {/* Bee Impact Analysis */}
          <section className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🐝 تأثير الطقس على النحل</h3>
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
              {weather.daily.map((day, i) => {
                const dayDesc = getWeatherDesc(day.weatherCode);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 ${
                    i < weather.daily.length - 1 ? "border-b border-border" : ""
                  } ${i === 0 ? "bg-primary/5" : ""}`}>
                    <span className="text-sm font-medium w-20">{day.day}</span>
                    {getWeatherIcon(dayDesc.icon, "w-5 h-5 text-muted-foreground")}
                    <span className="text-xs text-muted-foreground">{dayDesc.text}</span>
                    <span className="font-bold text-sm">{day.tempMax}° / {day.tempMin}°</span>
                    <div className="w-16">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            day.tempMax > 38 ? "bg-destructive" : day.tempMax > 30 ? "bg-primary" : "bg-nature"
                          }`}
                          style={{ width: `${Math.min(100, (day.tempMax / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
        </>
      )}
    </AppLayout>
  );
};

export default WeatherPage;
