/**
 * Allocation donut chart — SVG arcs by principal share (reliable vs conic-gradient + flex).
 *
 * @param {{ holdings: Array<{ ticker: string, principal: number, color: string }>, totalLabel: string }} props
 */

const VIEW = 100;
const CX = VIEW / 2;
const CY = VIEW / 2;
const R_OUTER = 40;
const R_INNER = 24;

/** One donut slice from angle a0 to a1 (radians), clockwise, starting from -π/2 (top). */
function donutSlicePath(a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0o = CX + R_OUTER * Math.cos(a0);
  const y0o = CY + R_OUTER * Math.sin(a0);
  const x1o = CX + R_OUTER * Math.cos(a1);
  const y1o = CY + R_OUTER * Math.sin(a1);
  const x1i = CX + R_INNER * Math.cos(a1);
  const y1i = CY + R_INNER * Math.sin(a1);
  const x0i = CX + R_INNER * Math.cos(a0);
  const y0i = CY + R_INNER * Math.sin(a0);
  return `M ${x0o} ${y0o} A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${R_INNER} ${R_INNER} 0 ${large} 0 ${x0i} ${y0i} Z`;
}

export default function AllocationDonutChart({ holdings = [], totalLabel = "$0" }) {
  const total = holdings.reduce((s, h) => s + h.principal, 0) || 1;

  let angle = -Math.PI / 2;
  const slices = holdings.map((h, i) => {
    const frac = h.principal / total;
    const sweep = frac * 2 * Math.PI;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    return {
      key: h.id ?? `${h.ticker}-${i}`,
      path: donutSlicePath(a0, a1),
      color: h.color,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Fixed size + shrink-0 so flex parents never collapse the chart to 0 height */}
      <div className="relative w-[200px] h-[200px] shrink-0 mx-auto">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="w-full h-full"
          role="img"
          aria-label="Portfolio allocation by principal"
        >
          <title>Allocation by fund principal</title>
          {slices.length === 0 ? (
            <circle
              cx={CX}
              cy={CY}
              r={(R_OUTER + R_INNER) / 2}
              fill="none"
              stroke="var(--border-default)"
              strokeWidth={R_OUTER - R_INNER}
            />
          ) : (
            slices.map((s) => (
              <path key={s.key} d={s.path} fill={s.color} stroke="var(--bg-card)" strokeWidth={0.5} />
            ))
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2">
          <span className="font-inter text-lg font-bold text-[var(--text-primary)] text-center leading-tight">
            {totalLabel}
          </span>
          <span className="font-inter text-[11px] text-[var(--text-muted)]">Total Value</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 w-full">
        {holdings.map((h, i) => (
          <div key={h.id ?? `${h.ticker}-${i}`} className="flex items-center gap-2.5 w-full min-w-0">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
            <span className="font-inter text-xs text-[var(--text-secondary)] flex-1 min-w-0 truncate">{h.ticker}</span>
            <span className="font-inter text-xs font-semibold text-[var(--text-primary)] shrink-0">
              {Math.round((h.principal / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
