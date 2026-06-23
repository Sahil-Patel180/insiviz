export function Footer() {
  return (
    <footer
      className="w-full py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{
        borderTop: "1px solid rgba(122,255,200,0.05)",
        background: "#0d0d0f",
      }}
    >
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: "0.9rem",
          letterSpacing: "0.08em",
          color: "#7affc8",
          textShadow: "0 0 12px rgba(122,255,200,0.25)",
        }}
      >
        INSI<span style={{ color: "#3a3a45", fontWeight: 400 }}>VIZ</span>
      </span>

      <span
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          color: "#3a3a45",
        }}
      >
        © 2026 INSIVIZ INC. ALL RIGHTS RESERVED.
      </span>

      <div className="flex gap-6">
        {["PRIVACY", "TERMS", "STATUS"].map((link) => (
          <span
            key={link}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              color: "#3a3a45",
              cursor: "pointer",
              transition: "color 0.18s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLSpanElement).style.color = "#606070")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLSpanElement).style.color = "#3a3a45")
            }
          >
            {link}
          </span>
        ))}
      </div>
    </footer>
  );
}
