import { Crown, Heart, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HiveCardProps {
  id: string;
  name: string;
  location: string;
  queenStatus: "mated" | "weak" | "virgin" | "cell" | "missing";
  lastInspection: string;
  honeyProduction: number;
  alerts?: number;
  onClick?: () => void;
}

const queenStatusConfig = {
  mated: {
    icon: Crown,
    label: "ملكة ملقحة",
    color: "text-nature bg-nature/10",
  },
  weak: {
    icon: AlertTriangle,
    label: "ملكة ضعيفة",
    color: "text-primary bg-primary/10",
  },
  virgin: {
    icon: Heart,
    label: "ملكة عذراء",
    color: "text-[hsl(280,60%,50%)] bg-[hsl(280,60%,50%)]/10",
  },
  cell: {
    icon: Crown,
    label: "بيت ملكي",
    color: "text-[hsl(200,60%,45%)] bg-[hsl(200,60%,45%)]/10",
  },
  missing: {
    icon: AlertTriangle,
    label: "بدون ملكة",
    color: "text-destructive bg-destructive/10",
  },
};

const HiveCard = ({
  name,
  location,
  queenStatus,
  lastInspection,
  honeyProduction,
  alerts,
  onClick,
}: HiveCardProps) => {
  const status = queenStatusConfig[queenStatus];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl p-5 shadow-card border border-border hover:shadow-honey transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
        {alerts && alerts > 0 && (
          <span className="flex items-center justify-center w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs font-bold animate-pulse">
            {alerts}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium", status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-muted-foreground text-xs mb-1">آخر فحص</p>
          <p className="font-medium">{lastInspection}</p>
        </div>
        <div className="bg-honey-light/30 rounded-xl p-3">
          <p className="text-muted-foreground text-xs mb-1">إنتاج العسل</p>
          <p className="font-medium text-primary">{honeyProduction} كغ</p>
        </div>
      </div>
    </div>
  );
};

export default HiveCard;
