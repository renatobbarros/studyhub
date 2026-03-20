import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "primary" | "accent" | "danger";
}

export function StatCard({ title, value, icon, trend, trendUp, color = "primary" }: StatCardProps) {
  
  const colorMap = {
    primary: "text-primary-600 bg-primary-50 dark:bg-primary-900/20",
    accent: "text-accent-600 bg-accent-50 dark:bg-accent-900/20",
    danger: "text-danger-500 bg-danger-50 dark:bg-danger-900/20",
  };

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background/50 p-6 glass shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground/60">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorMap[color])}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("font-medium", trendUp ? "text-green-600" : "text-foreground/60")}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
