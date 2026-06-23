import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { AsciiBackground } from "./AsciiBackground";
import { CTABand } from "./CTABand";
import { Footer } from "./Footer";

const A  = "#7affc8";
const AR = "122,255,200";

const share = "'Share Tech Mono', monospace";
const russo = "'Russo One', sans-serif";
const teko  = "'Teko', sans-serif";
const exo   = "'Exo 2', sans-serif";
const audio = "'Audiowide', sans-serif";

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function AboutHero({ onHome }: { onHome: () => void }) {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "55vh", paddingTop: "72px", background: "#0d0d0f" }}
    >
      {/* ASCII bg — even lower opacity than services, page tone = calm */}
      <div className="absolute inset-0" style={{ opacity: 0.14 }}>
        <AsciiBackground />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 30%, rgba(13,13,15,0.82) 80%, #0d0d0f 100%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 text-center px-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
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
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = A)}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.35)`)
            }
          >
            home_
          </span>
          {"  /  "}
          <span style={{ color: `rgba(${AR},0.65)` }}>about_</span>
        </div>

        {/* badge */}
        <div
          style={{
            fontFamily: share,
            fontSize: "0.68rem",
            letterSpacing: "0.32em",
            color: `rgba(${AR},0.65)`,
            background: `rgba(${AR},0.05)`,
            border: `1px solid rgba(${AR},0.16)`,
            padding: "6px 20px",
            borderRadius: "999px",
          }}
        >
          // ABOUT
        </div>

        <h1
          style={{
            fontFamily: russo,
            fontWeight: 400,
            fontSize: "clamp(2.2rem, 6vw, 4.8rem)",
            letterSpacing: "0.02em",
            color: "#c8c8d0",
            lineHeight: 1.05,
            textTransform: "uppercase",
            margin: 0,
            maxWidth: "700px",
          }}
        >
          We got tired of{" "}
          <span style={{ color: A, textShadow: `0 0 32px rgba(${AR},0.3)` }}>
            guessing charts.
          </span>
        </h1>

        <p
          style={{
            fontFamily: exo,
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            color: "#606070",
            margin: 0,
          }}
        >
          So we built something that doesn't.
        </p>
      </motion.div>
    </section>
  );
}

// ─── 2. ORIGIN STORY ─────────────────────────────────────────────────────────
const STORY_PARAGRAPHS = [
  "Every analyst has the same moment — build a chart, present it, then realize the axis pairing was misleading the whole time. You picked a bar chart when a scatter would've told the truth. You grouped by month when the signal was in the week. You shipped the deck. The decision got made on bad visual logic.",
  "We kept hitting that wall. So instead of building another dashboard tool, we trained a model on the logic behind visualization itself: what combinations are statistically valid, which ones lie by omission, which ones actually answer the question being asked.",
  "InsiViz isn't a chart library. It doesn't make charts look better. It makes sure the right chart gets built in the first place — before you've already committed to the wrong one.",
];

const PULL_QUOTE =
  "The judgment layer that should've existed before every dashboard tool shipped.";

function OriginStory() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      className="w-full py-20 px-6"
      style={{
        background: "#0f0f12",
        borderTop: `1px solid rgba(${AR},0.04)`,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* section label */}
        <div className="flex items-center gap-4 mb-10">
          <div style={{ width: "32px", height: "1px", background: `rgba(${AR},0.4)` }} />
          <span
            style={{
              fontFamily: share,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.5)`,
            }}
          >
            // ORIGIN STORY
          </span>
        </div>

        {/* headline */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: audio,
            fontWeight: 400,
            fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)",
            letterSpacing: "0.02em",
            color: "#c8c8d0",
            lineHeight: 1.2,
            marginBottom: "2.5rem",
          }}
        >
          It started with one bad dashboard.
        </motion.h2>

        <div ref={ref} className="flex flex-col gap-6">
          {/* paragraph 1 */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08, duration: 0.5 }}
            style={{
              fontFamily: exo,
              fontWeight: 300,
              fontSize: "0.95rem",
              color: "#8080a0",
              lineHeight: 1.85,
              margin: 0,
            }}
          >
            {STORY_PARAGRAPHS[0]}
          </motion.p>

          {/* paragraph 2 */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.22, duration: 0.5 }}
            style={{
              fontFamily: exo,
              fontWeight: 300,
              fontSize: "0.95rem",
              color: "#8080a0",
              lineHeight: 1.85,
              margin: 0,
            }}
          >
            {STORY_PARAGRAPHS[1]}
          </motion.p>

          {/* pull quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.36, duration: 0.5 }}
            animate-second={
              isInView
                ? {
                    textShadow: [
                      `0 0 12px rgba(${AR},0.15)`,
                      `0 0 28px rgba(${AR},0.4)`,
                      `0 0 12px rgba(${AR},0.15)`,
                    ],
                  }
                : {}
            }
            style={{
              margin: "0.8rem 0",
              padding: "1.6rem 2rem",
              borderLeft: `3px solid rgba(${AR},0.5)`,
              background: `rgba(${AR},0.03)`,
              borderRadius: "0 10px 10px 0",
            }}
          >
            <motion.p
              animate={
                isInView
                  ? {
                      textShadow: [
                        `0 0 10px rgba(${AR},0.1)`,
                        `0 0 24px rgba(${AR},0.35)`,
                        `0 0 10px rgba(${AR},0.1)`,
                      ],
                    }
                  : {}
              }
              transition={{ delay: 0.6, duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontFamily: teko,
                fontWeight: 400,
                fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)",
                letterSpacing: "0.04em",
                color: A,
                lineHeight: 1.25,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              "{PULL_QUOTE}"
            </motion.p>
          </motion.blockquote>

          {/* paragraph 3 */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.48, duration: 0.5 }}
            style={{
              fontFamily: exo,
              fontWeight: 300,
              fontSize: "0.95rem",
              color: "#8080a0",
              lineHeight: 1.85,
              margin: 0,
            }}
          >
            {STORY_PARAGRAPHS[2]}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

