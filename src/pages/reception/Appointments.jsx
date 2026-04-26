import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Zap, Search, X, Check, LayoutList, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input, Field, FieldGroup, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DayStrip } from "@/components/DayStrip";
import { CalendarDayView } from "@/components/CalendarDayView";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { calcAge, formatDate, cn } from "@/lib/utils";

export default function Appointments() {
  const { appointments, patients, users, updateAppointmentStatus } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookOpen, setBookOpen] = useState(false);
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [view, setView] = useState("list"); // "list" | "calendar"

  const list = useMemo(
    () => appointments.filter((a) => a.date === date).sort((a, b) => (a.slot > b.slot ? 1 : -1)),
    [appointments, date]
  );

  // For the dot indicators on the day strip
  const appointmentDates = useMemo(
    () => new Set(appointments.map((a) => a.date)),
    [appointments]
  );

  const patientById = (id) => patients.find((p) => p.id === id);

  const handleStatusChange = (id, status, label) => {
    updateAppointmentStatus(id, status);
    toast({ type: "success", title: label });
  };

  return (
    <div className="max-w-6xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Appointments"
        title="Schedule"
        description="Manage bookings and walk-ins across any day."
        actions={
          <>
            <Button variant="outline" onClick={() => setWalkinOpen(true)}>
              <Zap className="size-4" />
              Walk-in
            </Button>
            <Button onClick={() => setBookOpen(true)}>
              <CalendarPlus className="size-4" />
              Book Appointment
            </Button>
          </>
        }
      />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Day strip */}
        <div className="border-b border-border">
          <DayStrip value={date} onChange={setDate} appointmentDates={appointmentDates} />
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatDate(date)}</span>
            <span className="text-xs text-muted-foreground">
              · {list.length} appointment{list.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="inline-flex items-center gap-0.5 p-0.5 bg-muted rounded-lg">
            <button
              onClick={() => setView("list")}
              className={cn("size-7 rounded-md flex items-center justify-center transition-colors",
                view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              title="List view"
            >
              <LayoutList className="size-3.5" />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn("size-7 rounded-md flex items-center justify-center transition-colors",
                view === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              title="Calendar view"
            >
              <Calendar className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {view === "calendar" ? (
          <CalendarDayView
            appointments={list}
            patients={patients}
            onRowClick={(a) => navigate(`/reception/patients/${a.patientId}`)}
            renderAction={(a) =>
              a.status === "scheduled" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(a.id, "waiting", "Marked as arrived"); }}
                  className="shrink-0"
                >
                  <Check className="size-3" />
                  Arrived
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            {list.length === 0 ? (
              <Empty
                icon={CalendarPlus}
                title="No appointments on this date"
                description="Book one or register a walk-in to populate the schedule."
                action={
                  <Button onClick={() => setBookOpen(true)}>
                    <CalendarPlus className="size-4" />
                    Book Appointment
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {list.map((a) => {
                  const p = patientById(a.patientId);
                  return (
                    <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
                      <div className="hidden sm:flex flex-col items-center justify-center w-16 shrink-0 py-2 bg-muted rounded-xl">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{a.type === "walkin" ? "WALK" : "Slot"}</span>
                        <span className="font-semibold text-sm">{a.type === "walkin" ? "—" : a.slot}</span>
                      </div>
                      <Avatar name={p?.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/reception/patients/${p.id}`)}
                            className="font-medium text-foreground hover:text-primary truncate"
                          >
                            {p?.name}
                          </button>
                          {a.type === "walkin" && <Badge variant="walkin">Walk-in</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{p?.gender} · {calcAge(p?.dob)}y · {a.reason}</p>
                      </div>
                      <Badge variant={a.status}>{a.status}</Badge>
                      <div className="flex items-center gap-1.5">
                        {a.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(a.id, "waiting", "Marked as arrived")}
                          >
                            <Check className="size-3.5" />
                            Arrived
                          </Button>
                        )}
                        {(a.status === "scheduled" || a.status === "waiting") && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Cancel appointment"
                            onClick={() => handleStatusChange(a.id, "cancelled", "Appointment cancelled")}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {bookOpen && <BookDialog onClose={() => setBookOpen(false)} />}
      {walkinOpen && <WalkinDialog onClose={() => setWalkinOpen(false)} />}
    </div>
  );
}

/* ─────────────────────── BookDialog ─────────────────────── */
function BookDialog({ onClose }) {
  const { patients, users, addAppointment } = useStore();
  const { toast } = useToast();
  const doctors = users.filter((u) => u.role === "doctor");
  const [q, setQ] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("10:00");
  const [reason, setReason] = useState("");

  const filtered = q
    ? patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q))
    : patients.slice(0, 6);
  const slots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","16:00","16:30","17:00","17:30","18:00"];
  const selected = patients.find((p) => p.id === patientId);

  const submit = () => {
    if (!patientId) return;
    addAppointment({ patientId, doctorId, date, slot, reason, type: "scheduled" });
    toast({ type: "success", title: "Appointment booked", description: `${selected?.name} · ${date} at ${slot}` });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} title="Book Appointment" size="lg">
      <DialogBody>
        <FieldGroup>
          <Field>
            <Label>Patient</Label>
            {selected ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} size="md" />
                  <div>
                    <p className="font-medium text-sm">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.id} · {selected.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPatientId("")}>Change</Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Search patient by name or phone..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
                </div>
                <div className="mt-2 max-h-48 overflow-y-auto flex flex-col gap-1 border border-border rounded-xl p-1">
                  {filtered.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3">No patients match.</p>
                  ) : filtered.map((p) => (
                    <button key={p.id} onClick={() => setPatientId(p.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                      <Avatar name={p.name} size="sm" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Field>

          <Field>
            <Label>Doctor</Label>
            <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field>
              <Label>Time slot</Label>
              <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>

          <Field>
            <Label>Reason for visit (optional)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up for diabetes" />
          </Field>
        </FieldGroup>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={!patientId} onClick={submit}>
          <CalendarPlus className="size-4" />
          Confirm Booking
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/* ─────────────────────── WalkinDialog ─────────────────────── */
function WalkinDialog({ onClose }) {
  const { patients, users, addAppointment, addPatient, findDuplicatePatient } = useStore();
  const { toast } = useToast();
  const doctors = users.filter((u) => u.role === "doctor");
  const [mode, setMode] = useState("existing");
  const [q, setQ] = useState("");
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("M");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id);
  const [reason, setReason] = useState("");

  const filtered = q
    ? patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q))
    : patients.slice(0, 6);
  const today = new Date().toISOString().slice(0, 10);

  const submit = () => {
    let pid = patientId;
    if (mode === "new") {
      if (!name || !phone) return;
      const dup = findDuplicatePatient(phone);
      if (dup) {
        pid = dup.id;
        toast({ title: "Existing patient found", description: `Using ${dup.name}'s record.` });
      } else {
        const p = addPatient({ name, phone, gender, dob: "" });
        pid = p.id;
      }
    }
    if (!pid) return;
    addAppointment({ patientId: pid, doctorId, date: today, slot: "Walk-in", reason, type: "walkin" });
    toast({ type: "success", title: "Walk-in added to queue" });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} title="Walk-in Registration" description="Quick-add a patient to today's queue" size="lg">
      <DialogBody>
        <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-xl mb-4">
          <button
            onClick={() => setMode("existing")}
            className={cn("px-3 h-8 text-xs font-medium rounded-lg transition-colors",
              mode === "existing" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Existing patient
          </button>
          <button
            onClick={() => setMode("new")}
            className={cn("px-3 h-8 text-xs font-medium rounded-lg transition-colors",
              mode === "new" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Quick register
          </button>
        </div>

        <FieldGroup>
          {mode === "existing" ? (
            <Field>
              <Label>Search patient</Label>
              {patientId ? (
                <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Avatar name={patients.find((p) => p.id === patientId)?.name} size="md" />
                    <span className="font-medium text-sm">{patients.find((p) => p.id === patientId)?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPatientId("")}>Change</Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-10" placeholder="Name or phone..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto flex flex-col gap-1 border border-border rounded-xl p-1">
                    {filtered.map((p) => (
                      <button key={p.id} onClick={() => setPatientId(p.id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left">
                        <Avatar name={p.name} size="sm" />
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{p.phone}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Field>
          ) : (
            <>
              <Field>
                <Label>Full name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Walk-in Patient" autoFocus />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label>Phone *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
                </Field>
                <Field>
                  <Label>Gender</Label>
                  <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </Select>
                </Field>
              </div>
            </>
          )}

          <Field>
            <Label>Doctor</Label>
            <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>

          <Field>
            <Label>Reason for visit (optional)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fever, cough" />
          </Field>
        </FieldGroup>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={mode === "existing" ? !patientId : !name || !phone}>
          <Zap className="size-4" />
          Add to Queue
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
