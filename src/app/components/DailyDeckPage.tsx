import { useState } from "react";
import { Plus, Lock, TrendingUp, PieChart, BarChart3, Activity, Layers, Table2 } from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const mono  = "'JetBrains Mono', monospace";
const syn   = "'Syncopate', sans-serif";
const exo   = "'Exo 2', sans-serif";

// ── flip to true once datasets table + connect flow exist ──
const HAS_DATASET = false;

const MAX_DECKS   = 5;
const DECK_COLORS = ["#7affc8", "#378ADD", "#EF9F27", "#ED93B1", "#AFA9EC"];

type Deck = { id: string; name: string; color: string };

const KPIS = [
  { label: "Datasets connected" },
  { label: "Widgets on deck" },
  { label: "Last updated" },
  { label: "Decks active" },
];

const TILES = [
  { bg: "#378ADD", fg: "#042C53", sub: "#0C447C", icon: TrendingUp, title: "Revenue trend",      chart: "Line chart" },
  { bg: "#F0997B", fg: "#4A1B0C", sub: "#712B13", icon: PieChart,   title: "Customer segments", chart: "Pie chart" },
  { bg: "#EF9F27", fg: "#412402", sub: "#633806", icon: BarChart3,  title: "Top products",      chart: "Bar chart" },
  { bg: "#5DCAA5", fg: "#04342C", sub: "#085041", icon: Activity,   title: "Price vs demand",   chart: "Scatter plot" },
  { bg: "#AFA9EC", fg: "#26215C", sub: "#3C3489", icon: Layers,     title: "Churn breakdown",   chart: "Donut chart" },
  { bg: "#ED93B1", fg: "#4B1528", sub: "#72243E", icon: Table2,     title: "Anomalies",         chart: "Table" },
];

