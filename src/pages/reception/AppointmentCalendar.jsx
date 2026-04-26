import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/* ─── Layout constants ──────────────────────────────────── */
const HOUR_HEIGHT = 64;   // px per hour in time-grid
const START_HOUR  = 8;    // 8 AM
const END_HOUR    = 20;   // 8 PM
const HOURS       = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TOTAL_H     = HOURS.length * HOUR_HEIGHT;
const EVENT_H     = HOUR_HEIGHT / 2 - 2; // 30-min appointment block

const WEEK_LABELS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─── Status → Tailwind classes ─────────────────────────── */
const STATUS_EVENT = {
  scheduled:         { bg: "bg-sky-50",    border: "border-l-sky-400",    text: "text-sky-800"    },
  waiting:           { bg: "bg-amber-50",  border: "border-l-amber-400",  text: "text-amber-800"  },
  "in-consultation": { bg: "bg-violet-50", border: "border-l-violet-400", text: "text-violet-800" },
  completed:         { bg: "bg-emerald-50",border: "border-l-emerald-400",text: "text-emerald-700"},
  cancelled:         { bg: "bg-slate-100", border: "border-l-slate-300",  text: "text-slate-400"  },
  walkin:            { bg: "bg-purple-50", border: "border-l-purple-400", text: "text-purple-800" },
};

const STATUS_DOT = {
  scheduled:         "bg-sky-400",
  waiting:           "bg-amber-400",
  "in-consultation": "bg-violet-400",
  completed:         "bg-emerald-400",
  cancelled:         "bg-slate-300",
  walkin:            "bg-purple-400",
};

/* ─── Date utilities ────────────────────────────────────── */
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
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}
function prevMo(y, m) { return m === 0  ? { year: y - 1, month: 11 } : { year: y, month: m - 1 }; }
function nextMo(y, m) { return m === 11 ? { year: y + 1, month: 0  } : { year: y, month: m + 1 }; }

function buildMonthGrid(year, month) {
  const first  = new Date(year, month, 1);
  const last   = new Date(year, month + 1, 0);
  const offset = (first.getDay() + 6) % 7; // Mon-first
  const cells  = [];
  for (let i = offset; i > 0; i--)       cells.push({ date: toDateStr(new Date(year, month,     1 - i)),     isCurrentMonth: false });
  for (let d = 1; d <= last.getDate(); d++) cells.push({ date: toDateStr(new Date(year, month,     d)),         isCurrentMonth: true  });
  const tail = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= tail; d++)         cells.push({ date: toDateStr(new Date(year, month + 1, d)),         isCurrentMonth: false });
  return cells;
}

