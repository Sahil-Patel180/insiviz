const STATS = [
  { value: "—", label: "combos generated / dataset" },
  { value: "—", label: "validation accuracy" },
  { value: "—", label: "chart types supported" },
  { value: "—", label: "datasets analyzed" },
];

export function AboutSection() {
  return (
    <section
      className="relative w-full py-28 px-6"
      style={{
        background: "#0f0f12",
        borderTop: "1px solid rgba(122,255,200,0.05)",
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* left text block */}
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div style={{ width: "32px", height: "1px", background: "rgba(122,255,200,0.4)" }} />
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.3em",
                color: "rgba(122,255,200,0.5)",
              }}
            >
              // ABOUT
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Audiowide', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(1.8rem, 3.8vw, 3rem)",
              letterSpacing: "0.03em",
              color: "#c8c8d0",
              lineHeight: 1.2,
              marginBottom: "1.8rem",
            }}
          >
            Built at the edge of{" "}
            <span
              style={{
                color: "#7affc8",
                textShadow: "0 0 24px rgba(122,255,200,0.3)",
              }}
            >
              data &amp; logic
            </span>
          </h2>

          <p
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "0.92rem",
              color: "#606070",
              lineHeight: 1.85,
              marginBottom: "1.4rem",
              maxWidth: "480px",
            }}
          >
            InsiViz started with one question: how many dashboards get built on the
            wrong chart before anyone notices? We trained a model on visualization
            logic itself — not templates, not guesses — so every combo it returns is
            one you can actually trust.
          </p>

          <div className="mt-10">
            <button
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                padding: "12px 28px",
                borderRadius: "12px",
                border: "1px solid rgba(122,255,200,0.2)",
                cursor: "pointer",
                background: "#141418",
                color: "#7affc8",
                boxShadow: "5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25",
                transition: "all 0.22s ease",
                textShadow: "0 0 10px rgba(122,255,200,0.2)",
                textTransform: "uppercase",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(122,255,200,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#141418";
              }}
            >
              Read Our Story →
            </button>
          </div>
        </div>

        {/* right stats grid */}
        <div className="grid grid-cols-2 gap-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#141418",
                borderRadius: "16px",
                padding: "28px 24px",
                boxShadow:
                  "8px 8px 18px #0a0a0c, -4px -4px 12px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.06)",
                border: "1px solid rgba(122,255,200,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                  color: "#7affc8",
                  letterSpacing: "0.04em",
                  textShadow: "0 0 20px rgba(122,255,200,0.3)",
                  lineHeight: 1,
                  marginBottom: "10px",
                }}
              >
                {s.value}
              </div>

              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.12em",
                  color: "#606070",
                  textTransform: "uppercase",
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "40%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(122,255,200,0.12), transparent)",
        }}
      />
    </section>
  );
}
