import { useEffect, useMemo, useRef } from "react";
import { createChart, LineSeries, ColorType } from "lightweight-charts";
import { normalizeHistoricalLineData } from "../../lib/historicalSeries.js";

const CHART_HEIGHT = 240;

/**
 * Historical fund performance using TradingView Lightweight Charts™
 * (see https://tradingview.github.io/lightweight-charts/tutorials/customization/intro ).
 *
 * `data` accepts multiple backend shapes — see `normalizeHistoricalLineData` in `lib/historicalSeries.js`.
 *
 * @param {{ data?: unknown, title?: string, subtitle?: string, loading?: boolean, unavailable?: boolean, valueFormat?: 'index' | 'currency' }} props
 */
export default function HistoricalChart({
  data = [],
  title = "Historical Fund Performance",
  subtitle,
  loading = false,
  unavailable = false,
  valueFormat = "currency",
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const rawRows = Array.isArray(data) ? data : [];
  const lineData = useMemo(() => normalizeHistoricalLineData(data), [data]);
  const parseFailed = !loading && !unavailable && rawRows.length > 0 && lineData.length === 0;

  useEffect(() => {
    if (unavailable || loading || parseFailed || !lineData.length) return;
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#ADADB0",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#2A2A2E" },
        horzLines: { color: "#2A2A2E" },
      },
      width: el.clientWidth,
      height: CHART_HEIGHT,
      rightPriceScale: {
        borderColor: "#2A2A2E",
        scaleMargins: { top: 0.1, bottom: 0.15 },
      },
      timeScale: {
        borderColor: "#2A2A2E",
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#6BAADC", labelBackgroundColor: "#1A1A1D" },
        horzLine: { color: "#6BAADC", labelBackgroundColor: "#1A1A1D" },
      },
    });

    const fmtIndex = (price) =>
      Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtCurrency = (price) =>
      "$" +
      Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const series = chart.addSeries(LineSeries, {
      color: "#6BAADC",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: valueFormat === "index" ? fmtIndex : fmtCurrency,
      },
    });
    series.setData(lineData);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [lineData, loading, unavailable, parseFailed, valueFormat]);

  if (unavailable) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-dashed border-[var(--border-default)] min-h-[250px]">
        <span className="font-inter text-sm font-medium text-[var(--text-muted)]">Historical data unavailable for this fund</span>
        <span className="font-inter text-xs text-[var(--text-disabled)]">Try selecting a different mutual fund</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] min-h-[250px]">
        <span className="font-inter text-sm text-[var(--text-muted)] animate-pulse">Loading historical data…</span>
      </div>
    );
  }

  if (!rawRows.length) {
    return (
      <div className="flex flex-col gap-5 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <div className="flex items-center justify-center min-h-[240px] rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)]">
          <span className="font-inter text-sm text-[var(--text-muted)]">No historical data to display</span>
        </div>
      </div>
    );
  }

  if (parseFailed) {
    return (
      <div className="flex flex-col gap-5 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] min-w-0">
        <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <div className="flex flex-col items-center justify-center gap-2 min-h-[240px] rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)] px-4">
          <span className="font-inter text-sm text-[var(--text-muted)] text-center">
            Historical data was returned but the format isn’t recognized.
          </span>
          <span className="font-inter text-[11px] text-[var(--text-disabled)] text-center max-w-md">
            Expected an array of points with time + value (or date + close / nav), unix timestamps, or legacy month/value rows. See <code className="font-dm-mono text-[10px]">src/lib/historicalSeries.js</code>.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] min-w-0">
      <div className="flex flex-col gap-1.5">
        <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        {subtitle && (
          <span className="font-inter text-[11px] text-[var(--text-muted)] leading-relaxed max-w-[52rem]">{subtitle}</span>
        )}
      </div>
      <div
        ref={containerRef}
        className="w-full min-h-[240px] rounded-lg overflow-hidden"
        style={{ height: CHART_HEIGHT }}
        aria-label={title}
      />
    </div>
  );
}
