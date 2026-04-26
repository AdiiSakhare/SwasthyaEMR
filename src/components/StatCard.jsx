import { cn } from "@/lib/utils";

export function StatCard({ label, value, hint, icon: Icon, accent = "primary", className }) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className={cn("bg-card rounded-2xl border border-border p-5 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className={cn("size-8 rounded-lg flex items-center justify-center", accents[accent])}>
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-foreground">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
