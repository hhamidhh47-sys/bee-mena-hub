import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Calculator, Info } from "lucide-react";

const FeedingCalcPage = () => {
  const [hiveCount, setHiveCount] = useState(1);
  const [season, setSeason] = useState<"spring" | "fall" | "winter" | "emergency">("fall");
  const [feedType, setFeedType] = useState<"sugar_syrup" | "fondant" | "pollen_sub">("sugar_syrup");

  const seasonConfigs = {
    spring: { ratio: "1:1", label: "ربيعية (1:1)", sugarPerLiter: 1, waterPerLiter: 1, amountPerHive: 2 },
    fall: { ratio: "2:1", label: "خريفية (2:1)", sugarPerLiter: 2, waterPerLiter: 1, amountPerHive: 3 },
    winter: { ratio: "2:1", label: "شتوية (2:1)", sugarPerLiter: 2, waterPerLiter: 1, amountPerHive: 4 },
    emergency: { ratio: "1:1", label: "طارئة (1:1)", sugarPerLiter: 1, waterPerLiter: 1, amountPerHive: 1 },
  };

  const feedTypeConfigs = {
    sugar_syrup: { label: "محلول سكري", unit: "لتر" },
    fondant: { label: "كاندي / فوندان", unit: "كغ" },
    pollen_sub: { label: "بديل حبوب اللقاح", unit: "كغ" },
  };

  const config = seasonConfigs[season];
  const feed = feedTypeConfigs[feedType];

  const totalAmount = hiveCount * config.amountPerHive;
  const totalSugar = feedType === "sugar_syrup"
    ? totalAmount * config.sugarPerLiter
    : feedType === "fondant" ? totalAmount * 0.8 : totalAmount * 0.5;
  const totalWater = feedType === "sugar_syrup" ? totalAmount * config.waterPerLiter : 0;

  const tips = {
    spring: "التغذية الربيعية تحفز الملكة على وضع البيض وبناء الخلية",
    fall: "التغذية الخريفية تساعد النحل على تخزين الغذاء لفصل الشتاء",
    winter: "لا تفتح الخلية في البرد الشديد. استخدم الكاندي فوق الإطارات",
    emergency: "التغذية الطارئة عند نفاد المخزون. راقب الخلية بعناية",
  };

  return (
    <AppLayout title="حاسبة التغذية">
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">حساب التغذية</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label>عدد الخلايا</Label>
            <Input type="number" min={1} max={1000} value={hiveCount} onChange={e => setHiveCount(Math.max(1, +e.target.value))} />
          </div>

          <div>
            <Label>نوع التغذية</Label>
            <Select value={feedType} onValueChange={v => setFeedType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sugar_syrup">محلول سكري</SelectItem>
                <SelectItem value="fondant">كاندي / فوندان</SelectItem>
                <SelectItem value="pollen_sub">بديل حبوب اللقاح</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>الموسم</Label>
            <Select value={season} onValueChange={v => setSeason(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">ربيع — تحفيز</SelectItem>
                <SelectItem value="fall">خريف — تخزين</SelectItem>
                <SelectItem value="winter">شتاء — إعاشة</SelectItem>
                <SelectItem value="emergency">طارئ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          النتائج
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <p className="text-2xl font-bold text-primary">{totalAmount}</p>
            <p className="text-sm text-muted-foreground">{feed.unit} {feed.label}</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <p className="text-2xl font-bold text-primary">{totalSugar.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">كغ سكر</p>
          </div>
          {totalWater > 0 && (
            <div className="bg-card rounded-xl p-4 text-center border border-border col-span-2">
              <p className="text-2xl font-bold text-blue-500">{totalWater.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">لتر ماء</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm">
          <p className="text-muted-foreground">
            <strong>لكل خلية:</strong> {config.amountPerHive} {feed.unit}
            {feedType === "sugar_syrup" && ` (نسبة {config.ratio})`}
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm">نصيحة</span>
        </div>
        <p className="text-sm text-muted-foreground">{tips[season]}</p>
      </div>

      {/* Feeding Schedule */}
      <div className="mt-6 bg-card rounded-2xl border border-border p-4">
        <h3 className="font-bold mb-3">جدول التغذية المقترح</h3>
        <div className="space-y-2 text-sm">
          {[
            { month: "يناير-فبراير", action: "كاندي فوق الإطارات عند الحاجة", type: "شتوية" },
            { month: "مارس", action: "محلول سكري 1:1 لتحفيز الملكة", type: "ربيعية" },
            { month: "أبريل-مايو", action: "لا حاجة للتغذية (موسم الرحيق)", type: "—" },
            { month: "يونيو-أغسطس", action: "مراقبة المخزون وتغذية طارئة عند الحاجة", type: "طارئة" },
            { month: "سبتمبر-أكتوبر", action: "محلول 2:1 للتخزين الشتوي", type: "خريفية" },
            { month: "نوفمبر-ديسمبر", action: "كاندي / تغذية شتوية ثقيلة", type: "شتوية" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <span className="text-xs font-medium text-primary w-28">{item.month}</span>
              <span className="flex-1 text-muted-foreground">{item.action}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default FeedingCalcPage;
