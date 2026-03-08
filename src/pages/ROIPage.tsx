import AppLayout from "@/components/AppLayout";
import { useHives } from "@/hooks/useDatabase";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { TrendingUp, TrendingDown, DollarSign, Minus } from "lucide-react";

const ROIPage = () => {
  const hives = useHives() ?? [];
  const invoices = useLiveQuery(() => db.invoices.toArray()) ?? [];
  const honeyStock = useLiveQuery(() => db.honeyStock.toArray()) ?? [];
  const treatments = useLiveQuery(() => db.table("treatments").toArray().catch(() => [])) ?? [];

  // Calculate per-hive revenue from invoices (approximation: distribute evenly)
  const totalRevenue = invoices.reduce((s, inv) => s + inv.paidAmount, 0);
  const totalHives = hives.length || 1;

  // Estimate costs per hive (treatments + feeding)
  const treatmentCostEstimate = treatments.length * 25; // ~25 SAR per treatment average

  const hiveROI = hives.map(hive => {
    const production = hive.honeyProduction;
    // Estimate revenue from honey production weight
    const avgPricePerKg = honeyStock.length > 0
      ? honeyStock.reduce((s, h) => s + h.pricePerUnit, 0) / honeyStock.length
      : 100;
    const estimatedRevenue = production * avgPricePerKg;
    const hiveTreatments = treatments.filter((t: any) => t.hiveId === hive.id);
    const treatmentCost = hiveTreatments.length * 25;
    const feedingCost = production < 5 ? 50 : 20; // More feeding for low-production hives
    const totalCost = treatmentCost + feedingCost;
    const profit = estimatedRevenue - totalCost;
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

    return {
      hive,
      production,
      estimatedRevenue,
      totalCost,
      profit,
      roi,
    };
  }).sort((a, b) => b.profit - a.profit);

  const totalProfit = hiveROI.reduce((s, h) => s + h.profit, 0);
  const totalCosts = hiveROI.reduce((s, h) => s + h.totalCost, 0);
  const totalEstRevenue = hiveROI.reduce((s, h) => s + h.estimatedRevenue, 0);

  return (
    <AppLayout title="العائد على الاستثمار">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">الإيرادات</p>
          <p className="text-lg font-bold text-nature">{totalEstRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">ر.س</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">التكاليف</p>
          <p className="text-lg font-bold text-destructive">{totalCosts.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">ر.س</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">الأرباح</p>
          <p className={`text-lg font-bold ${totalProfit >= 0 ? "text-nature" : "text-destructive"}`}>
            {totalProfit.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">ر.س</p>
        </div>
      </div>

      {/* Per-Hive ROI */}
      <h3 className="text-lg font-bold mb-3">العائد لكل خلية</h3>
      <div className="space-y-3">
        {hiveROI.map(({ hive, production, estimatedRevenue, totalCost, profit, roi }) => (
          <div key={hive.id} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold">{hive.name}</p>
                <p className="text-xs text-muted-foreground">{hive.location}</p>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                profit > 0 ? "bg-nature/10 text-nature" : profit < 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
              }`}>
                {profit > 0 ? <TrendingUp className="w-4 h-4" /> : profit < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                {roi.toFixed(0)}%
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="font-bold text-sm">{production} كغ</p>
                <p className="text-muted-foreground">إنتاج</p>
              </div>
              <div className="bg-nature/5 rounded-lg p-2">
                <p className="font-bold text-sm text-nature">{estimatedRevenue.toLocaleString()}</p>
                <p className="text-muted-foreground">إيراد</p>
              </div>
              <div className={`rounded-lg p-2 ${profit >= 0 ? "bg-nature/5" : "bg-destructive/5"}`}>
                <p className={`font-bold text-sm ${profit >= 0 ? "text-nature" : "text-destructive"}`}>
                  {profit >= 0 ? "+" : ""}{profit.toLocaleString()}
                </p>
                <p className="text-muted-foreground">ربح</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hiveROI.length === 0 && (
        <p className="text-center text-muted-foreground py-12">لا توجد خلايا لحساب العائد</p>
      )}

      <div className="mt-6 bg-muted/50 rounded-2xl p-4 text-xs text-muted-foreground">
        <p>⚠️ هذه تقديرات بناءً على بيانات الإنتاج والأسعار المسجلة. للحصول على نتائج أدق، سجّل جميع المصاريف والمبيعات.</p>
      </div>
    </AppLayout>
  );
};

export default ROIPage;
