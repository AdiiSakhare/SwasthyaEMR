import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2, Pill, Printer, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { PrintPrescription } from "@/components/PrintInvoice";
import { calcAge, formatDate } from "@/lib/utils";

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { prescriptions, patients, users, clinic, dispensePrescription } = useStore();

  const rx = prescriptions.find((r) => r.id === id);
  const patient = rx ? patients.find((p) => p.id === rx.patientId) : null;
  const doctor = rx ? users.find((u) => u.id === rx.doctorId) : null;

  if (!rx || !patient) {
    return (
      <div className="max-w-3xl mx-auto">
        <Empty title="Prescription not found" action={<Button onClick={() => navigate("/pharmacy")}>Back to queue</Button>} />
      </div>
    );
  }

  const onDispense = () => {
    dispensePrescription(rx.id);
    toast({ type: "success", title: "Marked as dispensed", description: `${rx.items.length} medicines · ${patient.name}` });
    navigate("/pharmacy");
  };

  return (
    <div className="max-w-3xl mx-auto fade-up-enter">
      <button onClick={() => navigate("/pharmacy")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to queue
      </button>

      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-4">
            <Avatar name={patient.name} size="lg" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{patient.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {patient.id} · {patient.gender} · {calcAge(patient.dob)}y
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{patient.phone}</p>
            </div>
          </div>
          <Badge variant={rx.dispensed ? "completed" : "waiting"}>{rx.dispensed ? "Dispensed" : "Pending"}</Badge>
        </div>

        {patient.allergies.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-rose-700 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-rose-900">Allergies on record</p>
              <p className="text-rose-800 mt-0.5">{patient.allergies.join(", ")}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pb-4 mb-4 border-b border-border">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rx ID</p>
            <p className="font-medium mt-0.5">{rx.id}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</p>
            <p className="font-medium mt-0.5">{formatDate(rx.date)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Doctor</p>
            <p className="font-medium mt-0.5 inline-flex items-center gap-1"><Stethoscope className="size-3" />{doctor?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          <Pill className="size-3.5" /> Medicines · {rx.items.length}
        </div>
        <div className="flex flex-col gap-2.5">
          {rx.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium">{it.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    <span><span className="text-foreground font-medium">{it.dosage}</span> dose</span>
                    <span>{it.frequency}</span>
                    <span>for {it.duration}</span>
                  </div>
                  {it.instructions && (
                    <p className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-border">
                      {it.instructions}
                    </p>
                  )}
                </div>
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between sticky bottom-4 no-print">
        <p className="text-xs text-muted-foreground">
          {rx.dispensed ? "Already dispensed." : "Confirm all medicines have been handed over."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
          {!rx.dispensed && (
            <Button onClick={onDispense}>
              <CheckCircle2 className="size-4" />
              Mark as Dispensed
            </Button>
          )}
        </div>
      </div>

      <PrintPrescription prescription={rx} patient={patient} doctor={doctor} clinic={clinic} />
    </div>
  );
}
