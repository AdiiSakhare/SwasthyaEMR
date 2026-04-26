import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  waiting: "bg-amber-100 text-amber-800 ring-amber-200",
  "in-consultation": "bg-blue-100 text-blue-700 ring-blue-200",
  completed: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  done: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  cancelled: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  "no-show": "bg-red-100 text-red-700 ring-red-200",
  walkin: "bg-purple-100 text-purple-700 ring-purple-200",
  scheduled: "bg-sky-100 text-sky-700 ring-sky-200",
  arrived: "bg-amber-100 text-amber-800 ring-amber-200",
  paid: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  pending: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  partial: "bg-orange-100 text-orange-700 ring-orange-200",
  dispensed: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  default: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  primary: "bg-primary/10 text-primary ring-primary/20",
  danger: "bg-red-100 text-red-700 ring-red-200",
};

export function Badge({ className, variant = "default", children, ...props }) {
  const style = STATUS_STYLES[variant] || STATUS_STYLES.default;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        style,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusDot({ variant = "default", className }) {
  const colorMap = {
    waiting: "bg-amber-500",
    "in-consultation": "bg-blue-500",
    completed: "bg-emerald-500",
    cancelled: "bg-zinc-400",
    "no-show": "bg-red-500",
    walkin: "bg-purple-500",
    scheduled: "bg-sky-500",
    pending: "bg-yellow-500",
    paid: "bg-emerald-500",
    dispensed: "bg-emerald-500",
    default: "bg-zinc-400",
  };
  return <span className={cn("inline-block size-1.5 rounded-full", colorMap[variant] || colorMap.default, className)} />;
}
