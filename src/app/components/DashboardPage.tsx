import { useState } from "react";
import { TrendingUp, PieChart, BarChart3, Activity, Layers, Table2 } from "lucide-react";
import type { Profile } from "../lib/auth";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const syn   = "'Syncopate', sans-serif";
const exo   = "'Exo 2', sans-serif";
const orb   = "'Orbitron', sans-serif";
const mono  = "'JetBrains Mono', monospace";

const NAV_ITEMS = [
  { label: "Dashboard", enabled: true },
  { label: "Datasets",  enabled: false },
  { label: "Insights",  enabled: false },
  { label: "Reports",   enabled: false },
];

const TILES = [
  { bg: "#378ADD", fg: "#042C53", sub: "#0C447C", icon: TrendingUp, title: "Revenue trend",     chart: "Line chart" },
  { bg: "#F0997B", fg: "#4A1B0C", sub: "#712B13", icon: PieChart,   title: "Customer segments", chart: "Pie chart" },
  { bg: "#EF9F27", fg: "#412402", sub: "#633806", icon: BarChart3,  title: "Top products",      chart: "Bar chart" },
  { bg: "#5DCAA5", fg: "#04342C", sub: "#085041", icon: Activity,   title: "Price vs demand",   chart: "Scatter plot" },
  { bg: "#AFA9EC", fg: "#26215C", sub: "#3C3489", icon: Layers,     title: "Churn breakdown",   chart: "Donut chart" },
  { bg: "#ED93B1", fg: "#4B1528", sub: "#72243E", icon: Table2,     title: "Anomalies",         chart: "Table" },
];

const KPIS = [
  { label: "Datasets connected" },
  { label: "Active dashboards" },
  { label: "AI suggestions" },
  { label: "Insights this month" },
];

function getInitials(profile: Profile | null) {
  const source = profile?.full_name?.trim() || profile?.email || "";
  if (!source) return "—";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function DashboardPage({
  profile,
  onLogout,
}: {
  profile: Profile | null;
  onLogout: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const displayName = profile?.full_name?.trim() || profile?.email || "there";

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      {/* ── app nav ── */}
      <nav
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(13,13,15,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(${MR},0.07)`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: MINT, display: "inline-block", boxShadow: `0 0 10px rgba(${MR},0.6)` }} />
          <span style={{ fontFamily: orb, fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em", color: MINT, textShadow: `0 0 14px rgba(${MR},0.35)` }}>
            INSI<span style={{ color: "#606070", fontWeight: 400 }}>VIZ</span>
          </span>
        </div>

        <div
          className="hidden md:flex items-center gap-1"
          style={{
            background: "#141418",
            borderRadius: "14px",
            padding: "6px 10px",
            border: `1px solid rgba(${MR},0.05)`,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              disabled={!item.enabled}
              onMouseEnter={() => item.enabled && setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                fontFamily: syn,
                fontWeight: 700,
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                padding: "7px 14px",
                borderRadius: "10px",
                border: "none",
                cursor: item.enabled ? "pointer" : "default",
                background: item.enabled ? "linear-gradient(135deg, #1a1a20 0%, #141418 100%)" : "transparent",
                color: item.enabled ? MINT : "#45454d",
                position: "relative",
              }}
            >
              {item.label}
              {!item.enabled && (
                <span style={{ position: "absolute", top: -6, right: -6, fontFamily: share, fontSize: "0.45rem", color: "#45454d", letterSpacing: "0.05em" }}>
                  soon
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#141418", color: MINT,
              fontFamily: mono, fontSize: "0.65rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid rgba(${MR},0.15)`,
            }}
          >
            {getInitials(profile)}
          </span>
          <button
            onClick={onLogout}
            style={{
              fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.14em",
              color: `rgba(${MR},0.45)`, background: "transparent", border: "none", cursor: "pointer",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = MINT)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `rgba(${MR},0.45)`)}
          >
            log_out
          </button>
        </div>
      </nav>

      {/* ── main ── */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 64px" }}>
        <p style={{ fontFamily: exo, fontWeight: 300, fontStyle: "italic", fontSize: "0.95rem", color: "#8a8a92", marginBottom: "24px" }}>
          Welcome back, {displayName}.{profile?.organization ? ` · ${profile.organization}` : ""}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "10px",
            marginBottom: "32px",
          }}
        >
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: "#141418",
                borderRadius: "12px",
                padding: "14px 16px",
                boxShadow: `5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25`,
                border: `1px solid rgba(${MR},0.05)`,
              }}
            >
              <p style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.08em", color: "#6e6e76", margin: "0 0 8px" }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: mono, fontSize: "1.4rem", fontWeight: 500, color: MINT, margin: 0 }}>
                —
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.1em", color: "#6e6e76", marginBottom: "12px" }}>
          // AI-SUGGESTED VISUALIZATIONS
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.title} style={{ background: tile.bg, borderRadius: "14px", padding: "14px" }}>
                <Icon size={20} color={tile.fg} strokeWidth={2} />
                <p style={{ color: tile.fg, fontFamily: mono, fontSize: "0.82rem", fontWeight: 500, margin: "10px 0 2px" }}>
                  {tile.title}
                </p>
                <p style={{ color: tile.sub, fontFamily: share, fontSize: "0.62rem", margin: 0 }}>
                  {tile.chart} · awaiting data
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => console.log("TODO: open dataset connect flow")}
          style={{
            fontFamily: syn, fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em",
            padding: "14px 28px", borderRadius: "12px",
            border: `1px solid rgba(${MR},0.22)`, cursor: "pointer",
            background: `linear-gradient(135deg, rgba(${MR},0.15) 0%, rgba(${MR},0.08) 100%)`,
            color: MINT,
          }}
        >
          CONNECT_DATASET
        </button>
      </main>
    </div>
  );
}