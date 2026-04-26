import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Clock, CheckCircle2, ChevronRight, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { formatDate } from "@/lib/utils";

export default function PharmacyToday() {
  const { prescriptions, patients, users } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("pending");

  const today = new Date().toISOString().slice(0, 10);

  const todays = useMemo(
    () => prescriptions.filter((r) => r.date === today).sort((a, b) => Number(a.dispensed) - Number(b.dispensed)),
    [prescriptions, today]
  );

  const stats = {
    total: todays.length,
    pending: todays.filter((r) => !r.dispensed).length,
    dispensed: todays.filter((r) => r.dispensed).length,
  };

  const list = useMemo(() => {
    if (filter === "pending") return todays.filter((r) => !r.dispensed);
    if (filter === "dispensed") return todays.filter((r) => r.dispensed);
    return todays;
  }, [todays, filter]);

  const patientById = (id) => patients.find((p) => p.id === id);
  const doctorById = (id) => users.find((u) => u.id === id);

  const filters = [
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "dispensed", label: "Dispensed", count: stats.dispensed },
    { id: "all", label: "All", count: stats.total },
  ];

  return (
    <div className="max-w-6xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Today's prescriptions"
        title="Pharmacy Queue"
        description="Review and dispense today's prescriptions."
      />

      <div className="grid grid-cols-3 gap-3.5 mb-8 stagger">
        <StatCard label="Today's Rx" value={stats.total} icon={Pill} accent="primary" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} accent="amber" />
        <StatCard label="Dispensed" value={stats.dispensed} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Prescriptions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click a row to review medicines and dispense.</p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-xl">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 h-8 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  filter === f.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
                {f.count > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted-foreground/10">{f.count}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {list.length === 0 ? (
            <Empty icon={Filter} title="Nothing here" description="Prescriptions appear automatically once doctors complete consultations." />
          ) : (
            <div className="flex flex-col gap-2 stagger">
              {list.map((rx) => {
                const p = patientById(rx.patientId);
                const d = doctorById(rx.doctorId);
                return (
                  <button
                    key={rx.id}
                    onClick={() => navigate(`/pharmacy/rx/${rx.id}`)}
                    className="text-left flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                  >
                    <Avatar name={p?.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {rx.id} · {rx.items.length} medicines · {d?.name}
                      </p>
                    </div>
                    <div className="hidden sm:block text-xs text-muted-foreground">{formatDate(rx.date)}</div>
                    <Badge variant={rx.dispensed ? "completed" : "waiting"}>{rx.dispensed ? "Dispensed" : "Pending"}</Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
