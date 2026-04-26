import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { calcAge, cn, formatTime } from "@/lib/utils";

const STATUS_LABEL = {
  scheduled: "Scheduled",
  waiting: "Waiting",
  "in-consultation": "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

/** Returns how many minutes ago the patient checked in, or null */
function waitMinutes(checkInAt) {
  if (!checkInAt) return null;
  return Math.floor((Date.now() - new Date(checkInAt).getTime()) / 60000);
}

export function QueueRow({ appointment, patient, action, onClick, className }) {
  const isWalkin = appointment.type === "walkin";
  const isWaiting = appointment.status === "waiting";
  const waited = isWaiting ? waitMinutes(appointment.checkInAt) : null;
  const overdue = waited !== null && waited >= 20; // amber pulse after 20 min
  const urgent  = waited !== null && waited >= 40; // rose pulse after 40 min

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:border-primary/30 hover:bg-muted/40 transition-all cursor-pointer",
        urgent  ? "border-rose-300"   :
        overdue ? "border-amber-300"  : "border-border",
        className
      )}
    >
      {/* Avatar with optional pulse ring */}
      <div className="relative shrink-0">
        <Avatar name={patient?.name} size="md" />
        {overdue && (
          <span className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-60",
            urgent ? "bg-rose-400" : "bg-amber-400"
          )} />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">{patient?.name}</span>
          {isWalkin && <Badge variant="walkin">Walk-in</Badge>}
          {overdue && (
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              urgent
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
            )}>
              {waited}m wait
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{patient?.gender} · {calcAge(patient?.dob)}y</span>
          {appointment.reason && (
            <>
              <span className="size-1 rounded-full bg-border" />
              <span className="truncate">{appointment.reason}</span>
            </>
          )}
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {isWalkin ? "Walk-in" : appointment.slot}
        </span>
        {appointment.checkInAt && (
          <span>checked in {formatTime(appointment.checkInAt)}</span>
        )}
      </div>

      <Badge variant={appointment.status}>{STATUS_LABEL[appointment.status] || appointment.status}</Badge>
      {action}
    </div>
  );
}
