import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Activity, History, Pill, Plus, Trash2, FileCheck2, Save, Sparkles, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Field, FieldGroup, Label } from "@/components/ui/input";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { useAuth } from "@/data/auth";
import { useToast } from "@/components/ui/toast";
import { calcAge, formatDate, cn } from "@/lib/utils";

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { appointments, patients, visits, prescriptions, vitals, medicines, templates, completeConsultation, addTemplate, recordVitals } = useStore();

  const appointment = appointments.find((a) => a.id === appointmentId);
  const patient = patients.find((p) => p.id === appointment?.patientId);

  const [complaint, setComplaint] = useState(appointment?.reason || "");
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [items, setItems] = useState([]);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [medSearchOpen, setMedSearchOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [vForm, setVForm] = useState({ bp: "", temp: "", pulse: "", spo2: "", weight: "" });

  if (!appointment || !patient) {
    return (
      <div className="max-w-3xl mx-auto">
        <Empty title="Appointment not found" description="This appointment may have been removed." action={<Button onClick={() => navigate("/doctor")}>Back to queue</Button>} />
      </div>
    );
  }

  const patientVisits = visits.filter((v) => v.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date));
  const lastVisit = patientVisits[0];
  const lastRx = lastVisit ? prescriptions.find((r) => r.id === lastVisit.prescriptionId) : null;
  const latestVitals = vitals.find((v) => v.patientId === patient.id);
  const myTemplates = templates.filter((t) => t.doctorId === user?.id);

  const addItem = (item) => setItems((arr) => [...arr, item]);
  const removeItem = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx));
  const updateItem = (idx, patch) => setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const applyTemplate = (tpl) => {
    setItems((arr) => [...arr, ...tpl.items.map((it) => ({ ...it }))]);
    setTemplateOpen(false);
    toast({ type: "success", title: "Template applied", description: `${tpl.items.length} medicines added from "${tpl.name}"` });
  };

  const finish = () => {
    if (!diagnosis.trim()) {
      toast({ type: "error", title: "Diagnosis required", description: "Add a diagnosis before completing the consultation." });
      return;
    }
    completeConsultation(appointment.id, {
      complaint, notes, diagnosis, followUp,
      prescriptionItems: items.length ? items : null,
    });
    toast({ type: "success", title: "Consultation completed", description: `${patient.name} · invoice generated` });
    navigate("/doctor");
  };

  return (
    <div className="max-w-7xl mx-auto fade-up-enter">
      <button onClick={() => navigate("/doctor")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to queue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <aside className="flex flex-col gap-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-start gap-3">
              <Avatar name={patient.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold tracking-tight">{patient.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{patient.id} · {patient.gender} · {calcAge(patient.dob)}y · {patient.bloodGroup || "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">{patient.phone}</p>
              </div>
            </div>
          </div>

          {(patient.allergies.length > 0 || patient.conditions.length > 0) && (
            <div className="bg-card rounded-2xl border border-border p-4">
              {patient.allergies.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 mb-2">
                    <AlertTriangle className="size-3.5" /> Allergies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a) => <Badge key={a} variant="danger">{a}</Badge>)}
                  </div>
                </div>
              )}
              {patient.conditions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Chronic Conditions</div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.map((c) => <Badge key={c} variant="default">{c}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {latestVitals && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
                <Activity className="size-3.5" /> Vitals · {formatDate(latestVitals.date)}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="BP" value={latestVitals.bp} />
                <Stat label="Temp" value={`${latestVitals.temp}°F`} />
                <Stat label="Pulse" value={latestVitals.pulse} />
                <Stat label="SpO2" value={`${latestVitals.spo2}%`} />
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
              <History className="size-3.5" /> Visit History
            </div>
            {patientVisits.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No previous visits.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {patientVisits.slice(0, 4).map((v) => (
                  <div key={v.id} className="text-xs border-l-2 border-border pl-3">
                    <p className="font-medium text-foreground">{formatDate(v.date)}</p>
                    <p className="text-muted-foreground mt-0.5">{v.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lastRx && (
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
                <Pill className="size-3.5" /> Last Prescription
              </div>
              <div className="flex flex-col gap-1.5">
                {lastRx.items.map((it, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-medium text-foreground">{it.name}</p>
                    <p className="text-muted-foreground">{it.dosage} · {it.frequency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Consultation</p>
                <h1 className="text-xl font-semibold tracking-tight mt-1">Clinical Notes</h1>
              </div>
              <Badge variant="in-consultation">In Consultation</Badge>
            </div>

            <FieldGroup>
              <Field>
                <Label>Chief Complaint</Label>
                <Textarea rows={2} value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Patient's primary reason for visit..." />
              </Field>
              <Field>
                <Label>Clinical Notes</Label>
                <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Examination findings, history, observations..." />
              </Field>
              <Field>
                <Label>Diagnosis *</Label>
                <Textarea rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Provisional or confirmed diagnosis..." />
              </Field>
              <Field>
                <Label>Follow-up date (optional)</Label>
                <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              </Field>
            </FieldGroup>
          </div>

          {/* Vitals panel */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setVitalsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="size-4 text-primary" />
                Record Vitals
                {latestVitals && <span className="text-xs font-normal text-muted-foreground ml-1">· last recorded today</span>}
              </div>
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200", vitalsOpen && "rotate-180")} />
            </button>
            {vitalsOpen && (
              <div className="px-5 pb-5 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {[
                    { key: "bp", label: "Blood Pressure", placeholder: "e.g. 120/80" },
                    { key: "temp", label: "Temperature (°F)", placeholder: "e.g. 98.6" },
                    { key: "pulse", label: "Pulse (bpm)", placeholder: "e.g. 72" },
                    { key: "spo2", label: "SpO₂ (%)", placeholder: "e.g. 98" },
                    { key: "weight", label: "Weight (kg)", placeholder: "e.g. 70" },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key}>
                      <Label>{label}</Label>
                      <Input
                        placeholder={placeholder}
                        value={vForm[key]}
                        onChange={(e) => setVForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="h-9"
                      />
                    </Field>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    const hasData = Object.values(vForm).some((v) => v.trim());
                    if (!hasData) return;
                    recordVitals(patient.id, vForm);
                    toast({ type: "success", title: "Vitals recorded" });
                    setVForm({ bp: "", temp: "", pulse: "", spo2: "", weight: "" });
                    setVitalsOpen(false);
                  }}
                >
                  <Activity className="size-3.5" />
                  Save Vitals
                </Button>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Prescription</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add medicines, dosage and instructions.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {myTemplates.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}>
                    <Sparkles className="size-3.5" />
                    Apply Template
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setMedSearchOpen(true)}>
                  <Search className="size-3.5" />
                  Search Medicine
                </Button>
                <Button size="sm" onClick={() => addItem({ name: "", dosage: "", frequency: "", duration: "", instructions: "" })}>
                  <Plus className="size-3.5" />
                  Add Row
                </Button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Pill className="size-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No medicines added yet</p>
                <p className="text-xs text-muted-foreground mt-1">Apply a template or add a row to begin.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((it, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-3 bg-muted/20">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="Medicine name" value={it.name} onChange={(e) => updateItem(idx, { name: e.target.value })} className="h-9" />
                        <Input placeholder="Dosage (e.g. 1 tab)" value={it.dosage} onChange={(e) => updateItem(idx, { dosage: e.target.value })} className="h-9" />
                        <Input placeholder="Frequency (e.g. Twice daily)" value={it.frequency} onChange={(e) => updateItem(idx, { frequency: e.target.value })} className="h-9" />
                        <Input placeholder="Duration (e.g. 5 days)" value={it.duration} onChange={(e) => updateItem(idx, { duration: e.target.value })} className="h-9" />
                        <Input placeholder="Instructions (optional)" value={it.instructions} onChange={(e) => updateItem(idx, { instructions: e.target.value })} className="h-9 sm:col-span-2" />
                      </div>
                      <button onClick={() => removeItem(idx)} className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {items.length > 0 && (
                  <button onClick={() => setSaveTplOpen(true)} className="text-xs text-primary hover:underline self-start inline-flex items-center gap-1">
                    <Save className="size-3" /> Save as template
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between sticky bottom-4">
            <p className="text-xs text-muted-foreground">Completing will generate an invoice and send Rx to pharmacy.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/doctor")}>Cancel</Button>
              <Button onClick={finish}>
                <FileCheck2 className="size-4" />
                Complete Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {templateOpen && (
        <Dialog open onClose={() => setTemplateOpen(false)} title="Apply Template" description="Pre-fill prescription from a saved template">
          <DialogBody>
            <div className="flex flex-col gap-2">
              {myTemplates.map((t) => (
                <button key={t.id} onClick={() => applyTemplate(t)} className="text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.items.length} medicines · last used {formatDate(t.lastUsed)}</p>
                </button>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>Close</Button>
          </DialogFooter>
        </Dialog>
      )}

      {saveTplOpen && (
        <SaveTemplateDialog
          onClose={() => setSaveTplOpen(false)}
          onSave={(name) => {
            addTemplate(user.id, name, items);
            toast({ type: "success", title: "Template saved", description: name });
            setSaveTplOpen(false);
          }}
        />
      )}

      {medSearchOpen && (
        <MedicineSearchDialog
          medicines={medicines}
          onClose={() => setMedSearchOpen(false)}
          onPick={(m) => {
            addItem({ name: m.name, dosage: "", frequency: "", duration: "", instructions: "" });
            setMedSearchOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function SaveTemplateDialog({ onClose, onSave }) {
  const [name, setName] = useState("");
  return (
    <Dialog open onClose={onClose} title="Save as Template" description="Reuse this prescription on future consultations">
      <DialogBody>
        <Field>
          <Label>Template name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diabetes follow-up" autoFocus />
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={!name.trim()} onClick={() => onSave(name.trim())}>Save Template</Button>
      </DialogFooter>
    </Dialog>
  );
}

function MedicineSearchDialog({ medicines, onClose, onPick }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return medicines.slice(0, 10);
    const term = q.toLowerCase();
    return medicines.filter((m) => m.name.toLowerCase().includes(term) || m.category.toLowerCase().includes(term));
  }, [q, medicines]);

  return (
    <Dialog open onClose={onClose} title="Search Medicine" description="Pick from clinic formulary">
      <DialogBody>
        <div className="relative mb-3">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or category..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
          {filtered.map((m) => (
            <button key={m.id} onClick={() => onPick(m)} className="text-left p-2.5 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.category} · {m.form}</p>
              </div>
              <Plus className="size-4 text-muted-foreground" />
            </button>
          ))}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground p-3 italic">No medicines found.</p>}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}