// ─── 3. PHILOSOPHY ───────────────────────────────────────────────────────────
const PRINCIPLES = [
  {
    num: "01",
    title: "Logic over templates",
    desc: "We don't guess what looks good. We validate what's true. Every suggestion InsiViz makes is grounded in statistical validity, not visual convention.",
  },
  {
    num: "02",
    title: "Trust over speed",
    desc: "A fast wrong answer is worse than a slow right one. We'd rather surface fewer, better combos than flood you with options that feel productive but mislead.",
  },
  {
    num: "03",
    title: "Built for the data, not the demo",
    desc: "Real datasets are messy. Our model is trained on that mess — missing values, mixed types, non-normal distributions. It doesn't break when the data gets real.",
  },
];

function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      className="w-full py-20 px-6"
      style={{
        background: "#0d0d0f",
        borderTop: `1px solid rgba(${AR},0.04)`,
      }}
    >
      <div className="max-w-3xl mx-auto">
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
            // HOW WE THINK
          </span>
        </div>

        <h2
          style={{
            fontFamily: teko,
            fontWeight: 600,
            fontSize: "clamp(2.6rem, 5vw, 4.4rem)",
            letterSpacing: "0.08em",
            color: "#c8c8d0",
            lineHeight: 0.95,
            marginBottom: "3rem",
            textTransform: "uppercase",
          }}
        >
          Three principles.{" "}
          <span style={{ color: A }}>No exceptions.</span>
        </h2>

        <div ref={ref} className="flex flex-col gap-10">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, x: -32 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.16, duration: 0.45, ease: "easeOut" }}
              className="flex gap-8 items-start"
            >
              {/* number */}
              <div
                style={{
                  fontFamily: share,
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  color: `rgba(${AR},0.4)`,
                  paddingTop: "6px",
                  minWidth: "28px",
                  flexShrink: 0,
                }}
              >
                {p.num}
              </div>

              {/* content — no card border, flat left-aligned text */}
              <div style={{ borderLeft: `1px solid rgba(${AR},0.1)`, paddingLeft: "24px" }}>
                <div
                  style={{
                    fontFamily: audio,
                    fontWeight: 400,
                    fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
                    letterSpacing: "0.04em",
                    color: "#c8c8d0",
                    marginBottom: "10px",
                  }}
                >
                  {p.title}
                </div>
                <p
                  style={{
                    fontFamily: exo,
                    fontWeight: 300,
                    fontSize: "0.88rem",
                    color: "#606070",
                    lineHeight: 1.75,
                    margin: 0,
                    maxWidth: "520px",
                  }}
                >
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 4. TEAM ─────────────────────────────────────────────────────────────────
function Team() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{
        background: "#0f0f12",
        borderTop: `1px solid rgba(${AR},0.04)`,
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div style={{ width: "32px", height: "1px", background: `rgba(${AR},0.4)` }} />
          <span
            style={{
              fontFamily: share,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.5)`,
            }}
          >
            // TEAM
          </span>
        </div>

        <p
          style={{
            fontFamily: exo,
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            color: "#606070",
            lineHeight: 1.8,
            margin: 0,
            maxWidth: "520px",
          }}
        >
          Built by a small team obsessed with getting visualization logic right.
          We care more about the model being correct than the interface being flashy.
        </p>

        <div
          style={{
            fontFamily: share,
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: `rgba(${AR},0.3)`,
          }}
        >
          // HIRING — IF THIS RESONATES, REACH OUT.
        </div>
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function AboutPage({ onHome }: { onHome: () => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ background: "#0d0d0f" }}>
      <AboutHero onHome={onHome} />
      <OriginStory />
      <Philosophy />
      <Team />
      <CTABand
        label="// SEE IT FOR YOURSELF"
        headline={
          <>
            See what your data's{" "}
            <span style={{ color: A, textShadow: `0 0 32px rgba(${AR},0.35)` }}>
              been hiding.
            </span>
          </>
        }
        buttonText="Try InsiViz Free"
      />
      <Footer />
    </div>
  );
}