export function DailyDeckPage({
  profile,
  onLogout,
  onNavigate,
}: {
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const [decks, setDecks]               = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const canAddDeck = HAS_DATASET && decks.length < MAX_DECKS;
  const displayName = profile?.full_name?.trim() || profile?.email || "there";

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      <AppNav active="DailyDeck" profile={profile} onLogout={onLogout} onNavigate={onNavigate} />

      <main
        style={{
          position: "relative",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "32px 24px 64px",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {/* welcome */}
        <p style={{ fontFamily: exo, fontWeight: 300, fontStyle: "italic", fontSize: "0.95rem", color: "#8a8a92", marginBottom: "20px" }}>
          Welcome back, {displayName}.{profile?.organization ? ` · ${profile.organization}` : ""}
        </p>

        {/* ── no-dataset inline notice ── */}
        {!HAS_DATASET && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "#141418", borderRadius: "10px",
              padding: "12px 16px",
              border: `1px dashed rgba(${MR},0.12)`,
              marginBottom: "20px",
              maxWidth: "500px",
            }}
          >
            <Lock size={14} color="#45454d" />
            <p style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.07em", color: "#6e6e76", margin: 0 }}>
              No dataset connected yet — Deck creation and live visuals locked.{" "}
              <span
                onClick={() => onNavigate("Dashboard")}
                style={{ color: MINT, cursor: "pointer", textDecoration: "underline" }}
              >
                Connect one →
              </span>
            </p>
          </div>
        )}

        {/* ── KPI row (leaves room for tab rail on right) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: "10px",
            marginBottom: "20px",
            marginRight: "72px",
          }}
        >
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: "#141418", borderRadius: "12px", padding: "14px 16px",
                boxShadow: "5px 5px 12px #0a0a0c,-3px -3px 8px #1e1e25",
                border: `1px solid rgba(${MR},0.05)`,
              }}
            >
              <p style={{ fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.08em", color: "#6e6e76", margin: "0 0 8px" }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: mono, fontSize: "1.4rem", fontWeight: 500, color: MINT, margin: 0 }}>—</p>
            </div>
          ))}
        </div>

        {/* ── free-placement dotted canvas ── */}
        <div
          style={{
            position: "relative",
            minHeight: "480px",
            borderRadius: "14px",
            marginRight: "72px",
            backgroundImage: "radial-gradient(rgba(122,255,200,0.07) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
            border: `1px solid rgba(${MR},0.05)`,
          }}
        >
          {/* ADD_VISUAL — only active when a deck is selected AND dataset exists */}
          <button
            disabled={!activeDeckId || !HAS_DATASET}
            style={{
              position: "absolute", top: "12px", left: "12px",
              fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.1em",
              padding: "8px 14px", borderRadius: "8px",
              border: `1px dashed rgba(${MR},${activeDeckId && HAS_DATASET ? "0.35" : "0.12"})`,
              background: "transparent",
              color: activeDeckId && HAS_DATASET ? MINT : "#45454d",
              cursor: activeDeckId && HAS_DATASET ? "pointer" : "default",
              zIndex: 2,
            }}
          >
            + ADD_VISUAL
          </button>

          {/* empty colorful tile grid — shows what will live here */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
              gap: "12px",
              padding: "50px 16px 16px",
            }}
          >
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.title}
                  style={{
                    background: tile.bg,
                    borderRadius: "14px",
                    padding: "14px",
                    opacity: HAS_DATASET ? 1 : 0.72,
                  }}
                >
                  <Icon size={20} color={tile.fg} strokeWidth={2} />
                  <p style={{ color: tile.fg, fontFamily: mono, fontSize: "0.82rem", fontWeight: 500, margin: "10px 0 2px" }}>
                    {tile.title}
                  </p>
                  <p style={{ color: tile.sub, fontFamily: share, fontSize: "0.6rem", margin: 0 }}>
                    {tile.chart} · awaiting data
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── vertical deck tab rail — RIGHT EDGE ── */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            right: "24px",
            bottom: "64px",
            width: "60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "10px",
            paddingTop: "118px",  /* aligns with canvas top */
          }}
        >
          {decks.map((deck) => {
            const isActive = activeDeckId === deck.id;
            return (
              <button
                key={deck.id}
                onClick={() => setActiveDeckId(deck.id)}
                title={deck.name}
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  height: "100px",
                  width: isActive ? "60px" : "46px",
                  borderRadius: "10px 0 0 10px",
                  border: "none",
                  cursor: "pointer",
                  background: deck.color,
                  color: "#0d0d0f",
                  fontFamily: mono,
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  boxShadow: isActive ? `0 0 18px ${deck.color}55` : "none",
                  transition: "width 0.18s ease, box-shadow 0.18s ease",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                }}
              >
                {deck.name}
              </button>
            );
          })}

          {/* + new deck button */}
          <button
            disabled={!canAddDeck}
            onClick={() => {
              if (!canAddDeck) return;
              const id = crypto.randomUUID();
              setDecks((prev) => [
                ...prev,
                { id, name: `DECK_${prev.length + 1}`, color: DECK_COLORS[prev.length % DECK_COLORS.length] },
              ]);
              setActiveDeckId(id);
            }}
            title={
              !HAS_DATASET
                ? "Connect a dataset first"
                : decks.length >= MAX_DECKS
                ? "Max 5 decks reached"
                : "New deck"
            }
            style={{
              height: "48px",
              width: "46px",
              borderRadius: "10px 0 0 10px",
              border: `1px dashed rgba(${MR},${canAddDeck ? "0.3" : "0.12"})`,
              background: "transparent",
              color: canAddDeck ? MINT : "#34343a",
              cursor: canAddDeck ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            <Plus size={16} />
          </button>

          {/* max decks label */}
          {decks.length > 0 && (
            <p style={{ fontFamily: share, fontSize: "0.5rem", color: "#45454d", letterSpacing: "0.06em", margin: 0, textAlign: "center" }}>
              {decks.length}/{MAX_DECKS}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}