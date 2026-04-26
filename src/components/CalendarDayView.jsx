import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { calcAge, cn } from "@/lib/utils";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "12:30", "13:00", "16:00", "16:30", "17:00", "17:30", "18:00",
];

const STATUS_LABEL = {
  scheduled: "Scheduled",
  waiting: "Waiting",
  "in-consultation": "In Consult",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_ROW = {
  waiting: "border-l-amber-400 bg-amber-50/70",
  "in-consultation": "border-l-violet-400 bg-violet-50/70",
  completed: "border-l-emerald-400 bg-emerald-50/50 opacity-70",
  cancelled: "border-l-slate-300 bg-slate-50/60 opacity-50",
  scheduled: "border-l-sky-400 bg-sky-50/70",
};

/**
 * CalendarDayView — shared between Reception Appointments and Doctor Schedule
 *
 * Props:
 *   appointments  — array of appointment objects for the selected date
 *   patients      — full patients array
 *   onRowClick    — (appointment) => void
 *   renderAction  — (appointment) => JSX | null — slot for extra button per row
 */
export function CalendarDayView({ appointments, patients, onRowClick, renderAction }) {
  const patientById = (id) => patients.find((p) => p.id === id);

  // group appointments into named slots (walk-ins go to a special bucket)
  const slotMap = {};
  const walkIns = [];

  appointments.forEach((a) => {
    if (a.type === "walkin") {
      walkIns.push(a);
    } else {
      if (!slotMap[a.slot]) slotMap[a.slot] = [];
      slotMap[a.slot].push(a);
    }
  });

  const isEmpty = appointments.length === 0;

  return (
    <div className="overflow-hidden">
      {/* Walk-ins row */}
      {walkIns.length > 0 && (
        <div className="border-b border-border">
          <div className="flex items-start gap-0">
            <div className="w-20 shrink-0 pt-3.5 pb-3.5 px-3 flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">Walk-in</span>
            </div>
            <div className="flex-1 min-w-0 border-l border-border py-2 px-3 flex flex-col gap-1.5">
              {walkIns.map((a) => (
                <AppointmentChip key={a.id} a={a} patient={patientById(a.patientId)} onRowClick={onRowClick} renderAction={renderAction} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time slots */}
      {TIME_SLOTS.map((slot, idx) => {
        const appts = slotMap[slot] || [];
        const isHalfHour = slot.endsWith(":30");
        return (
          <div key={slot} className={cn("flex items-start gap-0 border-b border-border/60 last:border-0", isHalfHour && "border-dashed")}>
            <div className="w-20 shrink-0 pt-3 pb-3 px-3 flex flex-col items-end">
              <span className={cn("text-xs font-medium tabular-nums", isHalfHour ? "text-muted-foreground/50" : "text-muted-foreground")}>
                {slot}
              </span>
            </div>
            <div className={cn("flex-1 min-w-0 border-l border-border/60 py-1.5 px-3 min-h-[48px]", isHalfHour && "border-dashed")}>
              {appts.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {appts.map((a) => (
                    <AppointmentChip key={a.id} a={a} patient={patientById(a.patientId)} onRowClick={onRowClick} renderAction={renderAction} />
                  ))}
                </div>
              ) : (
                <div className="h-full" />
              )}
            </div>
          </div>
        );
      })}

      {isEmpty && (
        <div className="py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">No appointments on this day</p>
          <p className="text-xs text-muted-foreground mt-1">Select a different date or book an appointment.</p>
        </div>
      )}
    </div>
  );
}

function AppointmentChip({ a, patient, onRowClick, renderAction }) {
  const isWalkin = a.type === "walkin";
  return (
    <div
      onClick={() => onRowClick?.(a)}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg border-l-2 cursor-pointer group",
        "transition-all duration-150 hover:brightness-95",
        STATUS_ROW[a.status] || STATUS_ROW.scheduled
      )}
    >
      <Avatar name={patient?.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium truncate">{patient?.name}</span>
          {patient && <span className="text-xs text-muted-foreground">{patient.gender} · {calcAge(patient.dob)}y</span>}
          {isWalkin && <Badge variant="walkin">Walk-in</Badge>}
        </div>
        {a.reason && <p className="text-xs text-muted-foreground truncate mt-0.5">{a.reason}</p>}
      </div>
      <Badge variant={a.status}>{STATUS_LABEL[a.status] || a.status}</Badge>
      {renderAction?.(a)}
    </div>
  );
}
