import AppLayout from "@/components/AppLayout";
import HiveCard from "@/components/HiveCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useHives, useHiveStats } from "@/hooks/useDatabase";

const HivesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const hives = useHives(searchQuery);
  const stats = useHiveStats();

  return (
    <AppLayout title="خلايا النحل">
      {/* Summary */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-nature/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-nature">{stats?.healthy ?? 0}</p>
          <p className="text-xs text-muted-foreground">خلايا صحية</p>
        </div>
        <div className="flex-1 bg-destructive/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{stats?.withAlerts ?? 0}</p>
          <p className="text-xs text-muted-foreground">تحتاج اهتمام</p>
        </div>
        <div className="flex-1 bg-primary/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats?.total ?? 0}</p>
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
        {hives?.map((hive) => (
          <HiveCard key={hive.id} id={String(hive.id)} {...hive} />
        ))}
        {hives?.length === 0 && (
          <p className="text-muted-foreground text-center col-span-2 py-8">
            لا توجد خلايا مطابقة للبحث
          </p>
        )}
      </div>

      {/* Add Button */}
      <Button className="fixed left-4 bottom-24 w-14 h-14 rounded-full shadow-honey gradient-honey text-primary-foreground">
        <Plus className="w-6 h-6" />
      </Button>
    </AppLayout>
  );
};

export default HivesPage;
