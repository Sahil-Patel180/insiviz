import { useState } from "react";
import { Plus, Lock } from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT = "#7affc8";
const MR   = "122,255,200";
const share = "'Share Tech Mono', monospace";
const syn   = "'Syncopate', sans-serif";
const mono  = "'JetBrains Mono', monospace";

// TODO: replace with a real check once a `datasets` table exists.
const HAS_DATASET = false;

const MAX_DECKS = 5;
const DECK_COLORS = ["#7affc8", "#378ADD", "#EF9F27", "#ED93B1", "#AFA9EC"];

type Deck = { id: string; name: string; color: string };

export function DailyDeckPage({
  profile,
  onLogout,
  onNavigate,
}: {
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const canAddDeck = HAS_DATASET && decks.length < MAX_DECKS;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      <AppNav active="DailyDeck" profile={profile} onLogout={onLogout} onNavigate={onNavigate} />

      <main style={{ position: "relative", maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 64px", minHeight: "calc(100vh - 64px)" }}>
        {!HAS_DATASET ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", minHeight: "360px", textAlign: "center" }}>
            <Lock size={22} color="#45454d" />
            <p style={{ fontFamily: share, fontSize: "0.7rem", letterSpacing: "0.08em", color: "#6e6e76", maxWidth: "320px" }}>
              Connect a dataset before building your first Deck.
            </p>
            <button
              onClick={() => onNavigate("Dashboard")}
              style={{
                fontFamily: syn, fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.18em",
                padding: "12px 24px", borderRadius: "10px",
                border: `1px solid rgba(${MR},0.22)`, cursor: "pointer",
                background: `linear-gradient(135deg, rgba(${MR},0.15) 0%, rgba(${MR},0.08) 100%)`,
                color: MINT,
              }}
            >
              GO_TO_DASHBOARD
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                position: "relative", minHeight: "420px", borderRadius: "14px",
                background: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(122,255,200,0.03) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(122,255,200,0.03) 24px)",
                border: `1px solid rgba(${MR},0.05)`,
                marginRight: "70px",
              }}
            >
              {decks.length === 0 && (
                <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: share, fontSize: "0.65rem", color: "#45454d" }}>
                  Create a Deck to start placing visuals.
                </p>
              )}
              {/* TODO: free-placement + auto-resize widget engine renders here, scoped to activeDeckId */}
            </div>

            <div style={{ position: "absolute", top: "32px", right: "24px", bottom: "64px", display: "flex", flexDirection: "column", gap: "10px", width: "60px" }}>
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setActiveDeckId(deck.id)}
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    height: "100px",
                    width: activeDeckId === deck.id ? "60px" : "48px",
                    borderRadius: "10px 0 0 10px",
                    border: "none",
                    cursor: "pointer",
                    background: deck.color,
                    color: "#0d0d0f",
                    fontFamily: mono,
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    boxShadow: activeDeckId === deck.id ? `0 0 16px rgba(${MR},0.25)` : "none",
                    transition: "width 0.18s ease",
                  }}
                >
                  {deck.name}
                </button>
              ))}

              <button
                disabled={!canAddDeck}
                onClick={() => {
                  if (!canAddDeck) return;
                  const id = crypto.randomUUID();
                  setDecks((prev) => [...prev, { id, name: `DECK_${prev.length + 1}`, color: DECK_COLORS[prev.length % DECK_COLORS.length] }]);
                  setActiveDeckId(id);
                }}
                style={{
                  height: "48px", width: "48px", borderRadius: "10px 0 0 10px",
                  border: `1px dashed rgba(${MR},0.2)`, background: "transparent",
                  color: canAddDeck ? MINT : "#34343a", cursor: canAddDeck ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}