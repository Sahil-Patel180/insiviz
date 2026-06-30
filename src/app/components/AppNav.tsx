import type { Profile } from "../lib/auth";

const MINT = "#7affc8";
const MR   = "122,255,200";
const share = "'Share Tech Mono', monospace";
const syn   = "'Syncopate', sans-serif";
const orb   = "'Orbitron', sans-serif";
const mono  = "'JetBrains Mono', monospace";

export const APP_NAV_ITEMS = [
  { label: "DailyDeck",   enabled: true },
  { label: "DataDeck",    enabled: false },
  { label: "Dashboard",   enabled: true },
  { label: "Vizstore",    enabled: false },
  { label: "Connections", enabled: false },
  { label: "DocBuild",    enabled: false },
];

function getInitials(profile: Profile | null) {
  const source = profile?.full_name?.trim() || profile?.email || "";
  if (!source) return "—";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function AppNav({
  active,
  profile,
  onLogout,
  onNavigate,
}: {
  active: string;
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  return (
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
        style={{ background: "#141418", borderRadius: "14px", padding: "6px 10px", border: `1px solid rgba(${MR},0.05)` }}
      >
        {APP_NAV_ITEMS.map((item) => {
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              disabled={!item.enabled}
              onClick={() => item.enabled && onNavigate(item.label)}
              style={{
                fontFamily: syn,
                fontWeight: 700,
                fontSize: "0.58rem",
                letterSpacing: "0.12em",
                padding: "7px 12px",
                borderRadius: "10px",
                border: "none",
                cursor: item.enabled ? "pointer" : "default",
                background: isActive ? "linear-gradient(135deg, #1a1a20 0%, #141418 100%)" : "transparent",
                color: isActive ? MINT : item.enabled ? "#9a9aa2" : "#45454d",
                position: "relative",
              }}
            >
              {item.label}
              {!item.enabled && (
                <span style={{ position: "absolute", top: -6, right: -4, fontFamily: share, fontSize: "0.42rem", color: "#45454d" }}>
                  soon
                </span>
              )}
            </button>
          );
        })}
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
          style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.14em", color: `rgba(${MR},0.45)`, background: "transparent", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = MINT)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `rgba(${MR},0.45)`)}
        >
          log_out
        </button>
      </div>
    </nav>
  );
}