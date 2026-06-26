import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AsciiBackground } from "./AsciiBackground";
import { submitAccessRequest } from "../../app/lib/requestAccess";
const A      = "#7affc8";
const AR     = "122,255,200";
const RED    = "255,70,70";

const mono  = "'JetBrains Mono', monospace";
const share = "'Share Tech Mono', monospace";
const russo = "'Russo One', sans-serif";
const exo   = "'Exo 2', sans-serif";
const syn   = "'Syncopate', sans-serif";

type PlanId = "perviz" | "orgviz";
type Billing = "monthly" | "annual";

interface InitialPlan {
  planId: PlanId;
  billing: Billing;
}

interface RequestAccessPageProps {
  initialPlan: InitialPlan | null;
  onHome: () => void;
  onBackToPricing: () => void;
}

const PLAN_LABEL: Record<PlanId, { name: string; tag: string }> = {
  perviz: { name: "PerViz", tag: "PERSONAL" },
  orgviz: { name: "OrgViz", tag: "ORGANIZATION" },
};

// ─── styled input ─────────────────────────────────────────────────────────────
function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <label
        style={{
          display: "block",
          fontFamily: share,
          fontSize: "0.62rem",
          letterSpacing: "0.18em",
          color: `rgba(${AR},0.5)`,
          marginBottom: "8px",
        }}
      >
        {label.toUpperCase()}
        {!required && <span style={{ color: "#606070" }}> (OPTIONAL)</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: share,
          fontSize: "0.75rem",
          letterSpacing: "0.06em",
          width: "100%",
          padding: "14px 18px",
          background: "#141418",
          border: `1px solid ${focused ? `rgba(${AR},0.45)` : `rgba(${AR},0.12)`}`,
          borderRadius: "10px",
          color: `rgba(${AR},0.85)`,
          outline: "none",
          boxShadow: focused
            ? `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, 0 0 14px rgba(${AR},0.07)`
            : "3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxSizing: "border-box",
          minHeight: "48px",
        }}
      />
    </div>
  );
}

