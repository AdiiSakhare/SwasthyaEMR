import { cn } from "@/lib/utils";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

const palette = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-800",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

function colorFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return palette[Math.abs(hash) % palette.length];
}

export function Avatar({ name = "?", className, size = "md" }) {
  const sizes = { sm: "size-7 text-xs", md: "size-9 text-sm", lg: "size-11 text-base", xl: "size-14 text-lg" };
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold shrink-0 select-none",
        colorFor(name),
        sizes[size],
        className
      )}
      aria-label={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
