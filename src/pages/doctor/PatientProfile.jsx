import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Calendar, Activity, Pill, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { calcAge, formatDate } from "@/lib/utils";

export default function DoctorPatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, visits, prescriptions, vitals } = useStore();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto">
        <Empty title="Patient not found" action={<Button onClick={() => navigate("/doctor/patients")}>Back to patients</Button>} />
      </div>
    );
  }

  const patientVisits = visits.filter((v) => v.patientId === id).sort((a, b) => b.date.localeCompare(a.date));
  const patientRx = prescriptions.filter((r) => r.patientId === id).sort((a, b) => b.date.localeCompare(a.date));
  const patientVitals = vitals.filter((v) => v.patientId === id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-5xl mx-auto fade-up-enter">
      <button onClick={() => navigate("/doctor/patients")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> All patients
      </button>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          <Avatar name={patient.name} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {patient.id} · {patient.gender} · {calcAge(patient.dob)}y · {patient.bloodGroup || "Blood group not set"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{patient.phone}</span>
              {patient.address && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{patient.address}</span>}
              <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />Registered {formatDate(patient.createdAt)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {patient.allergies.map((a) => <Badge key={a} variant="danger"><AlertTriangle className="size-3" /> {a}</Badge>)}
              {patient.conditions.map((c) => <Badge key={c} variant="default">{c}</Badge>)}
              {patient.allergies.length === 0 && patient.conditions.length === 0 && (
                <span className="text-xs text-muted-foreground italic">No known allergies or conditions</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="visits">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {patientVisits.length === 0 ? (
              <Empty icon={FileText} title="No visit history" description="This patient has not yet had a consultation." />
            ) : (
              <div className="divide-y divide-border">
                {patientVisits.map((v) => (
                  <div key={v.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm font-semibold">{formatDate(v.date)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.complaint}</p>
                      </div>
                      <Badge variant="completed">Completed</Badge>
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Diagnosis</p>
                        <p>{v.diagnosis}</p>
                      </div>
                      {v.notes && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                          <p className="text-muted-foreground">{v.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {patientRx.length === 0 ? (
              <Empty icon={Pill} title="No prescriptions yet" />
            ) : (
              <div className="divide-y divide-border">
                {patientRx.map((rx) => (
                  <div key={rx.id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold">{rx.id}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(rx.date)}</p>
                      </div>
                      <Badge variant={rx.dispensed ? "completed" : "waiting"}>{rx.dispensed ? "Dispensed" : "Pending"}</Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {rx.items.map((it, i) => (
                        <div key={i} className="text-sm bg-muted/40 rounded-lg p-3">
                          <p className="font-medium">{it.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{it.dosage} · {it.frequency} · {it.duration}</p>
                          {it.instructions && <p className="text-xs text-muted-foreground italic mt-1">{it.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vitals">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {patientVitals.length === 0 ? (
              <Empty icon={Activity} title="No vitals recorded" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Date</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">BP</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Temp</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Pulse</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">SpO2</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {patientVitals.map((v, i) => (
                    <tr key={i} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 text-sm font-medium">{formatDate(v.date)}</td>
                      <td className="px-5 py-3 text-sm">{v.bp}</td>
                      <td className="px-5 py-3 text-sm">{v.temp}°F</td>
                      <td className="px-5 py-3 text-sm">{v.pulse}</td>
                      <td className="px-5 py-3 text-sm">{v.spo2}%</td>
                      <td className="px-5 py-3 text-sm">{v.weight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
