import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Users, Clock, CheckCircle2, Stethoscope, ChevronRight, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { calcAge, formatTime } from "@/lib/utils";

const STATUS_LABEL = {
  scheduled: "Scheduled",
  waiting: "Waiting",
  "in-consultation": "In Consultation",
  completed: "Completed",
};

export default function DoctorDashboard() {
  const { appointments, patients, updateAppointmentStatus } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");

  const today = new Date().toISOString().slice(0, 10);
  const todays = useMemo(() => appointments.filter((a) => a.date === today), [appointments, today]);

  const stats = {
    total: todays.length,
    waiting: todays.filter((a) => a.status === "waiting").length,
    inConsult: todays.filter((a) => a.status === "in-consultation").length,
    done: todays.filter((a) => a.status === "completed").length,
  };

  const queue = useMemo(() => {
    const sortByTime = (a, b) => (a.slot || "").localeCompare(b.slot || "");
    if (filter === "active") return todays.filter((a) => a.status === "waiting" || a.status === "in-consultation").sort(sortByTime);
    if (filter === "done") return todays.filter((a) => a.status === "completed").sort(sortByTime);
    return todays.filter((a) => a.status !== "cancelled").sort(sortByTime);
  }, [todays, filter]);

  const patientById = (id) => patients.find((p) => p.id === id);

  const startConsult = (appt) => {
    if (appt.status !== "in-consultation") {
      updateAppointmentStatus(appt.id, "in-consultation");
      toast({ type: "success", title: "Consultation started", description: patientById(appt.patientId)?.name });
    }
    navigate(`/doctor/consultation/${appt.id}`);
  };

  const filters = [
    { id: "active", label: "Active", count: stats.waiting + stats.inConsult },
    { id: "all", label: "All", count: stats.total },
    { id: "done", label: "Done", count: stats.done },
  ];

  return (
    <div className="max-w-7xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Today's queue"
        title="Doctor Dashboard"
        description="Live patient queue. Click a patient to start consultation."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8 stagger">
        <StatCard label="Today's Patients" value={stats.total} icon={Users} accent="primary" />
        <StatCard label="Waiting" value={stats.waiting} icon={Clock} accent="amber" />
        <StatCard label="In Consultation" value={stats.inConsult} icon={Stethoscope} accent="blue" />
        <StatCard label="Completed" value={stats.done} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Patient Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Sorted by appointment time. Walk-ins highlighted.</p>
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
          {queue.length === 0 ? (
            <Empty icon={Filter} title="No patients in this view" description="Queue updates automatically as patients check in." />
          ) : (
            <div className="flex flex-col gap-2 stagger">
              {queue.map((appt) => {
                const p = patientById(appt.patientId);
                const isWalkin = appt.type === "walkin";
                const isActive = appt.status === "waiting" || appt.status === "in-consultation";
                return (
                  <div
                    key={appt.id}
                    className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                  >
                    <Avatar name={p?.name} size="md" />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">{p?.name}</span>
                        {isWalkin && <Badge variant="walkin">Walk-in</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{p?.gender} · {calcAge(p?.dob)}y</span>
                        <span className="size-1 rounded-full bg-border" />
                        <span className="truncate">{appt.reason}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{isWalkin ? "Walk-in" : appt.slot}</span>
                      {appt.checkInAt && <span>checked in {formatTime(appt.checkInAt)}</span>}
                    </div>
                    <Badge variant={appt.status}>{STATUS_LABEL[appt.status] || appt.status}</Badge>
                    {isActive ? (
                      <Button size="sm" onClick={() => startConsult(appt)}>
                        {appt.status === "in-consultation" ? "Resume" : "Start"}
                        <ChevronRight className="size-3.5" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patients/${appt.patientId}`)}>
                        View
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
