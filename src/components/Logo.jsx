export function Logo({ size = 32 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-xl flex items-center justify-center text-white font-bold"
        style={{
          width: size,
          height: size,
          background: "#00baff",
          boxShadow: "0 4px 12px -2px rgba(0, 186, 255, 0.35)",
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-semibold text-foreground tracking-tight text-[15px]">Swasthya</span>
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium">EMR</span>
      </div>
    </div>
  );
}
