import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { AsciiBackground } from "./AsciiBackground";
import { signIn } from "../lib/auth";

const A      = "#7affc8";
const AR     = "122,255,200";
const AMBER  = "#ffb964";
const AMBERR = "255,185,100";
const RED    = "255,70,70";

const mono  = "'JetBrains Mono', monospace";
const share = "'Share Tech Mono', monospace";
const russo = "'Russo One', sans-serif";
const exo   = "'Exo 2', sans-serif";

// ─── ASCII face ───────────────────────────────────────────────────────────────
function AsciiFace({
  eyePos,
  eyeOpen,
  amber,
}: {
  eyePos: number;    // -1 (left) … 1 (right)
  eyeOpen: boolean;
  amber: boolean;
}) {
  const eyeColor   = amber ? AMBER : A;
  const eyeRgb     = amber ? AMBERR : AR;
  const mouthColor = amber ? AMBER : A;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        userSelect: "none",
        padding: "8px 0",
      }}
    >
      {/* eyes — translate together L↔R */}
      <div style={{ position: "relative", width: "96px", height: "22px" }}>
        <motion.div
          animate={{ x: eyePos * 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "30px",
          }}
        >
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              animate={{ scaleY: eyeOpen ? 1 : 0.1 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{
                fontFamily: mono,
                fontSize: "1.1rem",
                lineHeight: 1,
                display: "inline-block",
                transformOrigin: "center center",
                color: eyeColor,
                textShadow: `0 0 14px rgba(${eyeRgb},0.7)`,
                transition: "color 0.28s ease, text-shadow 0.28s ease",
              }}
            >
              ██
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* mouth */}
      <div
        style={{
          fontFamily: mono,
          fontSize: "0.65rem",
          letterSpacing: "0.06em",
          color: mouthColor,
          opacity: amber ? 0.75 : 0.4,
          transition: "color 0.28s ease, opacity 0.28s ease",
          whiteSpace: "nowrap",
        }}
      >
        {amber ? "// secure_mode" : "────────────"}
      </div>
    </div>
  );
}

