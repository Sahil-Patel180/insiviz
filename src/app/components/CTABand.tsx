import { useRef } from "react";
import { motion, useInView } from "motion/react";

const A  = "#7affc8";
const AR = "122,255,200";
const mono  = "'JetBrains Mono', monospace";
const russo = "'Russo One', sans-serif";
const share = "'Share Tech Mono', monospace";

const PARTICLE_CHARS = ["█", "▓", "▒", "░", "◆", "◇", "▸", "▹", "●", "○", "×", "·"];
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  char: PARTICLE_CHARS[i % PARTICLE_CHARS.length],
  startX: (Math.random() - 0.5) * 600,
  startY: (Math.random() - 0.5) * 200,
  opacity: 0.12 + Math.random() * 0.2,
}));

interface CTABandProps {
  headline: React.ReactNode;
  buttonText: string;
  label?: string;
}

export function CTABand({ headline, buttonText, label = "// GET STARTED" }: CTABandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative w-full py-20 px-6 overflow-hidden flex flex-col items-center text-center"
      style={{
        background: "linear-gradient(160deg, #0f0f12 0%, #0d120f 50%, #0f0f12 100%)",
        borderTop: `1px solid rgba(${AR},0.06)`,
      }}
    >
      {/* ASCII particles converging toward button */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            fontFamily: mono,
            fontSize: "0.9rem",
            color: A,
            pointerEvents: "none",
            zIndex: 0,
          }}
          initial={{ x: p.startX, y: p.startY, opacity: p.opacity }}
          animate={
            isInView
              ? { x: 0, y: 0, opacity: 0 }
              : { x: p.startX, y: p.startY, opacity: p.opacity }
          }
          transition={{ delay: i * 0.06, duration: 1.1, ease: "easeIn" }}
        >
          {p.char}
        </motion.span>
      ))}

      <div
        className="relative z-10 flex flex-col items-center gap-8"
        style={{ maxWidth: "640px" }}
      >
        <div
          style={{
            fontFamily: share,
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: `rgba(${AR},0.45)`,
          }}
        >
          {label}
        </div>

        <h2
          style={{
            fontFamily: russo,
            fontWeight: 400,
            fontSize: "clamp(1.9rem, 4.5vw, 3.4rem)",
            letterSpacing: "0.02em",
            color: "#c8c8d0",
            lineHeight: 1.1,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {headline}
        </h2>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontFamily: "'Syncopate', sans-serif",
            fontWeight: 700,
            fontSize: "0.62rem",
            letterSpacing: "0.2em",
            padding: "16px 40px",
            borderRadius: "12px",
            border: `1px solid rgba(${AR},0.3)`,
            cursor: "pointer",
            background: `linear-gradient(135deg, rgba(${AR},0.18) 0%, rgba(${AR},0.08) 100%)`,
            color: A,
            boxShadow: `0 0 36px rgba(${AR},0.15), 5px 5px 16px #0a0a0c, -3px -3px 10px #1e1e25`,
            transition: "box-shadow 0.22s ease",
          }}
        >
          {buttonText}
        </motion.button>
      </div>
    </section>
  );
}