// ─── plan picker (only shown when no plan passed in) ──────────────────────────
function PlanPicker({
  selected,
  billing,
  onSelectPlan,
  onSelectBilling,
}: {
  selected: PlanId | null;
  billing: Billing;
  onSelectPlan: (p: PlanId) => void;
  onSelectBilling: (b: Billing) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div className="flex gap-3 justify-center">
        {(["monthly", "annual"] as Billing[]).map((b) => (
          <button
            key={b}
            onClick={() => onSelectBilling(b)}
            style={{
              fontFamily: share,
              fontSize: "0.62rem",
              letterSpacing: "0.16em",
              padding: "8px 18px",
              borderRadius: "999px",
              border: billing === b ? `1px solid rgba(${AR},0.4)` : `1px solid rgba(${AR},0.1)`,
              background: billing === b ? `rgba(${AR},0.1)` : "transparent",
              color: billing === b ? A : "#606070",
              cursor: "pointer",
            }}
          >
            {b.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(PLAN_LABEL) as PlanId[]).map((id) => {
          const isSel = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelectPlan(id)}
              style={{
                textAlign: "left",
                padding: "20px 22px",
                borderRadius: "14px",
                cursor: "pointer",
                background: "#141418",
                border: isSel ? `1px solid rgba(${AR},0.4)` : `1px solid rgba(${AR},0.08)`,
                boxShadow: isSel
                  ? `0 0 24px rgba(${AR},0.12), 4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25`
                  : "4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25",
              }}
            >
              <div style={{ fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.2em", color: `rgba(${AR},0.55)`, marginBottom: "6px" }}>
                // {PLAN_LABEL[id].tag}
              </div>
              <div style={{ fontFamily: russo, fontSize: "1.3rem", color: "#c8c8d0" }}>
                {PLAN_LABEL[id].name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── main export ───────────────────────────────────────────────────────────────
export function RequestAccessPage({ initialPlan, onHome, onBackToPricing }: RequestAccessPageProps) {
  const [plan, setPlan] = useState<PlanId | null>(initialPlan?.planId ?? null);
  const [billing, setBilling] = useState<Billing>(initialPlan?.billing ?? "monthly");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // org-only fields
  const [orgName, setOrgName] = useState("");
  const [orgRole, setOrgRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [industry, setIndustry] = useState("");

  const planChosen = plan !== null;
  const isOrg = plan === "orgviz";

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim() || (isOrg && !orgName.trim())) {
      setErrorMsg("Fill in the required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await submitAccessRequest({
        plan,
        billingCycle: billing,
        accountType: isOrg ? "organization" : "personal",
        fullName,
        email,
        phone,
        message,
        orgName: isOrg ? orgName : null,
        orgRole: isOrg ? orgRole : null,
        teamSize: isOrg ? teamSize : null,
        industry: isOrg ? industry : null,
      });
      setSubmitted(true);
    } catch {
      setErrorMsg("Couldn't submit request. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-24" style={{ background: "#0d0d0f" }}>
      <AsciiBackground />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 30%, transparent 20%, rgba(13,13,15,0.7) 70%, #0d0d0f 100%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full"
        style={{
          maxWidth: "560px",
          background: "#141418",
          borderRadius: "20px",
          padding: "44px 40px",
          border: `1px solid rgba(${AR},0.08)`,
          boxShadow: `0 0 50px rgba(${AR},0.04), 10px 10px 24px #0a0a0c, -5px -5px 14px #1e1e25`,
        }}
      >
        <div style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.24em", color: `rgba(${AR},0.5)`, marginBottom: "10px" }}>
          // REQUEST ACCESS
        </div>
        <h1 style={{ fontFamily: russo, fontSize: "1.8rem", color: "#c8c8d0", marginBottom: "28px" }}>
          {submitted ? "Request received" : "Get started with InsiViz"}
        </h1>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: exo, color: "#a0a0b0", lineHeight: 1.7 }}>
              <p>
                Thanks{fullName ? `, ${fullName.split(" ")[0]}` : ""}. We're reviewing your request for{" "}
                <span style={{ color: A }}>{plan ? PLAN_LABEL[plan].name : "InsiViz"}</span>.
                Login credentials get emailed once approved — usually within 1 business day.
              </p>
              <button
                onClick={onHome}
                style={{ marginTop: "24px", fontFamily: syn, fontSize: "0.6rem", letterSpacing: "0.18em", color: A, background: "none", border: "none", cursor: "pointer" }}
              >
                ← BACK TO HOME
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
              {!initialPlan && !planChosen && (
                <PlanPicker selected={plan} billing={billing} onSelectPlan={setPlan} onSelectBilling={setBilling} />
              )}

              {planChosen && (
                <>
                  <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
                    <div style={{ fontFamily: share, fontSize: "0.68rem", letterSpacing: "0.12em", color: A }}>
                      {PLAN_LABEL[plan!].name.toUpperCase()} · {billing.toUpperCase()}
                    </div>
                    <button
                      onClick={() => (initialPlan ? onBackToPricing() : setPlan(null))}
                      style={{ fontFamily: share, fontSize: "0.62rem", color: "#606070", background: "none", border: "none", cursor: "pointer" }}
                    >
                      change plan
                    </button>
                  </div>

                  <FormField label="Full name" placeholder="Jane Doe" value={fullName} onChange={setFullName} />
                  <FormField label={isOrg ? "Work email" : "Email"} type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
                  <FormField label="Phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={setPhone} required={false} />

                  {isOrg && (
                    <>
                      <FormField label="Organization name" placeholder="Acme Inc." value={orgName} onChange={setOrgName} />
                      <FormField label="Your role" placeholder="Founder, IT Admin, etc." value={orgRole} onChange={setOrgRole} required={false} />
                      <FormField label="Team size" placeholder="e.g. 10-50" value={teamSize} onChange={setTeamSize} required={false} />
                      <FormField label="Industry" placeholder="e.g. Fintech, Retail" value={industry} onChange={setIndustry} required={false} />
                    </>
                  )}

                  <FormField label="Message" placeholder="What are you looking to do?" value={message} onChange={setMessage} required={false} />

                  {errorMsg && (
                    <div style={{ fontFamily: share, fontSize: "0.7rem", color: `rgb(${RED})` }}>{errorMsg}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      marginTop: "8px",
                      fontFamily: syn,
                      fontWeight: 700,
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      padding: "14px 0",
                      borderRadius: "12px",
                      border: `1px solid rgba(${AR},0.3)`,
                      cursor: submitting ? "default" : "pointer",
                      opacity: submitting ? 0.6 : 1,
                      background: `linear-gradient(135deg, rgba(${AR},0.18) 0%, rgba(${AR},0.08) 100%)`,
                      color: A,
                    }}
                  >
                    {submitting ? "SUBMITTING…" : "SUBMIT REQUEST"}
                  </button>
                </>
              )}

              <button
                onClick={onHome}
                style={{ marginTop: "6px", fontFamily: share, fontSize: "0.65rem", color: "#606070", background: "none", border: "none", cursor: "pointer" }}
              >
                ← back to home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}