function buildWeek(dateStr) {
  const d   = parseDate(dateStr);
  const off = (d.getDay() + 6) % 7; // offset to Monday
  return Array.from({ length: 7 }, (_, i) =>
    toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() - off + i))
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function AppointmentCalendar() {
  const { appointments, patients, users } = useStore();
  const { toast } = useToast();

  const today   = toDateStr(new Date());
  const initD   = parseDate(today);

  const [view,         setView]         = useState("month");
  const [selectedDate, setSelectedDate] = useState(today);
  const [miniCal,      setMiniCal]      = useState({ year: initD.getFullYear(), month: initD.getMonth() });

  const doctors = users.filter(u => u.role === "doctor");
  const [selDoctors, setSelDoctors] = useState(() => new Set(doctors.map(d => d.id)));

  const patientById = id => patients.find(p => p.id === id);

  const filtered = useMemo(
    () => appointments.filter(a => selDoctors.has(a.doctorId)),
    [appointments, selDoctors]
  );

  const todayAppts = useMemo(
    () => filtered.filter(a => a.date === today).sort((a, b) => slotToMinutes(a.slot) - slotToMinutes(b.slot)),
    [filtered, today]
  );

  const weekDates = useMemo(() => buildWeek(selectedDate), [selectedDate]);

  /* Navigation */
  const navigate = (dir) => {
    const d = parseDate(selectedDate);
    if (view === "month") {
      const nd = new Date(d.getFullYear(), d.getMonth() + dir, 1);
      setSelectedDate(toDateStr(nd));
      setMiniCal({ year: nd.getFullYear(), month: nd.getMonth() });
    } else if (view === "week") {
      setSelectedDate(toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir * 7)));
    } else {
      setSelectedDate(toDateStr(new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir)));
    }
  };

  const dateLabel = () => {
    const d = parseDate(selectedDate);
    if (view === "month") return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    if (view === "week") {
      const [first, last] = [weekDates[0], weekDates[6]].map(parseDate);
      if (first.getMonth() === last.getMonth())
        return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
      return `${MONTH_NAMES[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getDate()}, ${first.getFullYear()}`;
    }
    return parseDate(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const goToDay = (date) => { setSelectedDate(date); setView("day"); };

  const toggleDoctor = (id) =>
    setSelDoctors(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const DOCTOR_COLORS = ["#00baff", "#6366f1", "#f59e0b", "#10b981"];

  return (
    <div className="fade-up-enter -m-4 sm:-m-6 lg:-m-8 flex" style={{ height: "calc(100vh - 4.5rem)" }}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 xl:w-64 border-r border-slate-200 bg-white shrink-0 overflow-y-auto">
        {/* Book button */}
        <div className="p-4 border-b border-slate-100">
          <Button className="w-full gap-2 justify-start">
            <CalendarPlus className="size-4" />
            Book Appointment
          </Button>
        </div>

        {/* Mini calendar */}
        <MiniCalendar
          year={miniCal.year}
          month={miniCal.month}
          selectedDate={selectedDate}
          today={today}
          appointments={filtered}
          onSelect={(date) => {
            setSelectedDate(date);
            const d = parseDate(date);
            setMiniCal({ year: d.getFullYear(), month: d.getMonth() });
            if (view !== "month") setView("day");
          }}
          onPrev={() => setMiniCal(m => prevMo(m.year, m.month))}
          onNext={() => setMiniCal(m => nextMo(m.year, m.month))}
        />

        {/* Doctor filter */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Doctors</p>
          <div className="flex flex-col gap-1.5">
            {doctors.map((doc, i) => {
              const color   = DOCTOR_COLORS[i % DOCTOR_COLORS.length];
              const checked = selDoctors.has(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDoctor(doc.id)}
                  className="flex items-center gap-2.5 text-left hover:bg-slate-50 rounded-lg px-1.5 py-1 -mx-1.5 transition-colors"
                >
                  <span
                    className="size-3.5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={checked ? { backgroundColor: color, borderColor: color } : { borderColor: "#cbd5e1" }}
                  >
                    {checked && (
                      <svg viewBox="0 0 8 8" className="size-2 text-white">
                        <path d="M1 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="text-xs text-slate-700 truncate">{doc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's events */}
        <div className="flex-1 p-4 border-t border-slate-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Today's Events</p>
          {todayAppts.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No appointments today</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todayAppts.map(a => {
                const p = patientById(a.patientId);
                return (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className={cn("size-2 rounded-full mt-1 shrink-0", STATUS_DOT[a.status] || "bg-slate-300")} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{p?.name}</p>
                      <p className="text-[10px] text-slate-400">{a.type === "walkin" ? "Walk-in" : a.slot}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-200 shrink-0">
          <button
            onClick={() => {
              const d = parseDate(today);
              setSelectedDate(today);
              setMiniCal({ year: d.getFullYear(), month: d.getMonth() });
            }}
            className="px-3 h-8 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => navigate(1)}  className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <h2 className="text-[15px] font-semibold text-slate-800 flex-1 select-none">{dateLabel()}</h2>

          {/* View toggle */}
          <div className="inline-flex border border-slate-200 rounded-lg overflow-hidden text-xs font-medium">
            {["month", "week", "day"].map(v => (
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

        {/* Calendar content */}
        <div className="flex-1 overflow-auto">
          {view === "month" && (
            <MonthView
              selectedDate={selectedDate}
              today={today}
              appointments={filtered}
              patients={patients}
              onSelectDate={goToDay}
            />
          )}
          {view === "week" && (
            <WeekView
              weekDates={weekDates}
              today={today}
              appointments={filtered}
              patients={patients}
              onSelectDate={goToDay}
            />
          )}
          {view === "day" && (
            <DayView
              date={selectedDate}
              today={today}
              appointments={filtered}
              patients={patients}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MiniCalendar ──────────────────────────────────────── */
function MiniCalendar({ year, month, selectedDate, today, appointments, onSelect, onPrev, onNext }) {
  const cells    = buildMonthGrid(year, month);
  const apptSet  = useMemo(() => new Set(appointments.map(a => a.date)), [appointments]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-800">
          {MONTH_NAMES[month].slice(0, 3)} {year}
        </span>
        <div className="flex gap-0.5">
          <button onClick={onPrev} className="size-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <ChevronLeft className="size-3.5" />
          </button>
          <button onClick={onNext} className="size-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} className="h-7 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-slate-400">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map(cell => {
          const day        = parseInt(cell.date.slice(8));
          const isToday    = cell.date === today;
          const isSelected = cell.date === selectedDate;
          const hasDot     = apptSet.has(cell.date) && !isToday && !isSelected;
          return (
            <button
              key={cell.date}
              onClick={() => onSelect(cell.date)}
              className="relative flex flex-col items-center justify-center h-7 rounded-full hover:bg-slate-100 transition-colors"
            >
              <span className={cn(
                "text-[11px] font-medium w-6 h-6 flex items-center justify-center rounded-full",
                isToday    ? "bg-[#00baff] text-white font-semibold" :
                isSelected ? "bg-slate-800 text-white" :
                cell.isCurrentMonth ? "text-slate-700" : "text-slate-300"
              )}>
                {day}
              </span>
              {hasDot && <span className="absolute bottom-0.5 size-0.5 rounded-full bg-[#00baff]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── MonthView ─────────────────────────────────────────── */
function MonthView({ selectedDate, today, appointments, patients, onSelectDate }) {
  const d     = parseDate(selectedDate);
  const cells = buildMonthGrid(d.getFullYear(), d.getMonth());
  const pid   = id => patients.find(p => p.id === id);

  return (
    <div>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 bg-white z-10">
        {WEEK_LABELS.map(lbl => (
          <div key={lbl} className="py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {lbl}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7" style={{ gridAutoRows: "minmax(110px, auto)" }}>
        {cells.map(cell => {
          const dayAppts = appointments
            .filter(a => a.date === cell.date)
            .sort((a, b) => slotToMinutes(a.slot) - slotToMinutes(b.slot));
          const visible  = dayAppts.slice(0, 3);
          const overflow = dayAppts.length - visible.length;
          const day      = parseInt(cell.date.slice(8));
          const isToday  = cell.date === today;

          return (
            <div
              key={cell.date}
              onClick={() => onSelectDate(cell.date)}
              className={cn(
                "border-b border-r border-slate-100 p-1.5 cursor-pointer hover:bg-slate-50/80 transition-colors min-h-[110px]",
                !cell.isCurrentMonth && "bg-slate-50/50"
              )}
            >
              <div className="mb-1.5">
                <span className={cn(
                  "text-sm font-medium w-7 h-7 inline-flex items-center justify-center rounded-full leading-none",
                  isToday ? "bg-[#00baff] text-white font-semibold" :
                  cell.isCurrentMonth ? "text-slate-800" : "text-slate-300"
                )}>
                  {day}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {visible.map(a => {
                  const p  = pid(a.patientId);
                  const st = STATUS_EVENT[a.status] || STATUS_EVENT.scheduled;
                  return (
                    <div
                      key={a.id}
                      onClick={e => { e.stopPropagation(); onSelectDate(cell.date); }}
                      className={cn(
                        "rounded px-1 py-[2px] border-l-2 truncate leading-tight",
                        st.bg, st.border, st.text,
                        a.status === "completed" && "opacity-60"
                      )}
                    >
                      <span className="text-[10px] font-medium">
                        {a.type === "walkin" ? "Walk-in" : a.slot} {p?.name}
                      </span>
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); onSelectDate(cell.date); }}
                    className="text-[10px] font-medium text-slate-500 hover:text-[#00baff] text-left pl-0.5 transition-colors"
                  >
                    + {overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── WeekView ──────────────────────────────────────────── */
function WeekView({ weekDates, today, appointments, patients, onSelectDate }) {
  const pid = id => patients.find(p => p.id === id);

  return (
    <div className="flex flex-col min-h-full">
      {/* Day column headers */}
      <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="w-14 shrink-0 border-r border-slate-200" />
        {weekDates.map(dateStr => {
          const [y, m, d] = dateStr.split("-").map(Number);
          const dayObj    = new Date(y, m - 1, d);
          const dow       = dayObj.getDay();
          const lbl       = WEEK_LABELS[dow === 0 ? 6 : dow - 1];
          const isToday   = dateStr === today;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "flex-1 h-14 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors border-r border-slate-200 last:border-0",
                isToday && "bg-sky-50/40"
              )}
            >
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isToday ? "text-[#00baff]" : "text-slate-500")}>
                {lbl}
              </span>
              <span className={cn(
                "text-xl font-semibold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full leading-none",
                isToday ? "bg-[#00baff] text-white" : "text-slate-800 hover:bg-slate-100 transition-colors"
              )}>
                {d}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex" style={{ height: TOTAL_H }}>
        {/* Time gutter */}
        <div className="w-14 shrink-0 border-r border-slate-200 relative">
          {HOURS.map((h, i) => (
            <div key={h} className="absolute w-full flex justify-end pr-2" style={{ top: i * HOUR_HEIGHT - 7 }}>
              <span className="text-[10px] text-slate-400 font-medium">{hourLabel(h)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map(dateStr => {
          const isToday  = dateStr === today;
          const dayAppts = appointments.filter(a => a.date === dateStr && a.type !== "walkin");
          const walkIns  = appointments.filter(a => a.date === dateStr && a.type === "walkin");

          return (
            <div key={dateStr} className={cn("flex-1 border-r border-slate-200 last:border-0 relative", isToday && "bg-sky-50/20")}>
              {/* Hour grid lines */}
              {HOURS.map((_, i) => (
                <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: i * HOUR_HEIGHT }} />
              ))}
              {/* Half-hour lines */}
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
                    className={cn("absolute left-0.5 right-0.5 rounded overflow-hidden border-l-[3px] px-1.5 py-0.5 cursor-pointer hover:opacity-75 transition-opacity shadow-sm", st.bg, st.border, a.status === "completed" && "opacity-50")}
                    style={{ top, height: EVENT_H }}
                  >
                    <p className={cn("text-[10px] font-semibold truncate leading-tight", st.text)}>
                      {a.slot} {p?.name}
                    </p>
                    {a.reason && <p className={cn("text-[9px] truncate opacity-70", st.text)}>{a.reason}</p>}
                  </div>
                );
              })}

              {/* Walk-ins at 9 AM */}
              {walkIns.map((a, idx) => {
                const p   = pid(a.patientId);
                const top = Math.max(0, (9 - START_HOUR) * HOUR_HEIGHT + idx * (EVENT_H + 4));
                return (
                  <div
                    key={a.id}
                    className="absolute left-0.5 right-0.5 rounded overflow-hidden border-l-[3px] border-l-purple-400 bg-purple-50 px-1.5 py-0.5 cursor-pointer hover:opacity-75 transition-opacity shadow-sm"
                    style={{ top, height: EVENT_H }}
                  >
                    <p className="text-[10px] font-semibold text-purple-800 truncate leading-tight">Walk-in · {p?.name}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DayView ───────────────────────────────────────────── */
function DayView({ date, today, appointments, patients }) {
  const pid    = id => patients.find(p => p.id === id);
  const [y, m, d] = date.split("-").map(Number);
  const dayObj    = new Date(y, m - 1, d);
  const dow       = dayObj.getDay();
  const lbl       = WEEK_LABELS[dow === 0 ? 6 : dow - 1];
  const isToday   = date === today;

  const dayAppts = appointments.filter(a => a.date === date && a.type !== "walkin").sort((a, b) => slotToMinutes(a.slot) - slotToMinutes(b.slot));
  const walkIns  = appointments.filter(a => a.date === date && a.type === "walkin");

  return (
    <div className="flex flex-col min-h-full">
      {/* Day header */}
      <div className={cn("flex border-b border-slate-200 sticky top-0 bg-white z-10", isToday && "bg-sky-50/40")}>
        <div className="w-14 shrink-0 border-r border-slate-200" />
        <div className="flex-1 h-16 flex flex-col items-center justify-center">
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isToday ? "text-[#00baff]" : "text-slate-500")}>
            {lbl}
          </span>
          <span className={cn(
            "text-2xl font-semibold mt-0.5 w-11 h-11 flex items-center justify-center rounded-full leading-none",
            isToday ? "bg-[#00baff] text-white" : "text-slate-800"
          )}>
            {d}
          </span>
        </div>
      </div>

      {/* Time grid */}
      <div className="flex" style={{ height: TOTAL_H }}>
        {/* Time gutter */}
        <div className="w-14 shrink-0 border-r border-slate-200 relative">
          {HOURS.map((h, i) => (
            <div key={h} className="absolute w-full flex justify-end pr-2" style={{ top: i * HOUR_HEIGHT - 7 }}>
              <span className="text-[10px] text-slate-400 font-medium">{hourLabel(h)}</span>
            </div>
          ))}
        </div>

        <div className={cn("flex-1 relative", isToday && "bg-sky-50/10")}>
          {/* Hour lines */}
          {HOURS.map((_, i) => (
            <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: i * HOUR_HEIGHT }} />
          ))}
          {/* Half-hour lines */}
          {HOURS.map((_, i) => (
            <div key={`h${i}`} className="absolute w-full border-t border-dashed border-slate-50" style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
          ))}

          {/* Timed appointments */}
          {dayAppts.map(a => {
            const p   = pid(a.patientId);
            const st  = STATUS_EVENT[a.status] || STATUS_EVENT.scheduled;
            const top = Math.max(0, Math.min(slotToTopPx(a.slot), TOTAL_H - HOUR_HEIGHT / 2));
            return (
              <div
                key={a.id}
                className={cn("absolute left-2 right-3 rounded-lg overflow-hidden border-l-[3px] px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity shadow-sm", st.bg, st.border, a.status === "completed" && "opacity-50")}
                style={{ top, height: HOUR_HEIGHT / 2 }}
              >
                <p className={cn("text-sm font-semibold leading-tight truncate", st.text)}>{a.slot} · {p?.name}</p>
                {a.reason && <p className={cn("text-xs leading-tight truncate opacity-70 mt-0.5", st.text)}>{a.reason}</p>}
              </div>
            );
          })}

          {/* Walk-ins at 9 AM */}
          {walkIns.map((a, idx) => {
            const p   = pid(a.patientId);
            const top = (9 - START_HOUR) * HOUR_HEIGHT + idx * (HOUR_HEIGHT / 2 + 4);
            return (
              <div
                key={a.id}
                className="absolute left-2 right-3 rounded-lg overflow-hidden border-l-[3px] border-l-purple-400 bg-purple-50 px-3 py-1.5 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                style={{ top, height: HOUR_HEIGHT / 2 }}
              >
                <p className="text-sm font-semibold text-purple-800 leading-tight truncate">Walk-in · {p?.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
