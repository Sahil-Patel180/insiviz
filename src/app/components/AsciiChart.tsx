import { useEffect, useRef, useState } from "react";

const ASCII_SHADES = ["░", "▒", "▓", "█"];

function getShade(fill: number): string {
  if (fill < 0.25) return ASCII_SHADES[0];
  if (fill < 0.5)  return ASCII_SHADES[1];
  if (fill < 0.75) return ASCII_SHADES[2];
  return ASCII_SHADES[3];
}

function generateBarHeights(t: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const base   = Math.sin(i * 0.8 + t * 0.9) * 0.3 + 0.5;
    const detail = Math.cos(i * 1.4 - t * 1.3) * 0.15;
    const pulse  = Math.sin(t * 2  + i * 0.5) * 0.08;
    return Math.max(0.05, Math.min(1, base + detail + pulse));
  });
}

function generateLinePoints(t: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const v = Math.sin(i * 0.6 + t * 1.1) * 0.25
            + Math.cos(i * 1.1 - t * 0.7) * 0.2
            + 0.5;
    return Math.max(0, Math.min(1, v));
  });
}

function renderAsciiChart(
  bars: number[],
  line: number[],
  chartRows: number,
): string[] {
  const barCount = bars.length;
  const rows: string[] = [];

  for (let row = 0; row < chartRows; row++) {
    const rowFraction = 1 - row / (chartRows - 1);
    let rowStr = "";

    for (let b = 0; b < barCount; b++) {
      const barH   = bars[b];
      const lineH  = line[b];
      const barFilled  = barH >= rowFraction;
      const barFill    = barFilled ? barH - rowFraction : 0;
      const isLineDot  = Math.abs(lineH - rowFraction) < 1 / chartRows;

      if (isLineDot) {
        rowStr += " ◆ ";
      } else if (barFilled) {
        rowStr += ` ${getShade(barFill * chartRows)} `;
      } else {
        rowStr += "   ";
      }

      if (b < barCount - 1) rowStr += "│";
    }
    rows.push(rowStr);
  }

  // x-axis + labels
  rows.push("─".repeat(barCount * 4));
  rows.push(
    Array.from({ length: barCount }, (_, i) =>
      (i + 1).toString().padStart(2, " ").padEnd(4, " ")
    ).join("")
  );

  return rows;
}

export function AsciiChart({ bare = false }: { bare?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines]       = useState<string[]>([]);
  const [dims, setDims]         = useState({ cols: 16, rows: 18 });
  const timeRef  = useRef(0);
  const animRef  = useRef<number>(0);
  const dimsRef  = useRef(dims);
  dimsRef.current = dims;

  // measure container → compute how many bars/rows fit
  useEffect(() => {
    if (!bare) return;
    const el = containerRef.current;
    if (!el) return;

    const CHAR_W = 8;   // px per monospace char at base font size
    const CHAR_H = 14;  // px per line

    const measure = () => {
      const w = el.offsetWidth  || window.innerWidth;
      const h = el.offsetHeight || window.innerHeight;
      // each bar occupies 4 chars wide (3 + separator)
      const cols = Math.max(4,  Math.floor(w / (CHAR_W * 4)));
      const rows = Math.max(4,  Math.floor(h / CHAR_H) - 3); // leave room for axis
      setDims({ cols, rows });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [bare]);

  useEffect(() => {
    const tick = (ts: number) => {
      timeRef.current = ts / 1000;
      const t  = timeRef.current;
      const { cols, rows } = dimsRef.current;
      const bars = generateBarHeights(t, cols);
      const line = generateLinePoints(t, cols);
      setLines(renderAsciiChart(bars, line, rows));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  if (bare) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "transparent",
        }}
      >
        <pre
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.78rem",
            lineHeight: 1.45,
            color: "rgba(122,255,200,0.55)",
            letterSpacing: "0.02em",
            margin: 0,
            padding: 0,
            userSelect: "none",
            whiteSpace: "pre",
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          {lines.join("\n")}
        </pre>
      </div>
    );
  }

  // ── standalone card mode ─────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(13,13,15,0.35)",
        backdropFilter: "blur(18px) saturate(1.4)",
        WebkitBackdropFilter: "blur(18px) saturate(1.4)",
        border: "1px solid rgba(122,255,200,0.18)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(122,255,200,0.08)",
        padding: "2rem 2.5rem",
        minWidth: "min(90vw, 760px)",
      }}
    >
      {/* header row */}
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(122,255,200,0.6)", letterSpacing: "0.15em" }}>
          INSIVIZ / LIVE_STREAM_01
        </div>
        <div className="flex gap-4 items-center" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem" }}>
          <span style={{ color: "rgba(122,255,200,0.8)" }}>◆ SERIES_A</span>
          <span style={{ color: "rgba(100,180,255,0.7)" }}>█ BAR</span>
          <span className="flex items-center gap-1" style={{ color: "rgba(255,200,60,0.6)" }}>
            <span className="animate-pulse">●</span> LIVE
          </span>
        </div>
      </div>

      <pre
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "clamp(0.45rem, 1.1vw, 0.7rem)",
          lineHeight: 1.35,
          color: "rgba(122,255,200,0.75)",
          letterSpacing: "0.02em",
          margin: 0,
          userSelect: "none",
          whiteSpace: "pre",
          overflowX: "hidden",
        }}
      >
        {lines.join("\n")}
      </pre>

      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.55rem",
        color: "rgba(122,255,200,0.3)",
        letterSpacing: "0.2em",
        whiteSpace: "nowrap",
        transform: "translateY(-50%) rotate(-90deg)",
        transformOrigin: "left center",
        position: "absolute",
        left: "6px",
        top: "50%",
      }}>
        AMPLITUDE
      </div>
    </div>
  );
}
