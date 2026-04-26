import { cn } from "@/lib/utils";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Returns an array of YYYY-MM-DD strings centred around today */
function buildDays(count = 14) {
  const today = new Date();
  const days = [];
  const start = new Date(today);
  start.setDate(today.getDate() - 3); // show 3 days before today
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function toStr(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * DayStrip — horizontally scrollable day selector
 * Props: value (YYYY-MM-DD), onChange(YYYY-MM-DD), appointmentDates (Set of YYYY-MM-DD with events)
 */
export function DayStrip({ value, onChange, appointmentDates = new Set() }) {
  const today = new Date().toISOString().slice(0, 10);
  const days = buildDays(14);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1.5 px-4 py-3 min-w-max">
        {days.map((d) => {
          const str = toStr(d);
          const isToday = str === today;
          const isSelected = str === value;
          const hasDot = appointmentDates.has(str);

          return (
            <button
              key={str}
              onClick={() => onChange(str)}
              className={cn(
                "flex flex-col items-center gap-1 w-12 py-2.5 rounded-xl transition-all duration-150",
                "text-xs font-medium",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isToday
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                {DAY_SHORT[d.getDay()]}
              </span>
              <span className="text-sm font-semibold tabular-nums">{d.getDate()}</span>
              <span className="text-[10px] opacity-60">{MONTH_SHORT[d.getMonth()]}</span>
              <span
                className={cn(
                  "size-1 rounded-full transition-opacity",
                  hasDot ? "opacity-100" : "opacity-0",
                  isSelected ? "bg-primary-foreground" : "bg-primary"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
