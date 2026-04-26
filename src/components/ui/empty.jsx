import { cn } from "@/lib/utils";

export function Empty({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4 gap-3", className)}>
      {Icon && (
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          <Icon className="size-5" />
        </div>
      )}
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
