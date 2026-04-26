import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayStrip } from "@/components/DayStrip";
import { CalendarDayView } from "@/components/CalendarDayView";
import { useStore } from "@/data/store";
import { useAuth } from "@/data/auth";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/* ─── Time-grid constants ───────────────────────────────── */
const HOUR_HEIGHT = 64;
const START_HOUR  = 8;
const END_HOUR    = 20;
const HOURS       = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TOTAL_H     = HOURS.length * HOUR_HEIGHT;
const EVENT_H     = HOUR_HEIGHT / 2 - 2; // 30-min block

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_EVENT = {
  scheduled:         { bg: "bg-sky-50",    border: "border-l-sky-400",    text: "text-sky-800"    },
  waiting:           { bg: "bg-amber-50",  border: "border-l-amber-400",  text: "text-amber-800"  },
  "in-consultation": { bg: "bg-violet-50", border: "border-l-violet-400", text: "text-violet-800" },
  completed:         { bg: "bg-emerald-50",border: "border-l-emerald-400",text: "text-emerald-700"},
  cancelled:         { bg: "bg-slate-100", border: "border-l-slate-300",  text: "text-slate-400"  },
};

/* ─── Utils ─────────────────────────────────────────────── */
function toDateStr(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}
function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function slotToMinutes(slot) {
  if (!slot || slot === "Walk-in") return START_HOUR * 60;
  const [h, m = 0] = slot.split(":").map(Number);
  return h * 60 + m;
}
function slotToTopPx(slot) {
  return ((slotToMinutes(slot) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}
function hourLabel(h) {
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}
function buildWeek(dateStr) {
  const d   = parseDate(dateStr);
  const off = (d.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) =>
    toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - off + i))
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function DoctorSchedule() {
  const { appointments, patients, updateAppointmentStatus } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const today    = toDateStr(new Date());
  const [date,   setDate]  = useState(today);
  const [view,   setView]  = useState("day");

  const myAppts = useMemo(
    () => appointments.filter(a => a.doctorId === user?.id),
    [appointments, user]
  );

  const apptDates = useMemo(() => new Set(myAppts.map(a => a.date)), [myAppts]);
  const weekDates = useMemo(() => buildWeek(date), [date]);

  const dayAppts = useMemo(
    () => myAppts.filter(a => a.date === date).sort((a, b) => slotToMinutes(a.slot) - slotToMinutes(b.slot)),
    [myAppts, date]
  );

  const startConsult = (appt) => {
    if (appt.status !== "in-consultation") {
      updateAppointmentStatus(appt.id, "in-consultation");
      const p = patients.find(x => x.id === appt.patientId);
      toast({ type: "success", title: "Consultation started", description: p?.name });
    }
    navigate(`/doctor/consultation/${appt.id}`);
  };

  /* Navigation for week view */
  const navWeek = (dir) => {
    const d = parseDate(date);
    setDate(toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir * 7)));
  };

  const weekLabel = () => {
    const [first, last] = [weekDates[0], weekDates[6]].map(parseDate);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (first.getMonth() === last.getMonth())
      return `${months[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
    return `${months[first.getMonth()]} ${first.getDate()} – ${months[last.getMonth()]} ${last.getDate()}, ${first.getFullYear()}`;
  };

  return (
    <div className="fade-up-enter -m-4 sm:-m-6 lg:-m-8" style={{ height: "calc(100vh - 4.5rem)" }}>
      <div className="flex flex-col h-full bg-white border-t border-slate-200">
        {/* ── Toolbar ───────────────────────────────── */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setDate(today)}
            className="px-3 h-8 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Today
          </button>

          {view === "week" && (
            <div className="flex items-center">
              <button onClick={() => navWeek(-1)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={() => navWeek(1)}  className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          <div className="flex-1">
            <span className="text-[15px] font-semibold text-slate-800">
              {view === "week" ? weekLabel() : parseDate(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          {/* View toggle */}
          <div className="inline-flex border border-slate-200 rounded-lg overflow-hidden text-xs font-medium">
            {["day", "week"].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3.5 h-8 capitalize border-r border-slate-200 last:border-0 transition-colors",
                  view === v ? "bg-[#00baff] text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ── Day view ──────────────────────────────── */}
        {view === "day" && (
          <>
            <div className="border-b border-slate-200 shrink-0">
              <DayStrip value={date} onChange={setDate} appointmentDates={apptDates} />
            </div>
            <div className="flex-1 overflow-auto">
              <CalendarDayView
                appointments={dayAppts}
                patients={patients}
                onRowClick={a => {
                  if (a.status === "waiting" || a.status === "in-consultation") startConsult(a);
                  else navigate(`/doctor/patients/${a.patientId}`);
                }}
                renderAction={a => {
                  if (a.status === "waiting" || a.status === "in-consultation") {
                    return (
                      <Button size="sm" onClick={e => { e.stopPropagation(); startConsult(a); }} className="shrink-0">
                        {a.status === "in-consultation" ? "Resume" : "Start"}
                        <ArrowRight className="size-3.5" />
                      </Button>
                    );
                  }
                  return null;
                }}
              />
            </div>
          </>
        )}

        {/* ── Week view ─────────────────────────────── */}
        {view === "week" && (
          <WeekTimeGrid
            weekDates={weekDates}
            today={today}
            myAppts={myAppts}
            patients={patients}
            onDayClick={str => { setDate(str); setView("day"); }}
            onEventClick={a => {
              if (a.status === "waiting" || a.status === "in-consultation") startConsult(a);
              else navigate(`/doctor/patients/${a.patientId}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── WeekTimeGrid ──────────────────────────────────────── */
function WeekTimeGrid({ weekDates, today, myAppts, patients, onDayClick, onEventClick }) {
  const pid = id => patients.find(p => p.id === id);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day column headers — sticky */}
      <div className="flex border-b border-slate-200 shrink-0 sticky top-0 bg-white z-10">
        <div className="w-14 shrink-0 border-r border-slate-200" />
        {weekDates.map(dateStr => {
          const [y, m, d] = dateStr.split("-").map(Number);
          const dayObj    = new Date(y, m - 1, d);
          const dow       = dayObj.getDay();
          const lbl       = WEEK_LABELS[dow === 0 ? 6 : dow - 1];
          const isToday   = dateStr === today;
          const count     = myAppts.filter(a => a.date === dateStr).length;

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                "flex-1 h-14 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 border-r border-slate-200 last:border-0 transition-colors relative",
                isToday && "bg-sky-50/40"
              )}
            >
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isToday ? "text-[#00baff]" : "text-slate-500")}>
                {lbl}
              </span>
              <span className={cn(
                "text-xl font-semibold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full leading-none",
                isToday ? "bg-[#00baff] text-white" : "text-slate-800"
              )}>
                {d}
              </span>
              {count > 0 && (
                <span className={cn(
                  "absolute top-1.5 right-2 text-[10px] font-semibold px-1 rounded-full",
                  isToday ? "bg-[#00baff]/20 text-[#00baff]" : "bg-slate-100 text-slate-500"
                )}>
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Time gutter */}
        <div className="w-14 shrink-0 border-r border-slate-200 relative" style={{ height: TOTAL_H }}>
          {HOURS.map((h, i) => (
            <div key={h} className="absolute w-full flex justify-end pr-2" style={{ top: i * HOUR_HEIGHT - 7 }}>
              <span className="text-[10px] text-slate-400 font-medium">{hourLabel(h)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1">
          {weekDates.map(dateStr => {
            const isToday  = dateStr === today;
            const dayAppts = myAppts.filter(a => a.date === dateStr && a.type !== "walkin");
            const walkIns  = myAppts.filter(a => a.date === dateStr && a.type === "walkin");

            return (
              <div
                key={dateStr}
                className={cn("flex-1 border-r border-slate-200 last:border-0 relative", isToday && "bg-sky-50/20")}
                style={{ height: TOTAL_H }}
              >
                {/* Hour lines */}
                {HOURS.map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: i * HOUR_HEIGHT }} />
                ))}
                {/* Half-hour dashed lines */}
                {HOURS.map((_, i) => (
                  <div key={`h${i}`} className="absolute w-full border-t border-dashed border-slate-50" style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
                ))}

                {/* Timed appointments */}
                {dayAppts.map(a => {
                  const p   = pid(a.patientId);
                  const st  = STATUS_EVENT[a.status] || STATUS_EVENT.scheduled;
                  const top = Math.max(0, Math.min(slotToTopPx(a.slot), TOTAL_H - EVENT_H));
                  return (
                    <div
                      key={a.id}
                      onClick={() => onEventClick(a)}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded overflow-hidden border-l-[3px] px-1.5 py-0.5 cursor-pointer hover:opacity-75 transition-opacity shadow-sm",
                        st.bg, st.border, a.status === "completed" && "opacity-50"
                      )}
                      style={{ top, height: EVENT_H }}
                    >
                      <p className={cn("text-[10px] font-semibold truncate leading-tight", st.text)}>
                        {a.slot} {p?.name}
                      </p>
                      {a.reason && (
                        <p className={cn("text-[9px] truncate opacity-70", st.text)}>{a.reason}</p>
                      )}
                    </div>
                  );
                })}

                {/* Walk-ins at 9 AM */}
                {walkIns.map((a, idx) => {
                  const p   = pid(a.patientId);
                  const top = (9 - START_HOUR) * HOUR_HEIGHT + idx * (EVENT_H + 4);
                  return (
                    <div
                      key={a.id}
                      onClick={() => onEventClick(a)}
                      className="absolute left-0.5 right-0.5 rounded overflow-hidden border-l-[3px] border-l-purple-400 bg-purple-50 px-1.5 py-0.5 cursor-pointer hover:opacity-75 transition-opacity shadow-sm"
                      style={{ top, height: EVENT_H }}
                    >
                      <p className="text-[10px] font-semibold text-purple-800 truncate leading-tight">Walk-in {p?.name}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
