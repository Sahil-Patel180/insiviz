import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { AsciiBackground } from "./AsciiBackground";
import { CTABand } from "./CTABand";
import { Footer } from "./Footer";

const A  = "#7affc8";
const AR = "122,255,200";

// ─── shared font helpers ─────────────────────────────────────────────────────
const mono  = "'JetBrains Mono', monospace";
const share = "'Share Tech Mono', monospace";
const russo = "'Russo One', sans-serif";
const teko  = "'Teko', sans-serif";
const exo   = "'Exo 2', sans-serif";

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function ServicesHero({ onHome }: { onHome: () => void }) {
  const headline = "Pick your signal.";

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "62vh", paddingTop: "72px", background: "#0d0d0f" }}
    >
      {/* ASCII bg at reduced opacity */}
      <div className="absolute inset-0" style={{ opacity: 0.25 }}>
        <AsciiBackground />
      </div>

      {/* vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 25%, rgba(13,13,15,0.75) 75%, #0d0d0f 100%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* breadcrumb */}
        <div
          style={{
            fontFamily: share,
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            color: `rgba(${AR},0.35)`,
          }}
        >
          <span
            style={{ cursor: "pointer", transition: "color 0.18s" }}
            onClick={onHome}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = A)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.35)`)
            }
          >
            home_
          </span>
          {"  /  "}
          <span style={{ color: `rgba(${AR},0.65)` }}>services_</span>
        </div>

        {/* badge — pulse glow loop */}
        <motion.div
          style={{
            fontFamily: share,
            fontSize: "0.68rem",
            letterSpacing: "0.32em",
            color: `rgba(${AR},0.7)`,
            background: `rgba(${AR},0.05)`,
            border: `1px solid rgba(${AR},0.2)`,
            padding: "6px 20px",
            borderRadius: "999px",
          }}
          animate={{
            boxShadow: [
              `0 0 6px rgba(${AR},0.08), inset 0 0 6px rgba(${AR},0.04)`,
              `0 0 22px rgba(${AR},0.28), inset 0 0 14px rgba(${AR},0.1)`,
              `0 0 6px rgba(${AR},0.08), inset 0 0 6px rgba(${AR},0.04)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          // SERVICES
        </motion.div>

        {/* headline — letters stagger L→R */}
        <h1
          style={{
            fontFamily: russo,
            fontWeight: 400,
            fontSize: "clamp(2.6rem, 7vw, 5.4rem)",
            letterSpacing: "0.02em",
            color: "#c8c8d0",
            lineHeight: 1.05,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {headline.split("").map((ch, i) => (
            <motion.span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: ch === " " ? "pre" : "normal",
              }}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.04, duration: 0.28, ease: "easeOut" }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        {/* sub */}
        <motion.p
          style={{
            fontFamily: exo,
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(0.88rem, 2vw, 1.06rem)",
            color: "#606070",
            maxWidth: "500px",
            lineHeight: 1.78,
            margin: 0,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          From raw schema to validated dashboard — every service plugs into one
          pipeline.
        </motion.p>
      </motion.div>
    </section>
  );
}

// ─── 2. SERVICE PILLARS ───────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: "▓▒░ ◆",
    title: "Visualization Engine",
    desc: "Feed in data, get every legit chart-axis combo ranked by validity.",
    tag: "CORE",
  },
  {
    icon: "░▒▓ ◆",
    title: "AI Automation",
    desc: "Custom-trained models automate repetitive analytics decisions across your stack.",
    tag: "AUTO",
  },
  {
    icon: "◆ ▓▒░",
    title: "Dashboard Integration",
    desc: "Push validated combos directly into your BI tool or custom dashboard layer.",
    tag: "CONNECT",
  },
  {
    icon: "◆ ░▒▓",
    title: "Model Training",
    desc: "Fine-tune InsiViz's engine on your domain's data logic.",
    tag: "CUSTOM",
  },
];

