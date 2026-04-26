import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Calendar, X } from "lucide-react";
import { useStore } from "@/data/store";
import { useAuth } from "@/data/auth";
import { calcAge, cn } from "@/lib/utils";

const ROLE_PATIENT_PATH = {
  receptionist: "/reception/patients",
  doctor: "/doctor/patients",
  pharmacist: null, // pharmacy has no patient profile route
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, appointments } = useStore();

  const today = new Date().toISOString().slice(0, 10);
  const basePath = ROLE_PATIENT_PATH[user?.role];

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) {
      // Show today's appointments as quick actions when no query
      const todayAppts = appointments
        .filter((a) => a.date === today)
        .slice(0, 6)
        .map((a) => {
          const p = patients.find((x) => x.id === a.patientId);
          return { type: "appointment", id: a.id, patientId: a.patientId, label: p?.name || "Unknown", sub: `${a.slot} · ${a.status}`, status: a.status };
        });
      return todayAppts;
    }
    const term = q.toLowerCase();
    return patients
      .filter((p) =>
        p.name.toLowerCase().includes(term) ||
        p.phone.replace(/\D/g, "").includes(term.replace(/\D/g, "")) ||
        p.id.toLowerCase().includes(term)
      )
      .slice(0, 8)
      .map((p) => ({ type: "patient", id: p.id, patientId: p.id, label: p.name, sub: `${p.id} · ${p.phone} · ${p.gender} · ${calcAge(p.dob)}y` }));
  }, [q, patients, appointments, today]);

  const navigate_to = (item) => {
    if (!basePath) return;
    navigate(`${basePath}/${item.patientId}`);
    setOpen(false);
  };

  // Keyboard navigation
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) navigate_to(results[cursor]);
  };

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.children[cursor];
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        style={{ animation: "fadeIn 150ms ease both" }}
      />

      {/* Panel */}
      <div
        className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: "searchIn 180ms cubic-bezier(0.23,1,0.32,1) both" }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setCursor(0); }}
            onKeyDown={onKey}
            placeholder="Search patients by name, phone, or ID…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No patients found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different name, phone number, or patient ID</p>
            </div>
          ) : (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {q ? "Patients" : "Today's Queue"}
              </p>
              {results.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => navigate_to(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === cursor ? "bg-primary/8 text-foreground" : "hover:bg-muted/60"
                  )}
                >
                  <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0",
                    item.type === "appointment" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {item.type === "appointment" ? <Calendar className="size-4" /> : <User className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="px-1 bg-muted rounded border border-border">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 bg-muted rounded border border-border">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="px-1 bg-muted rounded border border-border">Esc</kbd> close</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes searchIn { from { opacity:0; transform: scale(0.96) translateY(-8px) } to { opacity:1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}
