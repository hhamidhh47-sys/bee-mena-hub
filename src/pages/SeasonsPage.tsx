import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Flower2, MapPin, Calendar, Sun, CloudRain, Thermometer, Info } from "lucide-react";
import { useState } from "react";

interface FloweringSeason {
  name: string;
  arabicName: string;
  months: number[];
  regions: string[];
  honeyType: string;
  quality: "ممتاز" | "جيد جداً" | "جيد";
  tips: string;
  emoji: string;
}

const seasons: FloweringSeason[] = [
  {
    name: "Sidr",
    arabicName: "السدر",
    months: [10, 11, 12],
    regions: ["السعودية", "اليمن", "عُمان"],
    honeyType: "عسل السدر",
    quality: "ممتاز",
    tips: "أفضل وقت للحصاد في نوفمبر. تجنب التغذية الصناعية خلال هذا الموسم.",
    emoji: "🌳",
  },
  {
    name: "Citrus",
    arabicName: "الحمضيات",
    months: [3, 4, 5],
    regions: ["مصر", "لبنان", "تونس", "المغرب"],
    honeyType: "عسل الحمضيات",
    quality: "ممتاز",
    tips: "موسم غزير الإنتاج. تأكد من وجود مساحة كافية لتخزين العسل.",
    emoji: "🍊",
  },
  {
    name: "Acacia",
    arabicName: "الطلح / السنط",
    months: [4, 5, 6],
    regions: ["السعودية", "السودان", "مصر"],
    honeyType: "عسل الطلح",
    quality: "ممتاز",
    tips: "عسل فاتح اللون ذو طلب عالي. يحتاج النحل لمصادر مياه قريبة.",
    emoji: "🌿",
  },
  {
    name: "Clover",
    arabicName: "البرسيم",
    months: [5, 6, 7, 8],
    regions: ["مصر", "السودان", "العراق"],
    honeyType: "عسل البرسيم",
    quality: "جيد جداً",
    tips: "موسم طويل ومستقر. مناسب لبناء قوة الطوائف.",
    emoji: "🍀",
  },
  {
    name: "Thyme",
    arabicName: "الزعتر",
    months: [5, 6, 7],
    regions: ["لبنان", "الأردن", "فلسطين", "المغرب"],
    honeyType: "عسل الزعتر",
    quality: "ممتاز",
    tips: "عسل ذو نكهة مميزة وقيمة عالية. يتطلب مناطق جبلية.",
    emoji: "🌱",
  },
  {
    name: "Eucalyptus",
    arabicName: "الكافور",
    months: [6, 7, 8, 9],
    regions: ["مصر", "المغرب", "تونس"],
    honeyType: "عسل الكافور",
    quality: "جيد",
    tips: "إنتاج جيد ولكن النكهة قوية. مفيد طبياً.",
    emoji: "🌲",
  },
  {
    name: "Date Palm",
    arabicName: "النخيل",
    months: [3, 4],
    regions: ["السعودية", "العراق", "مصر", "الإمارات"],
    honeyType: "عسل النخيل",
    quality: "جيد جداً",
    tips: "مصدر رحيق مبكر ممتاز لبناء الطوائف في الربيع.",
    emoji: "🌴",
  },
  {
    name: "Lavender",
    arabicName: "الخزامى",
    months: [6, 7, 8],
    regions: ["المغرب", "تونس", "الجزائر"],
    honeyType: "عسل الخزامى",
    quality: "ممتاز",
    tips: "عسل فاخر ذو سعر مرتفع. يزرع في المناطق الجبلية.",
    emoji: "💜",
  },
  {
    name: "Pomegranate",
    arabicName: "الرمان",
    months: [4, 5],
    regions: ["مصر", "السعودية", "إيران"],
    honeyType: "عسل الرمان",
    quality: "جيد جداً",
    tips: "موسم قصير لكنه غني. مناسب كمصدر تكميلي.",
    emoji: "🍎",
  },
  {
    name: "Cotton",
    arabicName: "القطن",
    months: [7, 8, 9],
    regions: ["مصر", "السودان", "سوريا"],
    honeyType: "عسل القطن",
    quality: "جيد",
    tips: "⚠️ تحذير: انتبه لرش المبيدات في حقول القطن!",
    emoji: "☁️",
  },
];