function PillarCard({
  pillar,
  index,
}: {
  pillar: (typeof PILLARS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.42, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#141418",
        borderRadius: "16px",
        padding: "28px 24px",
        boxShadow: hovered
          ? `10px 10px 24px #0a0a0c, -5px -5px 14px #1e1e25, 0 0 28px rgba(${AR},0.06), inset 0 1px 0 rgba(${AR},0.1)`
          : `8px 8px 18px #0a0a0c, -4px -4px 12px #1e1e25, inset 0 1px 0 rgba(${AR},0.06)`,
        border: `1px solid rgba(${AR},0.06)`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        cursor: "default",
      }}
    >
      {/* ASCII block build-up on hover */}
      <div
        style={{
          position: "relative",
          marginBottom: "18px",
          height: "1.6rem",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: "1.1rem",
            color: `rgba(${AR},0.18)`,
            letterSpacing: "0.08em",
            display: "block",
            whiteSpace: "nowrap",
          }}
        >
          ░░░░░░░░░░
        </span>
        <motion.span
          style={{
            fontFamily: mono,
            fontSize: "1.1rem",
            color: A,
            letterSpacing: "0.08em",
            display: "block",
            whiteSpace: "nowrap",
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
          }}
          animate={{ width: hovered ? "100%" : "0%" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          ██████████
        </motion.span>
      </div>

      <div
        style={{
          fontFamily: teko,
          fontWeight: 500,
          fontSize: "1.45rem",
          color: "#c8c8d0",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          lineHeight: 1,
          marginBottom: "12px",
        }}
      >
        {pillar.title}
      </div>

      <div
        style={{
          fontFamily: exo,
          fontWeight: 300,
          fontSize: "0.82rem",
          color: "#606070",
          lineHeight: 1.7,
          marginBottom: "20px",
        }}
      >
        {pillar.desc}
      </div>

      <div
        style={{
          fontFamily: share,
          fontSize: "0.62rem",
          letterSpacing: "0.2em",
          color: A,
          background: `rgba(${AR},0.08)`,
          border: `1px solid rgba(${AR},0.18)`,
          borderRadius: "6px",
          padding: "5px 10px",
          display: "inline-block",
          marginTop: "4px",
        }}
      >
        /{pillar.tag}
      </div>
    </motion.div>
  );
}

function ServicePillars() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{ background: "#0d0d0f" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <div style={{ width: "32px", height: "1px", background: `rgba(${AR},0.4)` }} />
          <span
            style={{
              fontFamily: share,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.5)`,
            }}
          >
            // SERVICE PILLARS
          </span>
        </div>
        <h2
          style={{
            fontFamily: teko,
            fontWeight: 600,
            fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
            letterSpacing: "0.08em",
            color: "#c8c8d0",
            lineHeight: 0.95,
            marginBottom: "2rem",
            textTransform: "uppercase",
          }}
        >
          Four services.{" "}
          <span style={{ color: A, textShadow: `0 0 28px rgba(${AR},0.25)` }}>
            One pipeline.
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p, i) => (
            <PillarCard key={p.tag} pillar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 3. DEEP DIVE SECTIONS ────────────────────────────────────────────────────
const DEEP_DIVES = [
  {
    headline: "Stop guessing the chart type.",
    body: "Most teams pick a viz, then notice it's misleading. InsiViz flips that — validates logic before you build.",
    bullets: ["Schema-aware axis matching", "Statistically validated pairings", "Dashboard-ready output"],
    tag: "VISUALIZATION ENGINE",
    terminalLines: [
      "> insiviz analyze --input=\"sales_q4.csv\"",
      "↳ Parsing schema: 12 cols · 3 numeric · 2 datetime",
      "↳ Building combination matrix...",
      "╔══ VALID COMBOS (35) ════════════════════╗",
      "║ revenue × quarter   [bar]   ✓ valid     ║",
      "║ margin × region     [heat]  ✓ valid     ║",
      "║ units × date        [line]  ✓ valid     ║",
      "║ ... +32 more                            ║",
      "╚═════════════════════════════════════════╝",
      "> Done. 35 valid · 12 filtered",
    ],
  },
  {
    headline: "Automate what shouldn't need a human.",
    body: "Repetitive analytics decisions burn analyst time. InsiViz handles the predictable ones so your team focuses on interpretation, not configuration.",
    bullets: ["Decision graph automation", "Configurable confidence thresholds", "Human-review flagging"],
    tag: "AI AUTOMATION",
    terminalLines: [
      "> insiviz auto --mode=standard",
      "↳ Loading decision graph v2.4...",
      "↳ Scanning 14 pending decisions",
      "↳ Confidence: █████████░  threshold: 0.91",
      "↳ Auto-resolving: 12 decisions",
      "↳ Flagging for review: 2 decisions",
      "> Status: 12 automated · 2 queued for review",
    ],
  },
  {
    headline: "Validate first. Push second.",
    body: "No more exporting CSVs and manually rebuilding charts. InsiViz connects directly to your dashboard layer and pushes validated combos in one command.",
    bullets: ["Direct BI tool connectors", "Combo mapping & deduplication", "Live sync on dataset update"],
    tag: "DASHBOARD INTEGRATION",
    terminalLines: [
      "> insiviz push --target=grafana",
      "↳ Authenticating with dashboard layer...",
      "↳ Mapping 35 validated combos...",
      "↳ Deduplicating against existing panels...",
      "↳ Injecting 28 new charts  (7 already exist)",
      "↳ [██████████] 100%",
      "> Push complete. 28 new · 7 skipped · 0 errors",
    ],
  },
  {
    headline: "Teach it your domain's logic.",
    body: "Generic models don't understand your industry's data relationships. Fine-tune InsiViz on your own labeled examples for domain-specific validation.",
    bullets: ["Custom training on your data", "Domain-specific validation rules", "Versioned model management"],
    tag: "MODEL TRAINING",
    terminalLines: [
      "> insiviz train --data=./domain_samples/",
      "↳ Loading 2,400 labeled examples...",
      "↳ Initializing fine-tune pipeline...",
      "↳ Epoch [1/8]  ██░░░░░░  loss: 0.241",
      "↳ Epoch [4/8]  █████░░░  loss: 0.089",
      "↳ Epoch [8/8]  ████████  loss: 0.031",
      "> Model saved → /models/custom_v1.bin",
    ],
  },
];

function TerminalWindow({
  lines,
  trigger,
}: {
  lines: string[];
  trigger: boolean;
}) {
  const fullText = lines.join("\n");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!trigger) return;
    let i = 0;
    setTyped("");
    const iv = setInterval(() => {
      i++;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [trigger, fullText]);

  return (
    <div
      style={{
        background: "#0a0a0c",
        borderRadius: "12px",
        border: `1px solid rgba(${AR},0.14)`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(${AR},0.06)`,
        overflow: "hidden",
      }}
    >
      {/* title bar */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid rgba(${AR},0.08)`,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#0f0f12",
        }}
      >
        {[A, "#ff8833", "#33cc66"].map((c, i) => (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: c,
              opacity: 0.7,
            }}
          />
        ))}
        <span
          style={{
            fontFamily: share,
            fontSize: "0.58rem",
            letterSpacing: "0.2em",
            color: `rgba(${AR},0.4)`,
            marginLeft: "8px",
          }}
        >
          INSIVIZ TERMINAL
        </span>
      </div>

      {/* code body */}
      <pre
        style={{
          fontFamily: mono,
          fontSize: "clamp(0.6rem, 1.1vw, 0.72rem)",
          lineHeight: 1.65,
          color: `rgba(${AR},0.7)`,
          padding: "20px 22px",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          minHeight: "220px",
        }}
      >
        {typed}
        {typed.length < fullText.length && trigger && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ color: A }}
          >
            ▌
          </motion.span>
        )}
      </pre>
    </div>
  );
}

function DeepDiveSection({
  dive,
  index,
}: {
  dive: (typeof DEEP_DIVES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const reversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className="w-full py-14 px-6"
      style={{
        background: index % 2 === 0 ? "#0d0d0f" : "#0f0f12",
        borderTop: `1px solid rgba(${AR},0.04)`,
      }}
    >
      <div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        style={{ direction: reversed ? "rtl" : "ltr" }}
      >
        {/* text block */}
        <motion.div
          style={{ direction: "ltr" }}
          initial={{ opacity: 0, x: reversed ? 36 : -36 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div
            style={{
              fontFamily: share,
              fontSize: "0.62rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.45)`,
              marginBottom: "16px",
            }}
          >
            // {dive.tag}
          </div>

          <h3
            style={{
              fontFamily: russo,
              fontWeight: 400,
              fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
              letterSpacing: "0.02em",
              color: "#c8c8d0",
              lineHeight: 1.1,
              textTransform: "uppercase",
              marginBottom: "1.2rem",
            }}
          >
            {dive.headline}
          </h3>

          <p
            style={{
              fontFamily: exo,
              fontWeight: 300,
              fontSize: "0.9rem",
              color: "#606070",
              lineHeight: 1.82,
              marginBottom: "1.6rem",
              maxWidth: "440px",
            }}
          >
            {dive.body}
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {dive.bullets.map((b) => (
              <li
                key={b}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ color: A, fontFamily: mono, fontSize: "0.7rem" }}>◆</span>
                <span
                  style={{
                    fontFamily: exo,
                    fontWeight: 400,
                    fontSize: "0.84rem",
                    color: "#8080a0",
                    letterSpacing: "0.02em",
                  }}
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* terminal */}
        <motion.div
          style={{ direction: "ltr" }}
          initial={{ opacity: 0, x: reversed ? -36 : 36 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
        >
          <TerminalWindow lines={dive.terminalLines} trigger={isInView} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── 4. HOW IT WORKS ─────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", label: "INGEST", desc: "Connect your dataset or schema file" },
  { num: "02", label: "ANALYZE", desc: "Engine maps all valid axis combos" },
  { num: "03", label: "VALIDATE", desc: "Logic filter strips misleading pairings" },
  { num: "04", label: "EXPORT", desc: "Push to dashboard or download as JSON" },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="w-full py-16 px-6"
      style={{
        background: "#0d0d0f",
        borderTop: `1px solid rgba(${AR},0.04)`,
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <div style={{ width: "32px", height: "1px", background: `rgba(${AR},0.4)` }} />
          <span
            style={{
              fontFamily: share,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.5)`,
            }}
          >
            // HOW IT WORKS
          </span>
        </div>
        <h2
          style={{
            fontFamily: teko,
            fontWeight: 600,
            fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
            letterSpacing: "0.08em",
            color: "#c8c8d0",
            lineHeight: 0.95,
            marginBottom: "2.5rem",
            textTransform: "uppercase",
          }}
        >
          Four steps.{" "}
          <span style={{ color: A }}>Zero guesswork.</span>
        </h2>

        <div ref={ref} className="relative">
          {/* connecting ASCII line — draws L→R on scroll */}
          <div
            className="hidden lg:block"
            style={{
              position: "absolute",
              top: "28px",
              left: "12.5%",
              right: "12.5%",
              height: "2px",
              background: `rgba(${AR},0.08)`,
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${A}, rgba(${AR},0.4))`,
                transformOrigin: "left",
                boxShadow: `0 0 8px rgba(${AR},0.5)`,
              }}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.32, duration: 0.4 }}
                className="flex flex-col items-center text-center gap-4"
              >
                {/* node */}
                <motion.div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: `2px solid rgba(${AR},0.2)`,
                    background: "#141418",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25`,
                    position: "relative",
                    zIndex: 1,
                  }}
                  animate={
                    isInView
                      ? {
                          borderColor: `rgba(${AR},0.7)`,
                          boxShadow: `4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25, 0 0 16px rgba(${AR},0.25)`,
                        }
                      : {}
                  }
                  transition={{ delay: 0.4 + i * 0.32, duration: 0.4 }}
                >
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: "0.7rem",
                      color: A,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {step.num}
                  </span>
                </motion.div>

                <div>
                  <div
                    style={{
                      fontFamily: share,
                      fontSize: "0.68rem",
                      letterSpacing: "0.2em",
                      color: `rgba(${AR},0.75)`,
                      marginBottom: "6px",
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontFamily: exo,
                      fontWeight: 300,
                      fontSize: "0.78rem",
                      color: "#606070",
                      lineHeight: 1.55,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. USE CASES MARQUEE ─────────────────────────────────────────────────────
const USE_CASES = [
  "Finance", "SaaS", "Analytics", "Healthcare", "Data Engineering",
  "E-commerce", "BI Teams", "Research", "Logistics", "Product",
  "Marketing", "InsurTech", "EdTech", "Media", "Climate",
];

function UseCasesStrip() {
  const doubled = [...USE_CASES, ...USE_CASES];

  return (
    <section
      className="w-full py-12 overflow-hidden"
      style={{
        background: "#0f0f12",
        borderTop: `1px solid rgba(${AR},0.05)`,
        borderBottom: `1px solid rgba(${AR},0.05)`,
      }}
    >
      <div className="flex items-center gap-4 justify-center mb-8">
        <div style={{ width: "24px", height: "1px", background: `rgba(${AR},0.3)` }} />
        <span
          style={{
            fontFamily: share,
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: `rgba(${AR},0.4)`,
          }}
        >
          // INDUSTRIES &amp; USE CASES
        </span>
        <div style={{ width: "24px", height: "1px", background: `rgba(${AR},0.3)` }} />
      </div>

      {/* left/right fade masks */}
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: "120px",
            background: "linear-gradient(90deg, #0f0f12, transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: "120px",
            background: "linear-gradient(270deg, #0f0f12, transparent)",
          }}
        />

        <motion.div
          className="flex gap-3"
          style={{ width: "max-content" }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          {doubled.map((label, i) => (
            <div
              key={i}
              style={{
                fontFamily: share,
                fontSize: "0.68rem",
                letterSpacing: "0.18em",
                color: `rgba(${AR},0.75)`,
                background: "#141418",
                border: `1px solid rgba(${AR},0.2)`,
                borderRadius: "999px",
                padding: "8px 20px",
                whiteSpace: "nowrap",
                boxShadow: `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, inset 0 1px 0 rgba(${AR},0.06)`,
                transition: "color 0.18s, border-color 0.18s, box-shadow 0.18s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = A;
                el.style.borderColor = `rgba(${AR},0.45)`;
                el.style.boxShadow = `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, 0 0 14px rgba(${AR},0.12), inset 0 1px 0 rgba(${AR},0.1)`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = `rgba(${AR},0.75)`;
                el.style.borderColor = `rgba(${AR},0.2)`;
                el.style.boxShadow = `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, inset 0 1px 0 rgba(${AR},0.06)`;
                el.style.borderColor = `rgba(${AR},0.08)`;
              }}
            >
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function ServicesPage({ onHome }: { onHome: () => void }) {
  // scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ background: "#0d0d0f" }}>
      <ServicesHero onHome={onHome} />
      <ServicePillars />
      {DEEP_DIVES.map((d, i) => (
        <DeepDiveSection key={d.tag} dive={d} index={i} />
      ))}
      <HowItWorks />
      <UseCasesStrip />
      <CTABand
        headline={
          <>
            Your data already has{" "}
            <span style={{ color: "#7affc8", textShadow: "0 0 32px rgba(122,255,200,0.35)" }}>
              the answer.
            </span>
            <br />Let's surface it.
          </>
        }
        buttonText="Get Started Free"
      />
      <Footer />
    </div>
  );
}
