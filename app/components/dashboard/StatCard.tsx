export default function StatCard({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: number;
}) {
  const trendColor =
    trend == null ? "" : trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-bone/40";
  return (
    <div className="frame p-5">
      <span className="frame-tr" />
      <span className="frame-bl" />
      <div className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-bone/45 mb-3">
        {label}
      </div>
      <div className="font-display font-light text-3xl md:text-4xl tracking-[-0.025em] serif-nums text-bone">
        {value}
      </div>
      {(sublabel || trend != null) && (
        <div className="mt-2 flex items-center justify-between gap-2">
          {sublabel && (
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-bone/40">
              {sublabel}
            </span>
          )}
          {trend != null && (
            <span className={`font-mono text-[0.6rem] tracking-[0.18em] ${trendColor}`}>
              {trend > 0 ? "▲" : trend < 0 ? "▼" : "·"} {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
