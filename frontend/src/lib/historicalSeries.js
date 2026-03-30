/**
 * Normalize backend historical payloads into Lightweight Charts line series data.
 *
 * Supported shapes:
 * - Array of `{ time: string|number, value?: number, close?: number }` (chart-ready / OHLC-style)
 * - Array of `{ date: string, value|close|nav|price|adjClose|adjustedClose: number }`
 * - Array of `{ t|timestamp|ts: number (sec or ms), v|value|close|nav|price: number }`
 * - Array of `{ month: number, value: number }` (legacy mock — synthetic calendar months)
 * - Wrapped: `{ points|data|series|values: [...] }` or top-level array
 *
 * Output: `{ time: string | number, value: number }[]` sorted ascending by time.
 * String `time` is trimmed to `YYYY-MM-DD` when possible for daily data.
 */

/** @param {unknown} raw */
function unwrapSeriesPayload(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = /** @type {Record<string, unknown>} */ (raw);
    for (const key of ["points", "data", "series", "values", "items", "rows"]) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

/** @param {unknown} row */
function pickNumeric(row, keys) {
  if (!row || typeof row !== "object") return NaN;
  const o = /** @type {Record<string, unknown>} */ (row);
  for (const k of keys) {
    if (k in o && o[k] != null) {
      const n = Number(o[k]);
      if (Number.isFinite(n)) return n;
    }
  }
  return NaN;
}

/** @param {unknown} row */
function pickTimeKey(row) {
  if (!row || typeof row !== "object") return null;
  const o = /** @type {Record<string, unknown>} */ (row);
  for (const k of ["time", "date", "asOf", "as_of", "traded_on", "tradedOn", "period", "dt"]) {
    if (k in o && o[k] != null) return o[k];
  }
  return null;
}

/** @param {unknown} row */
function pickUnix(row) {
  if (!row || typeof row !== "object") return NaN;
  const o = /** @type {Record<string, unknown>} */ (row);
  for (const k of ["t", "ts", "timestamp", "unix", "time_unix"]) {
    if (k in o && o[k] != null) {
      let n = Number(o[k]);
      if (!Number.isFinite(n)) continue;
      if (n > 1e12) n = Math.floor(n / 1000);
      return n;
    }
  }
  return NaN;
}

/** @param {string} s */
function toBusinessDayString(s) {
  const str = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const t = Date.parse(str);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return str;
}

/**
 * Legacy mock: `{ month: number, value: number }` → synthetic monthly dates.
 * @param {Array<{ month?: number, value?: number }>} rows
 */
export function legacyMonthSeriesToLineData(rows) {
  if (!rows?.length) return [];
  const sorted = [...rows].sort((a, b) => (a.month ?? 0) - (b.month ?? 0));
  const end = new Date();
  const anchor = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  const out = [];
  for (let idx = 0; idx < sorted.length; idx++) {
    const p = sorted[idx];
    const v = Number(p.value);
    if (!Number.isFinite(v)) continue;
    const d = new Date(anchor);
    d.setUTCMonth(d.getUTCMonth() - (sorted.length - 1 - idx));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    out.push({ time: `${y}-${m}-${day}`, value: v });
  }
  return out;
}

/**
 * @param {unknown} raw — array or wrapped `{ points, data, ... }` from API
 * @returns {{ time: string | number, value: number }[]}
 */
export function normalizeHistoricalLineData(raw) {
  const rows = unwrapSeriesPayload(raw);
  if (!rows.length) return [];

  const first = rows[0];
  if (!first || typeof first !== "object") return [];

  const VALUE_KEYS = ["value", "close", "nav", "price", "adjClose", "adjusted_close", "adjustedClose", "open"];

  // 1) Explicit time + value (string or number time)
  const t0 = pickTimeKey(first);
  const hasExplicitTime = t0 != null && (typeof t0 === "string" || typeof t0 === "number");
  if (hasExplicitTime) {
    const out = [];
    for (const row of rows) {
      const tk = pickTimeKey(row);
      const val = pickNumeric(row, VALUE_KEYS);
      if (!Number.isFinite(val)) continue;
      if (typeof tk === "number" && Number.isFinite(tk)) {
        let sec = tk;
        if (sec > 1e12) sec = Math.floor(sec / 1000);
        out.push({ time: sec, value: val });
      } else if (tk != null) {
        out.push({ time: toBusinessDayString(String(tk)), value: val });
      }
    }
    return sortAndDedupeLinePoints(out);
  }

  // 2) Unix-only rows (no date string)
  const u0 = pickUnix(first);
  if (Number.isFinite(u0)) {
    const out = [];
    for (const row of rows) {
      const sec = pickUnix(row);
      const val = pickNumeric(row, [...VALUE_KEYS, "v"]);
      if (!Number.isFinite(sec) || !Number.isFinite(val)) continue;
      out.push({ time: sec, value: val });
    }
    return sortAndDedupeLinePoints(out);
  }

  // 3) Legacy month index (mock / embedded forecast series)
  const f0 = /** @type {Record<string, unknown>} */ (first);
  if ("month" in f0 && Number.isFinite(pickNumeric(f0, VALUE_KEYS))) {
    return legacyMonthSeriesToLineData(
      rows.map((r) => /** @type {{ month?: number, value?: number }} */ (r)),
    );
  }

  return [];
}

/**
 * @param {{ time: string | number, value: number }[]} points
 */
function sortAndDedupeLinePoints(points) {
  const sorted = [...points].sort((a, b) => {
    if (typeof a.time === "number" && typeof b.time === "number") return a.time - b.time;
    return String(a.time).localeCompare(String(b.time));
  });
  const byTime = new Map();
  for (const p of sorted) {
    const key = typeof p.time === "number" ? p.time : String(p.time);
    byTime.set(key, p);
  }
  return Array.from(byTime.values()).sort((a, b) => {
    if (typeof a.time === "number" && typeof b.time === "number") return a.time - b.time;
    return String(a.time).localeCompare(String(b.time));
  });
}
