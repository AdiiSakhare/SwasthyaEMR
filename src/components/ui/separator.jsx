import { cn } from "@/lib/utils";

export function Separator({ className, orientation = "horizontal" }) {
  return (
    <div
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      role="separator"
    />
  );
}
