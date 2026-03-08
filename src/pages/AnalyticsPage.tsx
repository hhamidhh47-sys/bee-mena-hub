import AppLayout from "@/components/AppLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useInvoices, usePayments, useCustomerDebts } from "@/hooks/useDatabase";
import { useMemo } from "react";
import { DollarSign, TrendingUp, Users, FileText } from "lucide-react";

const AnalyticsPage = () => {
  const invoices = useInvoices();
  const payments = usePayments();
  const debts = useCustomerDebts();

  // Monthly sales data from invoices
  const monthlySales = useMemo(() => {
    if (!invoices?.length) return [];
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const map = new Map<number, { sales: number; paid: number }>();
    for (const inv of invoices) {
      const d = new Date(inv.date);
      const m = d.getMonth();
      const existing = map.get(m) || { sales: 0, paid: 0 };
      existing.sales += inv.totalAmount;
      existing.paid += inv.paidAmount;
      map.set(m, existing);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([m, data]) => ({ month: months[m], sales: data.sales, paid: data.paid }));
  }, [invoices]);

  // Invoice status distribution
  const statusData = useMemo(() => {
    if (!invoices?.length) return [];
    const counts = { paid: 0, partial: 0, unpaid: 0 };
    for (const inv of invoices) counts[inv.status]++;
    return [
      { name: "مدفوعة", value: counts.paid, color: "hsl(145, 35%, 42%)" },
      { name: "جزئية", value: counts.partial, color: "hsl(38, 92%, 50%)" },
      { name: "غير مدفوعة", value: counts.unpaid, color: "hsl(0, 72%, 51%)" },
    ].filter(d => d.value > 0);
  }, [invoices]);

  // Payment timeline
  const paymentTimeline = useMemo(() => {
    if (!payments?.length) return [];
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const map = new Map<number, number>();
    for (const p of payments) {
      const d = new Date(p.date);
      const m = d.getMonth();
      map.set(m, (map.get(m) || 0) + p.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([m, amount]) => ({ month: months[m], amount }));
  }, [payments]);

  // Summary stats
  const stats = useMemo(() => {
    if (!invoices?.length) return { totalSales: 0, totalPaid: 0, totalDebt: 0, invoiceCount: 0 };
    const totalSales = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
    return { totalSales, totalPaid, totalDebt: totalSales - totalPaid, invoiceCount: invoices.length };
  }, [invoices]);

  // Top customers by debt
  const topDebtors = useMemo(() => {
    return (debts || []).slice(0, 5);
  }, [debts]);

  const tooltipStyle = {
    backgroundColor: "hsl(40, 40%, 98%)",
    border: "1px solid hsl(38, 25%, 85%)",
    borderRadius: "8px",
    direction: "rtl" as const,
  };

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
      {/* Sales Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
          </div>
          <p className="text-xl font-bold text-primary">{stats.totalSales.toLocaleString()} ر.س</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-nature/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-nature" />
            </div>
            <p className="text-xs text-muted-foreground">المحصّل</p>
          </div>
          <p className="text-xl font-bold text-nature">{stats.totalPaid.toLocaleString()} ر.س</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-xs text-muted-foreground">الديون المتبقية</p>
          </div>
          <p className="text-xl font-bold text-destructive">{stats.totalDebt.toLocaleString()} ر.س</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground">عدد الفواتير</p>
          </div>
          <p className="text-xl font-bold">{stats.invoiceCount}</p>
        </div>
      </div>

      {/* Monthly Sales Chart */}
      {monthlySales.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">المبيعات الشهرية (ر.س)</h3>
          <div className="bg-card rounded-2xl p-4 border border-border h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 25%, 85%)" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sales" name="المبيعات" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="المحصّل" fill="hsl(145, 35%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Invoice Status + Payment Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {statusData.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4">حالة الفواتير</h3>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-6">
                <div className="w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={5} dataKey="value">
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {statusData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm flex-1">{item.name}</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {paymentTimeline.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4">المدفوعات الشهرية</h3>
            <div className="bg-card rounded-2xl p-4 border border-border h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 25%, 85%)" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="amount" name="المدفوع" stroke="hsl(145, 35%, 42%)" fill="hsl(145, 35%, 42%)" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>

      {/* Top Debtors */}
      {topDebtors.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-4">أعلى الديون</h3>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {topDebtors.map((d, i) => (
              <div key={i} className={`flex items-center justify-between p-4 ${i < topDebtors.length - 1 ? "border-b border-border" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-sm font-bold text-destructive">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{d.customerName}</p>
                    <p className="text-xs text-muted-foreground">{d.invoiceCount} فاتورة</p>
                  </div>
                </div>
                <p className="font-bold text-destructive text-sm">{d.totalDebt.toLocaleString()} ر.س</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Production Summary Cards */}
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
              <Tooltip contentStyle={tooltipStyle} />
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
                  <Pie data={healthData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
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
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="production" stroke="hsl(145, 35%, 42%)" strokeWidth={3} dot={{ fill: "hsl(145, 35%, 42%)", strokeWidth: 2 }} />
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
