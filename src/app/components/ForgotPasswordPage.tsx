import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { AsciiBackground } from "./AsciiBackground";
import {
  requestForgotPassword,
  requestOtpVerification,
  requestPasswordReset,
} from "../lib/auth";

const A = "#7affc8";
const AR = "122,255,200";
const AMBER = "#ffb964";
const AMBERR = "255,185,100";
const RED = "255,70,70";
const GREEN = "81,210,140";

const mono = "'JetBrains Mono', monospace";
const share = "'Share Tech Mono', monospace";
const syncopate = "'Syncopate', sans-serif";
const orbitron = "'Orbitron', sans-serif";

function AuthInput({
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  accent,
  autoComplete,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  accent: "green" | "amber";
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const accentRgb = accent === "amber" ? AMBERR : AR;
  const accentColor = accent === "amber" ? AMBER : A;

  return (
    <motion.div
      animate={focused ? { scale: 1.01 } : { scale: 1 }}
      transition={{ duration: 0.18 }}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        style={{
          fontFamily: share,
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          width: "100%",
          padding: "14px 18px",
          background: "#141418",
          border: `1px solid ${focused ? `rgba(${accentRgb},0.45)` : `rgba(${accentRgb},0.12)`}`,
          borderRadius: "10px",
          color: `rgba(${accentRgb},0.9)`,
          outline: "none",
          boxShadow: focused
            ? `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, 0 0 14px rgba(${accentRgb},0.08)`
            : "3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease",
          boxSizing: "border-box",
          minHeight: "48px",
          caretColor: accentColor,
        }}
      />
    </motion.div>
  );
}

function OtpBox({
  index,
  value,
  active,
  error,
  success,
  inputRef,
  onChange,
  onKeyDown,
  onFocus,
}: {
  index: number;
  value: string;
  active: boolean;
  error: boolean;
  success: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (index: number) => void;
}) {
  const borderColor = error
    ? `rgba(${RED},0.72)`
    : success
    ? `rgba(${AR},0.58)`
    : active
    ? `rgba(${AR},0.5)`
    : "rgba(122,255,200,0.14)";

  const boxShadow = error
    ? `0 0 0 1px rgba(${RED},0.14), 3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`
    : success
    ? `0 0 0 1px rgba(${AR},0.18), 0 0 16px rgba(${AR},0.1), 3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`
    : active
    ? `0 0 14px rgba(${AR},0.08), 3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`
    : `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`;

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      onKeyDown={(e) => onKeyDown(index, e)}
      onFocus={() => onFocus(index)}
      inputMode="numeric"
      autoComplete="one-time-code"
      aria-label={`otp digit ${index + 1}`}
      maxLength={1}
      style={{
        width: "100%",
        height: "52px",
        borderRadius: "10px",
        border: `1px solid ${borderColor}`,
        background: "#141418",
        color: success ? A : error ? `rgba(${RED},0.95)` : `rgba(${AR},0.9)`,
        boxShadow,
        outline: "none",
        textAlign: "center",
        fontFamily: mono,
        fontSize: "1rem",
        letterSpacing: "0.06em",
        caretColor: A,
        transition: "border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, transform 0.18s ease",
        transform: active ? "translateY(-1px)" : "translateY(0)",
      }}
    />
  );
}

