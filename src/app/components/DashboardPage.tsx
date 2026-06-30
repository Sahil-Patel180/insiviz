import { TrendingUp, PieChart, BarChart3, Activity, Layers, Table2 } from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const exo   = "'Exo 2', sans-serif";
const mono  = "'JetBrains Mono', monospace";
const syn   = "'Syncopate', sans-serif";

const KPIS = [
  { label: "Datasets connected" },
  { label: "Active dashboards" },
  { label: "AI suggestions" },
  { label: "Insights this month" },
];

const TILES = [
  { bg: "#378ADD", fg: "#042C53", sub: "#0C447C", icon: TrendingUp, title: "Revenue trend",      chart: "Line chart" },
  { bg: "#F0997B", fg: "#4A1B0C", sub: "#712B13", icon: PieChart,   title: "Customer segments", chart: "Pie chart" },
  { bg: "#EF9F27", fg: "#412402", sub: "#633806", icon: BarChart3,  title: "Top products",      chart: "Bar chart" },
  { bg: "#5DCAA5", fg: "#04342C", sub: "#085041", icon: Activity,   title: "Price vs demand",   chart: "Scatter plot" },
  { bg: "#AFA9EC", fg: "#26215C", sub: "#3C3489", icon: Layers,     title: "Churn breakdown",   chart: "Donut chart" },
  { bg: "#ED93B1", fg: "#4B1528", sub: "#72243E", icon: Table2,     title: "Anomalies",         chart: "Table" },
];

export function DashboardPage({
  profile,
  onLogout,
  onNavigate,
}: {
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const displayName = profile?.full_name?.trim() || profile?.email || "there";

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      <AppNav active="Dashboard" profile={profile} onLogout={onLogout} onNavigate={onNavigate} />

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 64px" }}>
        <p style={{ fontFamily: exo, fontWeight: 300, fontStyle: "italic", fontSize: "0.95rem", color: "#8a8a92", marginBottom: "24px" }}>
          Welcome back, {displayName}.{profile?.organization ? ` · ${profile.organization}` : ""}
        </p>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "10px", marginBottom: "32px" }}>
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: "#141418", borderRadius: "12px", padding: "14px 16px",
                boxShadow: "5px 5px 12px #0a0a0c,-3px -3px 8px #1e1e25",
                border: `1px solid rgba(${MR},0.05)`,
              }}
            >
              <p style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.08em", color: "#6e6e76", margin: "0 0 8px" }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: mono, fontSize: "1.4rem", fontWeight: 500, color: MINT, margin: 0 }}>—</p>
            </div>
          ))}
        </div>

        {/* tiles */}
        <p style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.1em", color: "#6e6e76", marginBottom: "12px" }}>
          // AI-SUGGESTED VISUALIZATIONS
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px", marginBottom: "28px" }}>
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

        {/* cta */}
        <button
          onClick={() => console.log("TODO: dataset connect flow")}
          style={{
            fontFamily: syn, fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em",
            padding: "14px 28px", borderRadius: "12px",
            border: `1px solid rgba(${MR},0.22)`, cursor: "pointer",
            background: `linear-gradient(135deg,rgba(${MR},0.15) 0%,rgba(${MR},0.08) 100%)`,
            color: MINT,
          }}
        >
          CONNECT_DATASET
        </button>
      </main>
    </div>
  );
}