// ─── styled input ─────────────────────────────────────────────────────────────
function FormInput({
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  shake,
  autoComplete,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  error: boolean;
  shake: boolean;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? `rgba(${RED},0.75)`
    : focused
    ? `rgba(${AR},0.45)`
    : `rgba(${AR},0.12)`;

  return (
    <motion.div
      animate={shake ? { x: [-4, 4, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus(); }}
        onBlur={() => { setFocused(false); onBlur(); }}
        style={{
          fontFamily: share,
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          width: "100%",
          padding: "14px 18px",
          background: "#141418",
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          color: `rgba(${AR},0.85)`,
          outline: "none",
          boxShadow: focused
            ? `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, 0 0 14px rgba(${AR},0.07)`
            : `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxSizing: "border-box",
          minHeight: "48px",
        }}
      />
    </motion.div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export function LoginPage({
  onHome,
  onForgotPassword,
  onLoginSuccess,
}: {
  onHome: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: (profile: import("../lib/auth").Profile) => void;
}) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused]   = useState<"email" | "password" | null>(null);
  const [eyeOpen, setEyeOpen]   = useState(true);
  const [blinking, setBlinking] = useState(false);
  const [errors, setErrors]     = useState({ email: false, password: false });
  const [shakes, setShakes]     = useState({ email: false, password: false });

  const focusedRef = useRef(focused);
  focusedRef.current = focused;

  // scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // blink loop — fires every 4–5.5s, skips during password mode
  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 4000 + Math.random() * 1500;
      tid = setTimeout(() => {
        if (focusedRef.current !== "password") {
          setBlinking(true);
          setTimeout(() => setBlinking(false), 140);
        }
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(tid);
  }, []);

  // eye state
  const inPasswordMode = focused === "password";
  const isEyeOpen      = !inPasswordMode && !blinking;

  // eye horizontal position: maps email value length → -1…1
  const rawPos  = (email.length / 24) * 2 - 1;
  const eyePos  = focused === "email"
    ? Math.max(-1, Math.min(1, rawPos))
    : 0;

  // trigger error shake
  const triggerError = (field: "email" | "password") => {
    setErrors((prev) => ({ ...prev, [field]: true }));
    setShakes((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setErrors((prev)  => ({ ...prev, [field]: false }));
      setShakes((prev)  => ({ ...prev, [field]: false }));
    }, 1400);
  };

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim())    { triggerError("email");    return; }
    if (!password.trim()) { triggerError("password"); return; }
    
    // submit logic here
    setFormError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.message);
      triggerError("email");
      triggerError("password");
      return;
    }

    onLoginSuccess(result.profile);
    // console.log("Login submitted:", email);
  };

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{
        minHeight: "100vh",
        background: "#0d0d0f",
        paddingTop: "72px",
        paddingBottom: "40px",
        paddingLeft: "16px",
        paddingRight: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* ASCII bg — very low opacity, utility page */}
      <div className="absolute inset-0" style={{ opacity: 0.22 }}>
        <AsciiBackground />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 20%, rgba(13,13,15,0.88) 85%, #0d0d0f 100%)",
        }}
      />

      {/* centered card — fade + scale in */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "400px",
          background: "#141418",
          borderRadius: "20px",
          padding: "clamp(28px, 6vw, 40px) clamp(24px, 6vw, 40px)",
          boxShadow: `12px 12px 28px #0a0a0c, -6px -6px 18px #1e1e25, inset 0 1px 0 rgba(${AR},0.08)`,
          border: `1px solid rgba(${AR},0.08)`,
          boxSizing: "border-box",
        }}
      >
        {/* logo — top-left */}
        <div
          style={{ marginBottom: "24px", cursor: "pointer" }}
          onClick={onHome}
        >
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              color: A,
              textShadow: `0 0 12px rgba(${AR},0.3)`,
            }}
          >
            INSI<span style={{ color: "#3a3a45", fontWeight: 400 }}>VIZ</span>
          </span>
        </div>

        {/* ASCII face centerpiece */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              transform: "scale(var(--face-scale, 1))",
            }}
            className="[--face-scale:1] sm:[--face-scale:1] [media_(max-width:380px)_&]:[--face-scale:0.6]"
          >
            <AsciiFace
              eyePos={eyePos}
              eyeOpen={isEyeOpen}
              amber={inPasswordMode}
            />
          </div>
        </div>

        {/* badge */}
        <div
          style={{
            fontFamily: share,
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: `rgba(${AR},0.55)`,
            marginBottom: "22px",
            textAlign: "center",
          }}
        >
          // LOGIN
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <FormInput
            type="email"
            placeholder="email_"
            value={email}
            onChange={setEmail}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            error={errors.email}
            shake={shakes.email}
            autoComplete="email"
          />

          <FormInput
            type="password"
            placeholder="password_"
            value={password}
            onChange={setPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            error={errors.password}
            shake={shakes.password}
            autoComplete="current-password"
          />

          {/* submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              fontFamily: "'Syncopate', sans-serif",
              fontWeight: 700,
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              padding: "15px 20px",
              marginTop: "6px",
              borderRadius: "10px",
              border: `1px solid rgba(${AR},0.28)`,
              cursor: "pointer",
              background: `linear-gradient(135deg, rgba(${AR},0.16), rgba(${AR},0.07))`,
              color: A,
              boxShadow: `0 0 24px rgba(${AR},0.1), 4px 4px 12px #0a0a0c, -3px -3px 8px #1e1e25`,
              transition: "box-shadow 0.2s ease",
              minHeight: "48px",
            }}
            disabled={submitting}
          >
            {/* LOG_IN → */}
            {submitting ? "LOGGING_IN …" : "LOG_IN →"}
          </motion.button>
          {formError && (
            <p style={{ fontFamily: share, fontSize: "0.68rem", color: 'rgba(${RED},0.85)', textAlign: "center", margin: "4px 0 0" }}>
              {formError}
            </p>
          )}
        </form>

        {/* forgot password — centered */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span
            style={{
              fontFamily: share,
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              color: `rgba(${AR},0.3)`,
              cursor: "pointer",
              transition: "color 0.18s ease",
            }}
            onClick={onForgotPassword}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.65)`)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.3)`)}
          >
            forgot_password?
          </span>
        </div>
      </motion.div>
    </div>
  );
}
