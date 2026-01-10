import React, { useMemo } from "react";
import "./HistoricGraph.css";

/*
  HistoricGraph
  - Expects historyData: array of { received_at: ISOString, temperature: number, humidity: number }
  - Plots two separate lightweight SVG line charts (temperature, humidity).
  - Shows up to the last 24 hours (server: every 10 minutes -> ~144 points).
*/

function makePoints(values, width, height, padding = 16) {
  const n = values.length;
  if (n === 0) return "";
  const xs = (i) =>
    n === 1 ? width / 2 : padding + (i * (width - 2 * padding)) / (n - 1);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.0001, max - min); // Avoid div by zero
  const ys = (v) => padding + (1 - (v - min) / range) * (height - 2 * padding);
  return values.map((v, i) => `${xs(i)},${ys(v)}`).join(" ");
}

function sliceLast24Hours(rows) {
  if (!Array.isArray(rows)) return [];
  // Cutoff: 24 hours back from now
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const filtered = rows
    .map((r) => ({ ...r, ts: new Date(r.received_at).getTime() }))
    .filter((r) => !isNaN(r.ts) && r.ts >= cutoff)
    .sort((a, b) => a.ts - b.ts);
  // Limit to ~144 points (10min interval -> 6 per hour -> 144 per day)
  return filtered.slice(-144);
}

export default function HistoricGraph({ historyData = [] }) {
  const rows = useMemo(() => sliceLast24Hours(historyData), [historyData]);

  // Prepare arrays for temp & humidity
  const temps = rows.map((r) => Number(r.temperature));
  const hums = rows.map((r) => Number(r.humidity));
  const timestamps = rows.map((r) => r.ts);

  // SVG sizes (responsive via CSS)
  const svgWidth = 600;
  const svgHeight = 160;

  const tempPoints = makePoints(temps, svgWidth, svgHeight);
  const humPoints = makePoints(hums, svgWidth, svgHeight);

  const firstLabel =
    timestamps.length > 0 ? new Date(timestamps[0]).toLocaleTimeString() : "";
  const lastLabel =
    timestamps.length > 0
      ? new Date(timestamps[timestamps.length - 1]).toLocaleTimeString()
      : "";

  return (
    <div className="historic-graph">
      <div className="graph-header">
        <h3 className="h6">24h Trends</h3>
        <small className="text-muted">Showing last 24 hours</small>
      </div>

      <div className="chart temperature-chart" aria-hidden={temps.length === 0}>
        <div className="chart-title">Temperature (°C)</div>
        {temps.length > 0 ? (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={tempPoints}
              fill="none"
              stroke="#e74c3c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="chart-empty">No temperature history available</div>
        )}
        <div className="axis-labels">
          <span>{firstLabel}</span>
          <span>{lastLabel}</span>
        </div>
      </div>

      <div className="chart humidity-chart" aria-hidden={hums.length === 0}>
        <div className="chart-title">Humidity (%)</div>
        {hums.length > 0 ? (
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={humPoints}
              fill="none"
              stroke="#3498db"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="chart-empty">No humidity history available</div>
        )}
        <div className="axis-labels">
          <span>{firstLabel}</span>
          <span>{lastLabel}</span>
        </div>
      </div>
    </div>
  );
}
