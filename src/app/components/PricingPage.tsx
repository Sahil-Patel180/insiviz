import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { AsciiBackground } from "./AsciiBackground";
import { CTABand } from "./CTABand";
import { Footer } from "./Footer";

const A  = "#7affc8";
const AR = "122,255,200";

const mono  = "'JetBrains Mono', monospace";
const share = "'Share Tech Mono', monospace";
const russo = "'Russo One', sans-serif";
const teko  = "'Teko', sans-serif";
const exo   = "'Exo 2', sans-serif";
const syn   = "'Syncopate', sans-serif";

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function PricingHero({ onHome }: { onHome: () => void }) {
  const headline = "Pay for signal.";

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "58vh", paddingTop: "72px", background: "#0d0d0f" }}
    >
      <div className="absolute inset-0" style={{ opacity: 0.25 }}>
        <AsciiBackground />
      </div>
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
          <span style={{ color: `rgba(${AR},0.65)` }}>pricing_</span>
        </div>

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
          // PRICING
        </motion.div>

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
              style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : "normal" }}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.04, duration: 0.28, ease: "easeOut" }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          style={{
            fontFamily: exo,
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(0.88rem, 2vw, 1.06rem)",
            color: "#606070",
            maxWidth: "520px",
            lineHeight: 1.78,
            margin: 0,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          One engine, two ways to run it — solo on your own data, or scaled
          across a team's whole pipeline.
        </motion.p>
      </motion.div>
    </section>
  );
}

