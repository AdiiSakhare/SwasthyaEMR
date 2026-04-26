import { ClipboardList, Pill } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Empty } from "@/components/ui/empty";
import { useStore } from "@/data/store";
import { useAuth } from "@/data/auth";
import { formatDate } from "@/lib/utils";

export default function Templates() {
  const { templates } = useStore();
  const { user } = useAuth();
  const myTemplates = templates.filter((t) => t.doctorId === user?.id);

  return (
    <div className="max-w-5xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Prescription templates"
        title="My Templates"
        description="Templates are saved during consultations via the Prescription panel."
      />

      {myTemplates.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border">
          <Empty icon={ClipboardList} title="No templates yet" description="Save prescriptions you write often as templates from the consultation screen." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 stagger">
          {myTemplates.map((t) => (
            <div key={t.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold tracking-tight">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Last used {formatDate(t.lastUsed)}</p>
                </div>
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Pill className="size-4" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {t.items.map((it, i) => (
                  <div key={i} className="text-sm bg-muted/40 rounded-lg p-2.5">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{it.dosage} · {it.frequency} · {it.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
