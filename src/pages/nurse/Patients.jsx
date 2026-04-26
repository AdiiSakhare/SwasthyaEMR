import { useState, useMemo } from "react";
import { Search, Users, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { calcAge, formatDate } from "@/lib/utils";

export default function NursePatients() {
  const { patients, vitals } = useStore();
  const [q, setQ] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    if (!q.trim()) return patients;
    const term = q.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        p.id.toLowerCase().includes(term)
    );
  }, [patients, q]);

  const latestVitals = (pid) =>
    vitals
      .filter((v) => v.patientId === pid)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="max-w-5xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Patients"
        title="All Patients"
        description="View patient list and latest vitals."
      />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or patient ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Empty icon={Users} title="No patients found" description="Try a different search term." />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => {
              const lv = latestVitals(p.id);
              const vitalsToday = lv?.date === today;
              return (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <Avatar name={p.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{p.name}</span>
                      {p.allergies.length > 0 && (
                        <Badge variant="danger">⚠ {p.allergies[0]}{p.allergies.length > 1 && ` +${p.allergies.length - 1}`}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.id} · {p.gender} · {calcAge(p.dob)}y · {p.phone}
                    </p>
                  </div>

                  {lv ? (
                    <div className="hidden sm:flex flex-col gap-0.5 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Activity className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(lv.date)}</span>
                        {vitalsToday && <Badge variant="completed">Today</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        BP {lv.bp} · {lv.temp}°F · Pulse {lv.pulse} · SpO₂ {lv.spo2}%
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic hidden sm:block">No vitals</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