// ─── 2. BILLING TOGGLE ────────────────────────────────────────────────────────
function BillingToggle({
  annual,
  onChange,
}: {
  annual: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 mb-14">
      <div
        className="relative flex items-center"
        style={{
          background: "#141418",
          borderRadius: "14px",
          padding: "6px",
          border: `1px solid rgba(${AR},0.08)`,
          boxShadow: "5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.05)",
        }}
      >
        <motion.div
          aria-hidden
          animate={{ left: annual ? "50%" : "2px" }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          style={{
            position: "absolute",
            top: 6,
            bottom: 6,
            width: "calc(50% - 4px)",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1a1a20 0%, #141418 100%)",
            boxShadow: `inset 0 1px 0 rgba(${AR},0.14), 0 0 14px rgba(${AR},0.08)`,
          }}
        />
        {(["Monthly", "Annual"] as const).map((label) => {
          const isAnnual = label === "Annual";
          const isActive = annual === isAnnual;
          return (
            <button
              key={label}
              onClick={() => onChange(isAnnual)}
              style={{
                position: "relative",
                zIndex: 1,
                fontFamily: syn,
                fontWeight: 700,
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                padding: "9px 26px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: isActive ? A : "#606070",
                textShadow: isActive ? `0 0 12px rgba(${AR},0.4)` : "none",
                transition: "color 0.18s ease",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <span
        style={{
          fontFamily: share,
          fontSize: "0.62rem",
          letterSpacing: "0.16em",
          color: `rgba(${AR},0.5)`,
          opacity: annual ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        // SAVE ~17% BILLED ANNUALLY
      </span>
    </div>
  );
}

// ─── 3. PRICING CARDS ─────────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  tag: string;
  forWhom: string;
  monthly: number;
  annualMonthly: number;
  unit: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "perviz",
    name: "PerViz",
    tag: "PERSONAL",
    forWhom: "For solo analysts, freelancers & indie builders",
    monthly: 19,
    annualMonthly: 16,
    unit: "/ month, 1 user",
    features: [
      "1 user seat",
      "Up to 15 datasets / month",
      "Full visualization engine scan",
      "CSV / PNG dashboard export",
      "7-day chart history",
      "Community support",
    ],
    cta: "Get Started Free",
  },
  {
    id: "orgviz",
    name: "OrgViz",
    tag: "ORGANIZATION",
    forWhom: "For teams running visualization at scale",
    monthly: 79,
    annualMonthly: 65,
    unit: "/ month, per seat",
    features: [
      "Unlimited team seats",
      "Unlimited datasets",
      "Full visualization engine scan",
      "AI automation pipelines",
      "Live BI / dashboard integration",
      "Custom model training on your data",
      "SSO & role-based access",
      "Priority support + success manager",
    ],
    cta: "Talk to Sales",
    highlighted: true,
  },
];

function PriceTag({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? plan.annualMonthly : plan.monthly;
  return (
    <div className="flex items-end gap-2">
      <span
        style={{
          fontFamily: teko,
          fontWeight: 600,
          fontSize: "0.9rem",
          color: `rgba(${AR},0.55)`,
          paddingBottom: "0.6rem",
        }}
      >
        $
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          style={{
            fontFamily: teko,
            fontWeight: 600,
            fontSize: "clamp(2.6rem, 5vw, 3.4rem)",
            color: "#c8c8d0",
            lineHeight: 1,
          }}
        >
          {price}
        </motion.span>
      </AnimatePresence>
      <span
        style={{
          fontFamily: share,
          fontSize: "0.62rem",
          letterSpacing: "0.06em",
          color: "#606070",
          paddingBottom: "0.7rem",
        }}
      >
        {plan.unit}
      </span>
    </div>
  );
}

function PlanCard({ plan, annual, index, onSelect }: { plan: Plan; annual: boolean; index: number; onSelect: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);
  const hi = plan.highlighted;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.45, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "#141418",
        borderRadius: "20px",
        padding: "36px 32px",
        border: hi ? `1px solid rgba(${AR},0.35)` : `1px solid rgba(${AR},0.06)`,
        boxShadow: hi
          ? `0 0 50px rgba(${AR},0.1), 10px 10px 24px #0a0a0c, -5px -5px 14px #1e1e25, inset 0 1px 0 rgba(${AR},0.16)`
          : hovered
          ? `10px 10px 24px #0a0a0c, -5px -5px 14px #1e1e25, inset 0 1px 0 rgba(${AR},0.1)`
          : `8px 8px 18px #0a0a0c, -4px -4px 12px #1e1e25, inset 0 1px 0 rgba(${AR},0.06)`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
      }}
    >
      {hi && (
        <div
          style={{
            position: "absolute",
            top: "-13px",
            left: "32px",
            fontFamily: share,
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "#0d0d0f",
            background: A,
            padding: "4px 14px",
            borderRadius: "999px",
            boxShadow: `0 0 16px rgba(${AR},0.4)`,
          }}
        >
          MOST USED
        </div>
      )}

      <div
        style={{
          fontFamily: share,
          fontSize: "0.62rem",
          letterSpacing: "0.24em",
          color: `rgba(${AR},0.6)`,
          marginBottom: "10px",
        }}
      >
        // {plan.tag}
      </div>

      <h3
        style={{
          fontFamily: russo,
          fontWeight: 400,
          fontSize: "1.9rem",
          letterSpacing: "0.02em",
          color: "#c8c8d0",
          margin: 0,
          marginBottom: "6px",
        }}
      >
        {plan.name}
      </h3>

      <p
        style={{
          fontFamily: exo,
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: "0.8rem",
          color: "#606070",
          margin: 0,
          marginBottom: "22px",
          lineHeight: 1.5,
          minHeight: "2.6em",
        }}
      >
        {plan.forWhom}
      </p>

      <PriceTag plan={plan} annual={annual} />

      <button
        onClick={onSelect}
        style={{
          width: "100%",
          marginTop: "26px",
          marginBottom: "28px",
          fontFamily: syn,
          fontWeight: 700,
          fontSize: "0.62rem",
          letterSpacing: "0.18em",
          padding: "14px 0",
          borderRadius: "12px",
          border: hi ? `1px solid rgba(${AR},0.3)` : `1px solid rgba(${AR},0.1)`,
          cursor: "pointer",
          background: hi
            ? `linear-gradient(135deg, rgba(${AR},0.18) 0%, rgba(${AR},0.08) 100%)`
            : "#1a1a20",
          color: hi ? A : "#a0a0b0",
          boxShadow: hi
            ? `0 0 30px rgba(${AR},0.14), 4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25`
            : "4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25",
          transition: "all 0.2s ease",
        }}
      >
        {plan.cta.toUpperCase()}
      </button>

      <div style={{ borderTop: `1px solid rgba(${AR},0.07)`, paddingTop: "20px" }}>
        {plan.features.map((f) => (
          <div
            key={f}
            className="flex items-start gap-3"
            style={{ marginBottom: "12px" }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: "0.78rem",
                color: A,
                lineHeight: 1.5,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontFamily: exo,
                fontWeight: 300,
                fontSize: "0.82rem",
                color: "#a0a0b0",
                lineHeight: 1.5,
              }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PricingCards({ annual, onSelect }: { annual: boolean; onSelect: (planId:string) => void }) {
  return (
    <section className="w-full px-6 py-10" style={{ background: "#0d0d0f" }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} annual={annual} index={i} onSelect={() => onSelect(plan.id)} />
        ))}
      </div>
    </section>
  );
}

// ─── 4. FEATURE COMPARISON TABLE ──────────────────────────────────────────────
const COMPARE_ROWS: { label: string; perviz: string; orgviz: string }[] = [
  { label: "Seats",                    perviz: "1",          orgviz: "Unlimited" },
  { label: "Datasets / month",         perviz: "15",         orgviz: "Unlimited" },
  { label: "Visualization engine",     perviz: "Full",       orgviz: "Full" },
  { label: "AI automation pipelines",  perviz: "—",          orgviz: "✓" },
  { label: "Dashboard / BI integration", perviz: "Export only", orgviz: "Live sync" },
  { label: "Custom model training",    perviz: "—",          orgviz: "✓" },
  { label: "SSO & role-based access",  perviz: "—",          orgviz: "✓" },
  { label: "Support",                  perviz: "Community",  orgviz: "Priority + success manager" },
];

function FeatureCompareTable() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="w-full px-6 py-20" style={{ background: "#0f0f12" }}>
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className="text-center mb-12">
          <div
            style={{
              fontFamily: share,
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.4)`,
              marginBottom: "12px",
            }}
          >
            // FEATURE BREAKDOWN
          </div>
          <h2
            style={{
              fontFamily: russo,
              fontWeight: 400,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "#c8c8d0",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Diff the plans.
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            background: "#141418",
            borderRadius: "16px",
            border: `1px solid rgba(${AR},0.07)`,
            boxShadow: "8px 8px 18px #0a0a0c, -4px -4px 12px #1e1e25",
            overflow: "hidden",
          }}
        >
          {/* header row */}
          <div
            className="grid grid-cols-3"
            style={{
              borderBottom: `1px solid rgba(${AR},0.1)`,
              background: "#16161a",
            }}
          >
            <div style={{ padding: "16px 20px", fontFamily: mono, fontSize: "0.7rem", color: "#606070" }}>
              feature
            </div>
            <div
              style={{
                padding: "16px 20px",
                fontFamily: share,
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "#a0a0b0",
                textAlign: "center",
              }}
            >
              PERVIZ
            </div>
            <div
              style={{
                padding: "16px 20px",
                fontFamily: share,
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: A,
                textAlign: "center",
                textShadow: `0 0 10px rgba(${AR},0.3)`,
              }}
            >
              ORGVIZ
            </div>
          </div>

          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-3"
              style={{
                borderBottom:
                  i === COMPARE_ROWS.length - 1 ? "none" : `1px solid rgba(${AR},0.05)`,
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  fontFamily: exo,
                  fontWeight: 300,
                  fontSize: "0.8rem",
                  color: "#a0a0b0",
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  padding: "14px 20px",
                  fontFamily: mono,
                  fontSize: "0.74rem",
                  color: row.perviz === "—" ? "#3a3a45" : "#808090",
                  textAlign: "center",
                }}
              >
                {row.perviz}
              </div>
              <div
                style={{
                  padding: "14px 20px",
                  fontFamily: mono,
                  fontSize: "0.74rem",
                  color: row.orgviz === "—" ? "#3a3a45" : A,
                  textAlign: "center",
                }}
              >
                {row.orgviz}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── 5. FAQ ───────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Can I switch between PerViz and OrgViz later?",
    a: "Yes. Upgrade or downgrade anytime from billing settings — changes prorate to your current cycle.",
  },
  {
    q: "What counts as a dataset?",
    a: "Any single file or connected table you run through the visualization engine in a given month. Re-running the same dataset doesn't count twice.",
  },
  {
    q: "Is there a free trial?",
    a: "PerViz starts with a free tier so you can scan real data before paying. OrgViz includes a guided trial for your team.",
  },
  {
    q: "Do you support custom enterprise terms?",
    a: "Yes — for larger seat counts, on-prem deployment, or custom SLAs, talk to sales and we'll scope a plan around it.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid rgba(${AR},0.07)`,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
        style={{ padding: "20px 4px", background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span
          style={{
            fontFamily: teko,
            fontWeight: 500,
            fontSize: "1.05rem",
            color: open ? A : "#c8c8d0",
            transition: "color 0.18s ease",
          }}
        >
          {q}
        </span>
        <span
          style={{
            fontFamily: mono,
            fontSize: "0.8rem",
            color: `rgba(${AR},0.6)`,
            flexShrink: 0,
            marginLeft: "16px",
          }}
        >
          [{open ? "−" : "+"}]
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: exo,
                fontWeight: 300,
                fontSize: "0.85rem",
                color: "#606070",
                lineHeight: 1.7,
                padding: "0 4px 20px",
                margin: 0,
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  return (
    <section className="w-full px-6 py-20" style={{ background: "#0d0d0f" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div
            style={{
              fontFamily: share,
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.4)`,
              marginBottom: "12px",
            }}
          >
            // FAQ
          </div>
          <h2
            style={{
              fontFamily: russo,
              fontWeight: 400,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              color: "#c8c8d0",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Common questions.
          </h2>
        </div>
        {FAQS.map((f, i) => (
          <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export function PricingPage({ onHome, onRequestAccess }: { onHome: () => void; onRequestAccess: (ctx?: { planId: "perviz" | "orgviz"; billing: "monthly" | "annual" }) => void; }) {
  const [annual, setAnnual] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ background: "#0d0d0f" }}>
      <PricingHero onHome={onHome} />
      <div className="px-6 pt-10">
        <BillingToggle annual={annual} onChange={setAnnual} />
      </div>
      <PricingCards annual={annual} onSelect={(planId) => onRequestAccess({ planId: planId as "perviz" | "orgviz", billing: annual ? "annual" : "monthly" })} />
      <FeatureCompareTable />
      <FAQSection />
      <CTABand
        headline={
          <>
            Start free.{" "}
            <span style={{ color: "#7affc8", textShadow: "0 0 32px rgba(122,255,200,0.35)" }}>
              Scale when ready.
            </span>
          </>
        }
        buttonText="Get Started Free"
        onClick={() => onRequestAccess()}
      />
      <Footer />
    </div>
  );
}