const countries = ["الكل", "السعودية", "مصر", "لبنان", "المغرب", "العراق", "اليمن", "تونس", "الأردن", "فلسطين", "السودان", "الإمارات", "عُمان", "الجزائر"];
const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const SeasonsPage = () => {
  const [selectedCountry, setSelectedCountry] = useState("الكل");
  const currentMonth = new Date().getMonth() + 1;

  const filtered = selectedCountry === "الكل"
    ? seasons
    : seasons.filter(s => s.regions.includes(selectedCountry));

  const activeSessions = filtered.filter(s => s.months.includes(currentMonth));
  const upcomingSessions = filtered.filter(s => {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const next2Month = nextMonth === 12 ? 1 : nextMonth + 1;
    return !s.months.includes(currentMonth) && (s.months.includes(nextMonth) || s.months.includes(next2Month));
  });

  return (
    <AppLayout title="مواسم الإزهار">
      {/* Country Filter */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {countries.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCountry === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Active Now */}
      {activeSessions.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-nature animate-pulse" />
            <h3 className="text-lg font-bold text-nature">مواسم نشطة الآن</h3>
          </div>
          <div className="space-y-3">
            {activeSessions.map(s => (
              <SeasonCard key={s.name} season={s} isActive currentMonth={currentMonth} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingSessions.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">قادمة قريباً</h3>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map(s => (
              <SeasonCard key={s.name} season={s} currentMonth={currentMonth} />
            ))}
          </div>
        </section>
      )}

      {/* Full Calendar View */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">التقويم السنوي</h3>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-right font-medium sticky right-0 bg-muted/50 min-w-[100px]">الزهرة</th>
                  {monthNames.map((m, i) => (
                    <th key={i} className={`p-2 text-center font-medium min-w-[40px] ${
                      i + 1 === currentMonth ? "bg-primary/10 text-primary font-bold" : ""
                    }`}>
                      {m.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.name} className="border-t border-border">
                    <td className="p-2 font-medium sticky right-0 bg-card">
                      <span className="ml-1">{s.emoji}</span>
                      {s.arabicName}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => (
                      <td key={i} className={`p-1 text-center ${i + 1 === currentMonth ? "bg-primary/5" : ""}`}>
                        {s.months.includes(i + 1) ? (
                          <div className={`w-6 h-6 mx-auto rounded-full ${
                            i + 1 === currentMonth ? "bg-nature text-white" : "bg-primary/20"
                          } flex items-center justify-center`}>
                            <Flower2 className="w-3 h-3" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* All seasons list */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">جميع المواسم ({filtered.length})</h3>
        <div className="space-y-3">
          {filtered.map(s => (
            <SeasonCard key={s.name} season={s} currentMonth={currentMonth} />
          ))}
        </div>
      </section>
    </AppLayout>
  );
};

const SeasonCard = ({ season, isActive, currentMonth }: { season: FloweringSeason; isActive?: boolean; currentMonth: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all cursor-pointer ${
        isActive
          ? "border-nature/40 bg-nature/5 shadow-sm"
          : "border-border bg-card hover:border-primary/30"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{season.emoji}</span>
          <div>
            <h4 className="font-bold">{season.arabicName}</h4>
            <p className="text-xs text-muted-foreground">
              {season.months.map(m => monthNames[m - 1]).join(" - ")}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isActive && (
            <Badge className="bg-nature text-white text-[10px]">نشط الآن</Badge>
          )}
          <Badge variant="outline" className="text-[10px]">{season.quality}</Badge>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">المناطق:</span>
            <span>{season.regions.join("، ")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flower2 className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">نوع العسل:</span>
            <span className="font-medium">{season.honeyType}</span>
          </div>
          <div className="bg-primary/5 rounded-xl p-3 flex gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">{season.tips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonsPage;
