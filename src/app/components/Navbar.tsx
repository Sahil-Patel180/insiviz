import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "motion/react";

const NAV_LINKS = ["Home", "Services", "About", "Blog"];

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const active  = activePage;
  const setActive = onNavigate;
  const [hovered, setHovered]   = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // pill geometry for the sliding indicator
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navRef   = useRef<HTMLDivElement>(null);

  // recalculate pill position whenever active changes
  useLayoutEffect(() => {
    const el = itemRefs.current[active];
    const nav = navRef.current;
    if (!el || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    setPillStyle({
      left:  elRect.left - navRect.left,
      width: elRect.width,
    });
  }, [active]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between"
      style={{
        background: "rgba(13,13,15,0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(122,255,200,0.07)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          background: "#141418",
          borderRadius: "12px",
          padding: "8px 20px",
          boxShadow: "6px 6px 14px #0a0a0c, -4px -4px 10px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.08)",
          border: "1px solid rgba(122,255,200,0.06)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "0.06em",
            color: "#7affc8",
            textShadow: "0 0 18px rgba(122,255,200,0.4)",
          }}
        >
          INSI<span style={{ color: "#606070", fontWeight: 400 }}>VIZ</span>
        </span>
      </div>

      {/* Center nav — sliding pill + per-button hover glow */}
      <div
        ref={navRef}
        className="hidden md:flex items-center gap-1 relative"
        style={{
          background: "#141418",
          borderRadius: "14px",
          padding: "6px 10px",
          boxShadow: "5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.05)",
          border: "1px solid rgba(122,255,200,0.05)",
        }}
      >
        {/* sliding active pill — animates between buttons */}
        {pillStyle.width > 0 && (
          <motion.div
            aria-hidden
            animate={{ left: pillStyle.left, width: pillStyle.width }}
            transition={{ type: "spring", stiffness: 380, damping: 34, mass: 0.8 }}
            style={{
              position: "absolute",
              top: 6,
              height: "calc(100% - 12px)",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1a1a20 0%, #141418 100%)",
              boxShadow: "3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, inset 0 1px 0 rgba(122,255,200,0.12)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {NAV_LINKS.map((link) => {
          const isActive  = active === link;
          const isHovered = hovered === link;

          return (
            <button
              key={link}
              ref={(el) => { itemRefs.current[link] = el; }}
              onClick={() => setActive(link)}
              onMouseEnter={() => setHovered(link)}
              onMouseLeave={() => setHovered(null)}
              style={{
                fontFamily: "'Syncopate', sans-serif",
                fontWeight: 700,
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                padding: "7px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
                transition: "color 0.18s ease, text-shadow 0.18s ease, opacity 0.18s ease",
                background: "transparent",
                color: isActive
                  ? "#7affc8"
                  : isHovered
                  ? "#a0a0b0"
                  : "#606070",
                opacity: isActive ? 1 : isHovered ? 0.85 : 0.55,
                textShadow: isActive
                  ? "0 0 14px rgba(122,255,200,0.45)"
                  : isHovered
                  ? "0 0 8px rgba(160,160,176,0.2)"
                  : "none",
              }}
            >
              {/* hover glow ring */}
              {isHovered && !isActive && (
                <motion.span
                  layoutId="hover-ring"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "10px",
                    border: "1px solid rgba(122,255,200,0.12)",
                    background: "rgba(122,255,200,0.04)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {link}
            </button>
          );
        })}
      </div>

      {/* Login — hidden on the login page itself */}
      <div className={`hidden md:block ${activePage === "Login" ? "invisible pointer-events-none" : ""}`}>
        <button
          onClick={() => setActive("Login")}
          onMouseEnter={(e) => {
            const b = e.currentTarget;
            b.style.boxShadow = "3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, 0 0 20px rgba(122,255,200,0.1)";
            b.style.color = "#9effd8";
            b.style.borderColor = "rgba(122,255,200,0.3)";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget;
            b.style.boxShadow = "5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25";
            b.style.color = "#7affc8";
            b.style.borderColor = "rgba(122,255,200,0.15)";
          }}
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.78rem",
            letterSpacing: "0.18em",
            padding: "9px 22px",
            borderRadius: "12px",
            border: "1px solid rgba(122,255,200,0.15)",
            cursor: "pointer",
            background: "#141418",
            color: "#7affc8",
            boxShadow: "5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25",
            transition: "color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
            textShadow: "0 0 10px rgba(122,255,200,0.25)",
          }}
        >
          LOGIN_
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: "#141418",
          borderRadius: "8px",
          border: "1px solid rgba(122,255,200,0.06)",
          boxShadow: "3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25",
          cursor: "pointer",
        }}
        aria-label="Toggle menu"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: "20px",
              height: "2px",
              background: "#7affc8",
              borderRadius: "1px",
              transition: "transform 0.22s ease, opacity 0.18s ease",
              opacity: menuOpen && i === 1 ? 0 : 1,
              transform:
                menuOpen && i === 0 ? "translateY(8px) rotate(45deg)"
                : menuOpen && i === 2 ? "translateY(-8px) rotate(-45deg)"
                : "none",
            }}
          />
        ))}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 flex flex-col gap-1 p-4 md:hidden"
          style={{
            background: "rgba(13,13,15,0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(122,255,200,0.07)",
          }}
        >
          {[...NAV_LINKS, "Login"].filter((link) =>
            !(link === "Login" && activePage === "Login")
          ).map((link) => (
            <button
              key={link}
              onClick={() => {
                setActive(link);
                setMenuOpen(false);
              }}
              style={{
                fontFamily: "'Syncopate', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                transition: "color 0.18s ease, background 0.18s ease",
                background: active === link ? "#141418" : "transparent",
                color: active === link ? "#7affc8" : "#606070",
                boxShadow: active === link ? "3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25" : "none",
              }}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
