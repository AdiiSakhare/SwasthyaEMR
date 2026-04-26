import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Dialog({ open, onClose, children, title, description, size = "md", className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-up-enter"
        style={{ animationDuration: "200ms" }}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-card rounded-2xl border border-border shadow-2xl w-full overflow-hidden fade-up-enter",
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {(title || description) && (
          <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-border">
            <div className="flex flex-col gap-1">
              {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function DialogBody({ className, ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn("p-6 pt-0 flex items-center justify-end gap-2", className)} {...props} />;
}
