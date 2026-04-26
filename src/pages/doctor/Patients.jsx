import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { calcAge, formatDate } from "@/lib/utils";

export default function DoctorPatients() {
  const { patients, visits } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const lastVisitFor = (pid) => {
    const v = visits.filter((x) => x.patientId === pid).sort((a, b) => b.date.localeCompare(a.date))[0];
    return v?.date;
  };

  const filtered = useMemo(() => {
    if (!q.trim()) return patients;
    const term = q.toLowerCase();
    return patients.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      p.id.toLowerCase().includes(term)
    );
  }, [patients, q]);

  return (
    <div className="max-w-6xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Patients"
        title="My Patients"
        description="Search and view full clinical history."
      />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, phone, or patient ID..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 h-11" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Empty icon={Users} title="No patients found" description="Try a different search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Patient</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden md:table-cell">Conditions</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden md:table-cell">Allergies</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden lg:table-cell">Last visit</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const lastVisit = lastVisitFor(p.id);
                  return (
                    <tr key={p.id} onClick={() => navigate(`/doctor/patients/${p.id}`)} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} size="md" />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground text-sm">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{p.id} · {p.gender} · {calcAge(p.dob)}y</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.conditions.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : p.conditions.slice(0, 2).map((c) => <Badge key={c} variant="default">{c}</Badge>)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.allergies.length === 0 ? <span className="text-xs text-muted-foreground">—</span> : p.allergies.slice(0, 2).map((a) => <Badge key={a} variant="danger">{a}</Badge>)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground hidden lg:table-cell">
                        {lastVisit ? formatDate(lastVisit) : <span className="italic">no visits</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
