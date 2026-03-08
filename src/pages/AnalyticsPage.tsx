import AppLayout from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const AnalyticsPage = () => {
  const monthlyProduction = [
    { month: "يناير", production: 45 },
    { month: "فبراير", production: 52 },
    { month: "مارس", production: 78 },
    { month: "أبريل", production: 95 },
    { month: "مايو", production: 120 },
    { month: "يونيو", production: 110 },
  ];

  const healthData = [
    { name: "صحية", value: 18, color: "hsl(145, 35%, 42%)" },
    { name: "تحتاج رعاية", value: 4, color: "hsl(38, 92%, 50%)" },
    { name: "حرجة", value: 2, color: "hsl(0, 72%, 51%)" },
  ];

  const yearlyTrend = [
    { year: "2023", production: 890 },
    { year: "2024", production: 1120 },
    { year: "2025", production: 1450 },
    { year: "2026", production: 500 },
  ];

  return (
    <AppLayout title="التحليلات والتقارير">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">إجمالي الإنتاج</p>
          <p className="text-2xl font-bold text-primary">1,450 كغ</p>
          <p className="text-xs text-nature mt-1">↑ 29% من العام الماضي</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">متوسط لكل خلية</p>
          <p className="text-2xl font-bold">60 كغ</p>
          <p className="text-xs text-nature mt-1">↑ 15% تحسن</p>
        </div>
      </div>

      {/* Monthly Production Chart */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">الإنتاج الشهري (كغ)</h3>
        <div className="bg-card rounded-2xl p-4 border border-border h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProduction}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 25%, 85%)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(40, 40%, 98%)",
                  border: "1px solid hsl(38, 25%, 85%)",
                  borderRadius: "8px",
                  direction: "rtl"
                }}
              />
              <Bar dataKey="production" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Hive Health Distribution */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">توزيع صحة الخلايا</h3>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {healthData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm flex-1">{item.name}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Yearly Trend */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">اتجاه الإنتاج السنوي</h3>
        <div className="bg-card rounded-2xl p-4 border border-border h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 25%, 85%)" />
              <XAxis dataKey="year" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(40, 40%, 98%)",
                  border: "1px solid hsl(38, 25%, 85%)",
                  borderRadius: "8px",
                  direction: "rtl"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="production" 
                stroke="hsl(145, 35%, 42%)" 
                strokeWidth={3}
                dot={{ fill: "hsl(145, 35%, 42%)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Insights */}
      <section className="mb-8">
        <h3 className="text-lg font-bold mb-4">رؤى سريعة</h3>
        <div className="space-y-3">
          <div className="bg-nature/10 rounded-xl p-4 border-r-4 border-nature">
            <p className="font-medium text-nature">أفضل خلية هذا الشهر</p>
            <p className="text-sm text-muted-foreground">خلية الزهور - 15 كغ عسل</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 border-r-4 border-primary">
            <p className="font-medium text-primary">موسم الذروة القادم</p>
            <p className="text-sm text-muted-foreground">أبريل - موسم إزهار الحمضيات</p>
          </div>
          <div className="bg-accent/10 rounded-xl p-4 border-r-4 border-accent">
            <p className="font-medium text-accent">توصية</p>
            <p className="text-sm text-muted-foreground">أضف 3 خلايا جديدة لزيادة الإنتاج بنسبة 20%</p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default AnalyticsPage;
