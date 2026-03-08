import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: "honey" | "nature" | "warm" | "default";
  trend?: { value: number; label: string };
}

const variantStyles = {
  honey: "gradient-honey text-primary-foreground",
  nature: "gradient-nature text-secondary-foreground",
  warm: "gradient-warm text-accent-foreground",
  default: "bg-card text-card-foreground border border-border",
};

const StatCard = ({ title, value, icon, variant = "default", trend }: StatCardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-card transition-transform hover:scale-[1.02]",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.value >= 0 ? "bg-nature/20 text-nature" : "bg-destructive/20 text-destructive"
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-sm opacity-80 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
