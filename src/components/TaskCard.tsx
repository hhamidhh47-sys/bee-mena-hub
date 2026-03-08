import { Bell, Calendar, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  description: string;
  time: string;
  type: "inspection" | "feeding" | "harvest" | "medication";
  completed?: boolean;
  onToggle?: () => void;
}

const typeConfig = {
  inspection: { icon: Clock, color: "bg-nature/10 text-nature", label: "فحص" },
  feeding: { icon: Bell, color: "bg-primary/10 text-primary", label: "تغذية" },
  harvest: { icon: Calendar, color: "bg-honey-glow/20 text-accent", label: "حصاد" },
  medication: { icon: Bell, color: "bg-destructive/10 text-destructive", label: "دواء" },
};

const TaskCard = ({ title, description, time, type, completed, onToggle }: TaskCardProps) => {
  const config = typeConfig[type];
  const TypeIcon = config.icon;

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-4 border border-border transition-all",
        completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
            completed
              ? "bg-nature border-nature text-nature-light"
              : "border-border hover:border-primary"
          )}
        >
          {completed && <Check className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={cn("font-medium", completed && "line-through")}>{title}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", config.color)}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