function ResetCard({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [screen, setScreen] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [otpFocused, setOtpFocused] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [verifyState, setVerifyState] = useState<"idle" | "verifying">("idle");
  const [resendAt, setResendAt] = useState(() => Date.now() + 30000);
  const [resendTick, setResendTick] = useState(0);
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState<"new" | "confirm" | null>(null);
  const [passwordShake, setPasswordShake] = useState(false);
  const [passwordState, setPasswordState] = useState<"idle" | "saving">("idle");

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otpResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyRequestIdRef = useRef(0);

  const resendSeconds = useMemo(() => Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)), [resendAt, resendTick]);
  const normalizedEmail = email.trim().toLowerCase();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setResendTick((current) => current + 1);
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (screen !== 2) return;

    otpRefs.current[0]?.focus();
    setOtpFocused(0);
    setOtp(Array(6).fill(""));
    setOtpError(false);
    setOtpSuccess(false);
    setOtpShake(false);
    setVerifyState("idle");
    setResetToken("");
    setResendAt(Date.now() + 30000);
    setResendTick((current) => current + 1);
  }, [screen]);

  useEffect(() => () => {
    if (sendTimerRef.current) window.clearTimeout(sendTimerRef.current);
    if (verifyTimerRef.current) window.clearTimeout(verifyTimerRef.current);
    if (otpResetTimerRef.current) window.clearTimeout(otpResetTimerRef.current);
    if (passwordTimerRef.current) window.clearTimeout(passwordTimerRef.current);
  }, []);

  useEffect(() => {
    if (screen !== 2) return;
    if (otp.some((digit) => !digit) || verifyState !== "idle") return;

    const requestId = verifyRequestIdRef.current + 1;
    verifyRequestIdRef.current = requestId;

    if (verifyTimerRef.current) window.clearTimeout(verifyTimerRef.current);
    verifyTimerRef.current = window.setTimeout(() => {
      setVerifyState("verifying");

      void requestOtpVerification(normalizedEmail, otp.join(""))
        .then((response) => {
          if (verifyRequestIdRef.current !== requestId) {
            return;
          }

          if (!response.success || !response.resetToken) {
            throw new Error("Invalid OTP.");
          }

          setOtpError(false);
          setOtpSuccess(true);
          setResetToken(response.resetToken);
          setVerifyState("idle");

          window.setTimeout(() => setScreen(3), 220);
        })
        .catch(() => {
          if (verifyRequestIdRef.current !== requestId) {
            return;
          }

          setOtpSuccess(false);
          setOtpError(true);
          setOtpShake(true);
          setOtp(Array(6).fill(""));
          setVerifyState("idle");

          otpResetTimerRef.current = window.setTimeout(() => {
            setOtpError(false);
            setOtpShake(false);
            otpRefs.current[0]?.focus();
            setOtpFocused(0);
          }, 220);
        });
    }, 120);

    return () => {
      if (verifyTimerRef.current) window.clearTimeout(verifyTimerRef.current);
    };
  }, [normalizedEmail, otp, screen, verifyState]);

  const goToOtp = () => {
    setScreen(2);
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sendState === "sending") return;

    if (!normalizedEmail) {
      toast.error("Enter an email address first.");
      return;
    }

    setSendState("sending");

    try {
      const response = await requestForgotPassword(normalizedEmail);
      toast.success(response.message ?? "If this email exists, an OTP has been sent.");

      if (sendTimerRef.current) window.clearTimeout(sendTimerRef.current);
      sendTimerRef.current = window.setTimeout(() => {
        setSendState("sent");
        goToOtp();
      }, 180);
    } catch {
      setSendState("idle");
      toast.error("Unable to start the reset flow.");
    }
  };

  const handleOtpChange = (index: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    if (!digits) {
      setOtp((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    setOtp((current) => {
      const next = [...current];
      let cursor = index;

      for (const digit of digits) {
        if (cursor > 5) break;
        next[cursor] = digit;
        cursor += 1;
      }

      const focusIndex = Math.min(5, index + digits.length);
      window.setTimeout(() => {
        otpRefs.current[focusIndex]?.focus();
        setOtpFocused(focusIndex);
      }, 0);

      return next;
    });
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      setOtpFocused(index - 1);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || sendState === "sending" || verifyState === "verifying" || !normalizedEmail) return;

    try {
      await requestForgotPassword(normalizedEmail);
      toast.success("If this email exists, an OTP has been sent.");

      setResendAt(Date.now() + 30000);
      setResendTick((current) => current + 1);
      setOtp(Array(6).fill(""));
      setOtpError(false);
      setOtpSuccess(false);
      setOtpShake(false);
      setVerifyState("idle");
      setResetToken("");
      otpRefs.current[0]?.focus();
      setOtpFocused(0);
    } catch {
      toast.error("Unable to resend the code.");
    }
  };

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordState === "saving") return;

    if (!resetToken) {
      toast.error("Verification expired. Request a new code.");
      setPasswordShake(true);
      window.setTimeout(() => setPasswordShake(false), 260);
      return;
    }

    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordShake(true);
      window.setTimeout(() => setPasswordShake(false), 260);
      return;
    }

    setPasswordState("saving");

    try {
      const response = await requestPasswordReset(resetToken, newPassword);
      if (!response.success) {
        throw new Error("Password reset failed.");
      }

      toast.success("Password updated. Log in with your new credentials.");
      if (passwordTimerRef.current) window.clearTimeout(passwordTimerRef.current);
      passwordTimerRef.current = window.setTimeout(() => {
        onLogin();
      }, 500);
    } catch {
      setPasswordState("idle");
      setPasswordShake(true);
      window.setTimeout(() => setPasswordShake(false), 260);
      toast.error("Unable to update password.");
    }
  };

  const emailButtonLabel = sendState === "sending" ? "SENDING..." : sendState === "sent" ? "SENT ✓" : "SEND_OTP →";
  const emailButtonStyle = sendState === "sent"
    ? {
        background: `linear-gradient(135deg, rgba(81,210,140,0.22), rgba(81,210,140,0.1))`,
        border: "1px solid rgba(81,210,140,0.5)",
        color: "#b7ffd8",
        boxShadow: `0 0 24px rgba(81,210,140,0.18), 4px 4px 12px #0a0a0c, -3px -3px 8px #1e1e25`,
      }
    : sendState === "sending"
    ? {
        background: `linear-gradient(135deg, rgba(${AR},0.14), rgba(${AR},0.08))`,
        border: `1px solid rgba(${AR},0.24)`,
        color: A,
        boxShadow: `0 0 24px rgba(${AR},0.08), 4px 4px 12px #0a0a0c, -3px -3px 8px #1e1e25`,
      }
    : {
        background: `linear-gradient(135deg, rgba(${AR},0.16), rgba(${AR},0.07))`,
        border: `1px solid rgba(${AR},0.28)`,
        color: A,
        boxShadow: `0 0 24px rgba(${AR},0.1), 4px 4px 12px #0a0a0c, -3px -3px 8px #1e1e25`,
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

      <motion.div
        key={screen}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "440px",
          background: "#141418",
          borderRadius: "20px",
          padding: "clamp(28px, 6vw, 40px) clamp(24px, 6vw, 40px)",
          boxShadow: `12px 12px 28px #0a0a0c, -6px -6px 18px #1e1e25, inset 0 1px 0 rgba(${AR},0.08)`,
          border: `1px solid rgba(${AR},0.08)`,
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "22px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: share,
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: `rgba(${AR},0.55)`,
              marginBottom: "18px",
            }}
          >
            {screen === 1 ? "// RESET ACCESS" : screen === 2 ? "// VERIFY" : "// SET NEW PASSWORD"}
          </div>

          <h2
            style={{
              fontFamily: "'Russo One', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(1.6rem, 4vw, 2.1rem)",
              color: "#c8c8d0",
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {screen === 1 ? "Forgot your password?" : screen === 2 ? "Check your inbox." : "Set a new password."}
          </h2>
        </div>

        {screen === 1 && (
          <form onSubmit={handleSendOtp} noValidate style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "#707080",
                textAlign: "center",
              }}
            >
              If this email exists, an OTP&apos;s on its way. Either way, the response stays the same.
            </p>

            <AuthInput
              type="email"
              placeholder="email_"
              value={email}
              onChange={setEmail}
              onFocus={() => null}
              onBlur={() => null}
              accent="green"
              autoComplete="email"
            />

            <motion.button
              type="submit"
              whileHover={{ scale: sendState === "sending" ? 1 : 1.02 }}
              whileTap={{ scale: sendState === "sending" ? 1 : 0.97 }}
              disabled={sendState === "sending"}
              style={{
                fontFamily: syncopate,
                fontWeight: 700,
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                padding: "15px 20px",
                marginTop: "6px",
                borderRadius: "10px",
                cursor: sendState === "sending" ? "wait" : "pointer",
                minHeight: "48px",
                transition: "all 0.2s ease",
                ...emailButtonStyle,
              }}
            >
              {emailButtonLabel}
            </motion.button>
          </form>
        )}

        {screen === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <p
              style={{
                margin: 0,
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.92rem",
                lineHeight: 1.75,
                color: "#707080",
                textAlign: "center",
              }}
            >
              Enter the 6-digit code. It verifies itself on the last digit.
            </p>

            <motion.div
              animate={otpShake ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
              transition={{ duration: 0.28 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px" }}
            >
              {otp.map((value, index) => (
                <OtpBox
                  key={index}
                  index={index}
                  value={value}
                  active={otpFocused === index}
                  error={otpError}
                  success={otpSuccess}
                  inputRef={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onFocus={(digit) => setOtpFocused(digit)}
                />
              ))}
            </motion.div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: share,
                  fontSize: "0.62rem",
                  letterSpacing: "0.16em",
                  color: `rgba(${AR},0.34)`,
                }}
              >
                Didn&apos;t get it?
              </span>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendSeconds > 0 || sendState === "sending"}
                style={{
                  fontFamily: share,
                  fontSize: "0.62rem",
                  letterSpacing: "0.14em",
                  border: "none",
                  background: "transparent",
                  cursor: resendSeconds > 0 || sendState === "sending" ? "not-allowed" : "pointer",
                  color: resendSeconds > 0 || sendState === "sending" ? "rgba(122,255,200,0.22)" : `rgba(${AR},0.62)`,
                  padding: 0,
                }}
              >
                resend_otp{resendSeconds > 0 ? ` (${resendSeconds}s)` : ""}
              </button>
            </div>
          </div>
        )}

        {screen === 3 && (
          <form onSubmit={handleUpdatePassword} noValidate style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: "'Exo 2', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "#707080",
                textAlign: "center",
              }}
            >
              Pick something new, then confirm it.
            </p>

            <motion.div
              animate={passwordShake ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
              transition={{ duration: 0.28 }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <AuthInput
                type="password"
                placeholder="new_password_"
                value={newPassword}
                onChange={setNewPassword}
                onFocus={() => setPasswordFocus("new")}
                onBlur={() => setPasswordFocus(null)}
                accent={passwordFocus ? "amber" : "green"}
                autoComplete="new-password"
              />
              <AuthInput
                type="password"
                placeholder="confirm_password_"
                value={confirmPassword}
                onChange={setConfirmPassword}
                onFocus={() => setPasswordFocus("confirm")}
                onBlur={() => setPasswordFocus(null)}
                accent={passwordFocus ? "amber" : "green"}
                autoComplete="new-password"
              />
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: passwordState === "saving" ? 1 : 1.02 }}
              whileTap={{ scale: passwordState === "saving" ? 1 : 0.97 }}
              disabled={passwordState === "saving"}
              style={{
                fontFamily: syncopate,
                fontWeight: 700,
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                padding: "15px 20px",
                marginTop: "6px",
                borderRadius: "10px",
                border: `1px solid rgba(${AR},0.28)`,
                cursor: passwordState === "saving" ? "wait" : "pointer",
                background: `linear-gradient(135deg, rgba(${AR},0.16), rgba(${AR},0.07))`,
                color: A,
                boxShadow: `0 0 24px rgba(${AR},0.1), 4px 4px 12px #0a0a0c, -3px -3px 8px #1e1e25`,
                transition: "box-shadow 0.2s ease, transform 0.2s ease, background 0.2s ease",
                minHeight: "48px",
              }}
            >
              {passwordState === "saving" ? "UPDATING..." : "UPDATE_PASSWORD →"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export function ForgotPasswordPage({ onLogin }: { onLogin: () => void }) {
  return <ResetCard onLogin={onLogin} />;
}