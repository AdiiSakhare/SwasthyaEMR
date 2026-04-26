import { useState, useMemo } from "react";
import { HeartPulse, CheckCircle2, Clock, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field, Label } from "@/components/ui/input";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { calcAge, formatTime, cn } from "@/lib/utils";

export default function NurseDashboard() {
  const { appointments, patients, vitals, recordVitals } = useStore();
  const { toast } = useToast();
  const today = new Date().toISOString().slice(0, 10);

  const queue = useMemo(
    () =>
      appointments
        .filter((a) => a.date === today && a.status !== "cancelled")
        .sort((a, b) => (a.slot > b.slot ? 1 : -1)),
    [appointments, today]
  );

  const hasVitalsToday = (patientId) =>
    vitals.some((v) => v.patientId === patientId && v.date === today);

  const done = queue.filter((a) => a.status === "completed").length;
  const vitalsRecorded = queue.filter((a) => hasVitalsToday(a.patientId)).length;
  const waiting = queue.filter((a) => a.status === "waiting" || a.status === "scheduled").length;

  return (
    <div className="max-w-5xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Nurse station"
        title="Today's Queue"
        description="Record vitals before patients see the doctor."
      />

      <div className="grid grid-cols-3 gap-3.5 mb-8 stagger">
        <StatCard label="Waiting" value={waiting} icon={Clock} accent="amber" />
        <StatCard label="Vitals Done" value={vitalsRecorded} icon={HeartPulse} accent="primary" />
        <StatCard label="Completed" value={done} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="flex flex-col gap-3 stagger">
        {queue.length === 0 && (
          <div className="bg-card rounded-2xl border border-border">
            <Empty icon={HeartPulse} title="No patients today" description="The queue is empty. Check back when appointments arrive." />
          </div>
        )}
        {queue.map((appt) => {
          const p = patients.find((x) => x.id === appt.patientId);
          const vitalsDone = hasVitalsToday(appt.patientId);
          return (
            <PatientVitalsCard
              key={appt.id}
              appointment={appt}
              patient={p}
              vitalsDone={vitalsDone}
              onSave={(data) => {
                recordVitals(appt.patientId, data);
                toast({ type: "success", title: "Vitals recorded", description: p?.name });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function PatientVitalsCard({ appointment, patient, vitalsDone, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ bp: "", temp: "", pulse: "", spo2: "", weight: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isActive = appointment.status === "waiting" || appointment.status === "scheduled";
  const hasData = Object.values(form).some((v) => v.trim());

  const handleSave = () => {
    onSave({ ...form, date: new Date().toISOString().slice(0, 10) });
    setExpanded(false);
    setForm({ bp: "", temp: "", pulse: "", spo2: "", weight: "" });
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl border overflow-hidden transition-all duration-200",
      vitalsDone ? "border-emerald-200" : isActive ? "border-border" : "border-border opacity-70"
    )}>
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <div className="relative">
          <Avatar name={patient?.name} size="md" />
          {vitalsDone && (
            <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
              <CheckCircle2 className="size-2.5 text-white" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">{patient?.name}</span>
            {appointment.type === "walkin" && <Badge variant="walkin">Walk-in</Badge>}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {patient?.gender} · {calcAge(patient?.dob)}y
            {appointment.reason && <> · {appointment.reason}</>}
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {appointment.type === "walkin" ? "Walk-in" : appointment.slot}
          </span>
          {appointment.checkInAt && <span>checked in {formatTime(appointment.checkInAt)}</span>}
        </div>

        <Badge variant={appointment.status}>
          {appointment.status === "in-consultation" ? "In Consult" : appointment.status}
        </Badge>

        {isActive && (
          <Button
            size="sm"
            variant={vitalsDone ? "outline" : "default"}
            onClick={() => setExpanded((v) => !v)}
          >
            <Activity className="size-3.5" />
            {vitalsDone ? "Re-record" : "Record Vitals"}
          </Button>
        )}
      </div>

      {/* Expandable vitals form */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Vitals for {patient?.name}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: "bp",     label: "BP",          placeholder: "120/80" },
              { key: "temp",   label: "Temp °F",     placeholder: "98.6" },
              { key: "pulse",  label: "Pulse bpm",   placeholder: "72" },
              { key: "spo2",   label: "SpO₂ %",      placeholder: "98" },
              { key: "weight", label: "Weight kg",   placeholder: "70" },
            ].map(({ key, label, placeholder }) => (
              <Field key={key}>
                <Label className="text-[10px]">{label}</Label>
                <Input
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="h-9 text-sm tabular-nums"
                />
              </Field>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" disabled={!hasData} onClick={handleSave}>
              <CheckCircle2 className="size-3.5" />
              Save Vitals
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
