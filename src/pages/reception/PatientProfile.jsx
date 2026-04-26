import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Calendar, Receipt, CalendarPlus, Pencil } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Empty } from "@/components/ui/empty";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input, Field, FieldGroup, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { calcAge, formatDate, formatINR } from "@/lib/utils";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patients, appointments, invoices, users, addAppointment, updatePatient } = useStore();
  const patient = patients.find((p) => p.id === id);
  const [bookOpen, setBookOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto">
        <Empty title="Patient not found" description="This patient may have been removed." action={<Button onClick={() => navigate("/reception/patients")}>Back to patients</Button>} />
      </div>
    );
  }

  const patientAppts = appointments.filter((a) => a.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));
  const patientInvs = invoices.filter((i) => i.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-5xl mx-auto fade-up-enter">
      <button
        onClick={() => navigate("/reception/patients")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> All patients
      </button>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <Avatar name={patient.name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {patient.id} · {patient.gender} · {calcAge(patient.dob)}y · {patient.bloodGroup || "Blood group not set"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button onClick={() => setBookOpen(true)}>
                  <CalendarPlus className="size-4" />
                  Book Appointment
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{patient.phone}</span>
              {patient.address && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{patient.address}</span>}
              <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />Registered {formatDate(patient.createdAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {patient.allergies.map((a) => <Badge key={a} variant="danger">⚠ {a}</Badge>)}
              {patient.conditions.map((c) => <Badge key={c} variant="default">{c}</Badge>)}
              {patient.allergies.length === 0 && patient.conditions.length === 0 && (
                <span className="text-xs text-muted-foreground italic">No known allergies or conditions</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {patientAppts.length === 0 ? (
              <Empty icon={Calendar} title="No appointments yet" description="Book the first appointment for this patient." action={<Button onClick={() => setBookOpen(true)}><CalendarPlus className="size-4" />Book Appointment</Button>} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Date</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Slot</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Reason</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAppts.map((a) => (
                    <tr key={a.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{formatDate(a.date)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{a.slot}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{a.reason}</td>
                      <td className="px-5 py-3.5"><Badge variant={a.status}>{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {patientInvs.length === 0 ? (
              <Empty icon={Receipt} title="No invoices yet" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Invoice</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Date</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Amount</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Mode</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientInvs.map((i) => (
                    <tr key={i.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3.5 text-sm font-medium">{i.id}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{formatDate(i.date)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium">{formatINR(i.total)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{i.paymentMode || "—"}</td>
                      <td className="px-5 py-3.5"><Badge variant={i.status}>{i.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {editOpen && (
        <EditPatientDialog
          patient={patient}
          onClose={() => setEditOpen(false)}
          onSave={(updates) => {
            updatePatient(patient.id, updates);
            toast({ type: "success", title: "Patient updated" });
            setEditOpen(false);
          }}
        />
      )}

      {bookOpen && (
        <BookAppointmentDialog
          patient={patient}
          users={users}
          onClose={() => setBookOpen(false)}
          onConfirm={(data) => {
            addAppointment(data);
            toast({ type: "success", title: "Appointment booked", description: `${formatDate(data.date)} at ${data.slot}` });
            setBookOpen(false);
          }}
        />
      )}
    </div>
  );
}

function BookAppointmentDialog({ patient, users, onClose, onConfirm }) {
  const doctors = users.filter((u) => u.role === "doctor");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState("10:00");
  const [reason, setReason] = useState("");

  const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "16:00", "16:30", "17:00", "17:30", "18:00"];

  return (
    <Dialog open onClose={onClose} title="Book Appointment" description={`for ${patient.name}`}>
      <DialogBody>
        <FieldGroup>
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
        <Button onClick={() => onConfirm({ patientId: patient.id, doctorId, date, slot, reason, type: "scheduled" })}>
          Confirm Booking
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

function EditPatientDialog({ patient, onClose, onSave }) {
  const [form, setForm] = useState({
    name: patient.name,
    dob: patient.dob,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address || "",
    bloodGroup: patient.bloodGroup || "",
    allergies: patient.allergies.join(", "),
    conditions: patient.conditions.join(", "),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    onSave({
      ...form,
      allergies: form.allergies.split(",").map((s) => s.trim()).filter(Boolean),
      conditions: form.conditions.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open onClose={onClose} title="Edit Patient" description={`${patient.id}`} size="lg">
      <DialogBody>
        <FieldGroup>
          <Field>
            <Label>Full name</Label>
            <input
              className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Date of birth</Label>
              <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
            </Field>
            <Field>
              <Label>Gender</Label>
              <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field>
              <Label>Blood group</Label>
              <Select value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                <option value="">Not set</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Optional" />
          </Field>
          <Field>
            <Label>Allergies <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Input value={form.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="e.g. Penicillin, Aspirin" />
          </Field>
          <Field>
            <Label>Conditions <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Input value={form.conditions} onChange={(e) => set("conditions", e.target.value)} placeholder="e.g. Type 2 Diabetes, Hypertension" />
          </Field>
        </FieldGroup>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>
          <Pencil className="size-4" />
          Save Changes
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
