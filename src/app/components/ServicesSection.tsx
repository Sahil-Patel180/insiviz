const SERVICES = [
  {
    icon: "▓▒░",
    title: "Schema Scan",
    desc: "Reads your data's structure, types, and relationships before suggesting anything.",
    tag: "SCAN",
  },
  {
    icon: "◆◇◆",
    title: "Combination Engine",
    desc: "Generates every statistically valid chart-axis pairing for your dataset.",
    tag: "MATCH",
  },
  {
    icon: "█▓▒░",
    title: "Logic Filter",
    desc: "Strips out combos that look fine but mislead. Only legit pairings survive.",
    tag: "VALIDATE",
  },
  {
    icon: "░▒▓█",
    title: "Dashboard Export",
    desc: "Push validated combos straight into your dashboard layer.",
    tag: "BUILD",
  },
];

export function ServicesSection() {
  return (
    <section
      className="relative w-full py-28 px-6"
      style={{ background: "#0d0d0f" }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "60%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(122,255,200,0.2), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto">
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
            // CAPABILITIES
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'Teko', sans-serif",
            fontWeight: 600,
            fontSize: "clamp(3rem, 6vw, 5.5rem)",
            letterSpacing: "0.08em",
            color: "#c8c8d0",
            lineHeight: 0.95,
            marginBottom: "3.5rem",
            textTransform: "uppercase",
          }}
        >
          What{" "}
          <span style={{ color: "#7affc8", textShadow: "0 0 30px rgba(122,255,200,0.25)" }}>
            InsiViz
          </span>{" "}
          can do
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s) => (
            <div
              key={s.tag}
              style={{
                background: "#141418",
                borderRadius: "16px",
                padding: "28px 24px",
                boxShadow:
                  "8px 8px 18px #0a0a0c, -4px -4px 12px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.06)",
                border: "1px solid rgba(122,255,200,0.06)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "10px 10px 24px #0a0a0c, -5px -5px 14px #1e1e25, 0 0 28px rgba(122,255,200,0.05), inset 0 1px 0 rgba(122,255,200,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "8px 8px 18px #0a0a0c, -4px -4px 12px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.06)";
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "1.4rem",
                  color: "#7affc8",
                  marginBottom: "16px",
                  letterSpacing: "0.05em",
                }}
              >
                {s.icon}
              </div>

              <div
                style={{
                  fontFamily: "'Teko', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.5rem",
                  color: "#c8c8d0",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  marginBottom: "12px",
                }}
              >
                {s.title}
              </div>

              <div
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.82rem",
                  color: "#606070",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                }}
              >
                {s.desc}
              </div>

              <div
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.25em",
                  color: "rgba(122,255,200,0.35)",
                  borderTop: "1px solid rgba(122,255,200,0.07)",
                  paddingTop: "14px",
                }}
              >
                /{s.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
