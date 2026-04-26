import { useNavigate } from "react-router-dom";
import { Users, Calendar, CheckCircle2, AlertCircle, UserPlus, CalendarPlus, Zap, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { QueueRow } from "@/components/QueueRow";
import { useStore } from "@/data/store";
import { useState, useMemo } from "react";

export default function ReceptionDashboard() {
  const { appointments, patients, invoices } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const today = new Date().toISOString().slice(0, 10);
  const todays = useMemo(
    () => appointments.filter((a) => a.date === today),
    [appointments, today]
  );

  const stats = {
    total: todays.length,
    walkins: todays.filter((a) => a.type === "walkin").length,
    completed: todays.filter((a) => a.status === "completed").length,
    pendingPayment: invoices.filter((i) => i.status === "pending").length,
  };

  const queue = useMemo(() => {
    if (filter === "all") return todays.filter((a) => a.status !== "cancelled");
    if (filter === "waiting") return todays.filter((a) => a.status === "waiting" || a.status === "scheduled");
    if (filter === "consultation") return todays.filter((a) => a.status === "in-consultation");
    if (filter === "done") return todays.filter((a) => a.status === "completed");
    return todays;
  }, [todays, filter]);

  const patientById = (id) => patients.find((p) => p.id === id);

  const filters = [
    { id: "all", label: "All", count: todays.length },
    { id: "waiting", label: "Waiting", count: todays.filter((a) => a.status === "waiting" || a.status === "scheduled").length },
    { id: "consultation", label: "In Consultation", count: todays.filter((a) => a.status === "in-consultation").length },
    { id: "done", label: "Done", count: stats.completed },
  ];

  return (
    <div className="max-w-7xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Today's overview"
        title="Reception Dashboard"
        description="Live patient queue and quick actions for the front desk."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/reception/appointments")}>
              <CalendarPlus className="size-4" />
              Book Appointment
            </Button>
            <Button onClick={() => navigate("/reception/patients/new")}>
              <UserPlus className="size-4" />
              Register Patient
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8 stagger">
        <StatCard label="Today's Patients" value={stats.total} icon={Users} accent="primary" />
        <StatCard label="Walk-ins" value={stats.walkins} icon={Zap} accent="purple" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} accent="emerald" />
        <StatCard label="Pending Payment" value={stats.pendingPayment} icon={AlertCircle} accent="amber" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Live Patient Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Updates in real-time as patients arrive and consultations complete.</p>
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
            <Empty
              icon={Filter}
              title="No patients in this view"
              description="Register a patient or book an appointment to see them appear in the queue."
            />
          ) : (
            <div className="flex flex-col gap-2 stagger">
              {queue.map((appt) => (
                <QueueRow
                  key={appt.id}
                  appointment={appt}
                  patient={patientById(appt.patientId)}
                  onClick={() => navigate(`/reception/patients/${appt.patientId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
