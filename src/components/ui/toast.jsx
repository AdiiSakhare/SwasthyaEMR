import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2);
    const item = { id, type: "default", duration: 3500, ...opts };
    setToasts((t) => [...t, item]);
    if (item.duration > 0) setTimeout(() => dismiss(id), item.duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 200);
  };
  useEffect(() => {
    if (toast.duration > 0) {
      const t = setTimeout(() => setExiting(true), toast.duration - 200);
      return () => clearTimeout(t);
    }
  }, [toast.duration]);

  const icon = toast.type === "success" ? <CheckCircle2 className="size-4 text-emerald-600" /> :
               toast.type === "error" ? <AlertCircle className="size-4 text-red-600" /> :
               <Info className="size-4 text-blue-600" />;

  return (
    <div
      className={cn(
        "pointer-events-auto bg-card border border-border rounded-xl shadow-lg p-3.5 pr-3 min-w-[280px] max-w-sm flex items-start gap-3",
        "transition-all duration-200",
        exiting ? "opacity-0 translate-y-2" : "fade-up-enter"
      )}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 flex flex-col gap-0.5">
        {toast.title && <p className="text-sm font-medium text-foreground">{toast.title}</p>}
        {toast.description && <p className="text-xs text-muted-foreground">{toast.description}</p>}
      </div>
      <button onClick={handleDismiss} className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
