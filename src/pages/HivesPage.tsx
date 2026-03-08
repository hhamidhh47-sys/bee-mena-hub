import AppLayout from "@/components/AppLayout";
import HiveCard from "@/components/HiveCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const HivesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const hives = [
    {
      id: "1",
      name: "خلية الورد",
      location: "المزرعة الشمالية",
      queenStatus: "healthy" as const,
      lastInspection: "قبل 3 أيام",
      honeyProduction: 12,
    },
    {
      id: "2",
      name: "خلية السدر",
      location: "المزرعة الجنوبية",
      queenStatus: "weak" as const,
      lastInspection: "قبل أسبوع",
      honeyProduction: 8,
      alerts: 2,
    },
    {
      id: "3",
      name: "خلية الزهور",
      location: "المزرعة الشرقية",
      queenStatus: "healthy" as const,
      lastInspection: "اليوم",
      honeyProduction: 15,
    },
    {
      id: "4",
      name: "خلية النعناع",
      location: "المزرعة الغربية",
      queenStatus: "missing" as const,
      lastInspection: "قبل أسبوعين",
      honeyProduction: 3,
      alerts: 1,
    },
    {
      id: "5",
      name: "خلية الليمون",
      location: "المزرعة الشمالية",
      queenStatus: "healthy" as const,
      lastInspection: "قبل يومين",
      honeyProduction: 10,
    },
    {
      id: "6",
      name: "خلية البرتقال",
      location: "المزرعة الجنوبية",
      queenStatus: "healthy" as const,
      lastInspection: "قبل 4 أيام",
      honeyProduction: 14,
    },
  ];

  const filteredHives = hives.filter((hive) =>
    hive.name.includes(searchQuery) || hive.location.includes(searchQuery)
  );

  const healthyCount = hives.filter((h) => h.queenStatus === "healthy").length;
  const alertCount = hives.filter((h) => h.alerts && h.alerts > 0).length;

  return (
    <AppLayout title="خلايا النحل">
      {/* Summary */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-nature/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-nature">{healthyCount}</p>
          <p className="text-xs text-muted-foreground">خلايا صحية</p>
        </div>
        <div className="flex-1 bg-destructive/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{alertCount}</p>
          <p className="text-xs text-muted-foreground">تحتاج اهتمام</p>
        </div>
        <div className="flex-1 bg-primary/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{hives.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي الخلايا</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن خلية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card"
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Hives Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredHives.map((hive) => (
          <HiveCard key={hive.id} {...hive} />
        ))}
      </div>

      {/* Add Button */}
      <Button className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground">
        <Plus className="w-6 h-6" />
      </Button>
    </AppLayout>
  );
};

export default HivesPage;
