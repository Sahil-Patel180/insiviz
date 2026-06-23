import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { AsciiBackground } from "./AsciiBackground";
import { Footer } from "./Footer";

const A  = "#7affc8";
const AR = "122,255,200";

const share = "'Share Tech Mono', monospace";
const russo = "'Russo One', sans-serif";
const teko  = "'Teko', sans-serif";
const exo   = "'Exo 2', sans-serif";

// ─── category config ─────────────────────────────────────────────────────────
const CAT_RGB: Record<string, string> = {
  Visualization:     "122,255,200",
  Engineering:       "100,180,255",
  "Case Studies":    "255,185,100",
  "Product Updates": "180,100,255",
};
const CAT_HEX: Record<string, string> = {
  Visualization:     "#7affc8",
  Engineering:       "#64b4ff",
  "Case Studies":    "#ffb964",
  "Product Updates": "#b464ff",
};
const CATEGORIES = ["All", "Engineering", "Visualization", "Case Studies", "Product Updates"];

// ─── post data ────────────────────────────────────────────────────────────────
interface Post {
  id: number;
  title: string;
  excerpt: string;
  category: keyof typeof CAT_RGB;
  date: string;
  readTime: string;
  featured?: boolean;
}

const POSTS: Post[] = [
  {
    id: 1,
    title: "Why your bar chart is lying to you",
    excerpt: "The most common viz mistake isn't picking the wrong chart — it's pairing the wrong axes. Here's how the validation engine catches it before you ship.",
    category: "Visualization",
    date: "Jun 12, 2026",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: 2,
    title: "Inside the validation engine",
    excerpt: "A technical walkthrough of how InsiViz scores chart-axis combinations for statistical validity.",
    category: "Engineering",
    date: "Jun 5, 2026",
    readTime: "9 min read",
  },
  {
    id: 3,
    title: "Schema-aware viz: what changes when types get messy",
    excerpt: "Real datasets have mixed types, nulls, and ambiguous columns. Our approach to handling that without breaking.",
    category: "Engineering",
    date: "May 28, 2026",
    readTime: "7 min read",
  },
  {
    id: 4,
    title: "A dashboard rebuild, start to finish",
    excerpt: "We ran InsiViz on a live SaaS dashboard. Here's what it caught, what it replaced, and what we learned.",
    category: "Case Studies",
    date: "May 19, 2026",
    readTime: "11 min read",
  },
  {
    id: 5,
    title: "When the model says no: understanding filtered combos",
    excerpt: "Not every pairing gets through validation. What the Logic Filter catches and why it matters.",
    category: "Visualization",
    date: "May 10, 2026",
    readTime: "5 min read",
  },
  {
    id: 6,
    title: "V2 release notes",
    excerpt: "What changed in V2: faster schema parsing, expanded chart type support, and the new confidence scoring API.",
    category: "Product Updates",
    date: "Apr 30, 2026",
    readTime: "4 min read",
  },
  {
    id: 7,
    title: "Fine-tuning on your own data: a field guide",
    excerpt: "How to prepare domain samples, set confidence thresholds, and get the most out of custom model training.",
    category: "Engineering",
    date: "Apr 18, 2026",
    readTime: "8 min read",
  },
  {
    id: 8,
    title: "The cost of a wrong pivot table",
    excerpt: "A case study in how one misleading aggregation cascaded into six weeks of bad product decisions.",
    category: "Case Studies",
    date: "Apr 5, 2026",
    readTime: "6 min read",
  },
  {
    id: 9,
    title: "Understanding confidence thresholds in viz validation",
    excerpt: "How to tune the validation engine's strictness for your domain without throwing away useful combos.",
    category: "Engineering",
    date: "Mar 22, 2026",
    readTime: "7 min read",
  },
  {
    id: 10,
    title: "Roadmap: what's next for InsiViz",
    excerpt: "Multi-dataset correlation, real-time stream validation, and the dashboard SDK. What we're building next.",
    category: "Product Updates",
    date: "Mar 10, 2026",
    readTime: "4 min read",
  },
];

const GRID_INITIAL = 6;

// ─── ASCII thumbnail canvas ───────────────────────────────────────────────────
const ASCII_CHARS = " .·:+*░▒▓█◆";

function AsciiThumbnail({
  seed,
  colorRgb,
  hovered,
  height = 160,
}: {
  seed: number;
  colorRgb: string;
  hovered: boolean;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const frozenT   = useRef(seed * 1.6);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CW = 9, CH = 13;
    const cols = Math.ceil(canvas.width / CW);
    const rows = Math.ceil(canvas.height / CH);

    const render = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CH - 1}px 'JetBrains Mono', monospace`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;
          const ny = r / rows;
          const raw =
            Math.sin(nx * 9 + t * 0.38 + seed)   * 0.32 +
            Math.cos(ny * 7 - t * 0.26 + seed * 2.1) * 0.32 +
            Math.sin((nx + ny) * 5 + t * 0.18)    * 0.18 +
            0.5;
          const v = Math.max(0, Math.min(1, raw));
          const ci = Math.floor(v * (ASCII_CHARS.length - 1));
          const alpha = (v * 0.55 + 0.06).toFixed(2);
          ctx.fillStyle = `rgba(${colorRgb},${alpha})`;
          ctx.fillText(ASCII_CHARS[ci], c * CW, r * CH + CH);
        }
      }
    };

    cancelAnimationFrame(animRef.current);
    if (hovered) {
      const loop = (ts: number) => {
        frozenT.current = ts / 1000 + seed * 0.5;
        render(frozenT.current);
        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
    } else {
      render(frozenT.current);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [hovered, seed, colorRgb]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={height}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── 1. HERO ─────────────────────────────────────────────────────────────────
function BlogHero({
  onHome,
  search,
  onSearch,
}: {
  onHome: () => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight: "52vh", paddingTop: "72px", background: "#0d0d0f" }}
    >
      <div className="absolute inset-0" style={{ opacity: 0.13 }}>
        <AsciiBackground />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 30%, rgba(13,13,15,0.84) 80%, #0d0d0f 100%)",
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 text-center px-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        {/* breadcrumb */}
        <div style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.22em", color: `rgba(${AR},0.35)` }}>
          <span
            style={{ cursor: "pointer", transition: "color 0.18s" }}
            onClick={onHome}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = A)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.35)`)}
          >
            home_
          </span>
          {"  /  "}
          <span style={{ color: `rgba(${AR},0.65)` }}>blog_</span>
        </div>

        {/* badge */}
        <div style={{
          fontFamily: share, fontSize: "0.68rem", letterSpacing: "0.32em",
          color: `rgba(${AR},0.65)`, background: `rgba(${AR},0.05)`,
          border: `1px solid rgba(${AR},0.16)`, padding: "6px 20px", borderRadius: "999px",
        }}>
          // BLOG
        </div>

        <h1 style={{
          fontFamily: russo, fontWeight: 400,
          fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
          letterSpacing: "0.02em", color: "#c8c8d0",
          lineHeight: 1.05, textTransform: "uppercase", margin: 0, maxWidth: "680px",
        }}>
          Notes from the{" "}
          <span style={{ color: A, textShadow: `0 0 28px rgba(${AR},0.3)` }}>
            validation layer.
          </span>
        </h1>

        <p style={{
          fontFamily: exo, fontWeight: 300, fontStyle: "italic",
          fontSize: "clamp(0.88rem, 1.8vw, 1rem)", color: "#606070", margin: 0, maxWidth: "500px",
        }}>
          Writing on visualization logic, model decisions, and the charts that almost shipped wrong.
        </p>

        {/* search */}
        <div style={{ position: "relative", marginTop: "4px" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            fontFamily: share, fontSize: "0.65rem", color: `rgba(${AR},0.35)`, pointerEvents: "none",
          }}>
            &gt;
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="search_posts..."
            style={{
              fontFamily: share, fontSize: "0.72rem", letterSpacing: "0.1em",
              padding: "10px 16px 10px 28px",
              background: "#141418",
              border: `1px solid rgba(${AR},0.12)`,
              borderRadius: "10px",
              color: `rgba(${AR},0.8)`,
              outline: "none",
              width: "260px",
              boxShadow: `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`,
              transition: "border-color 0.18s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(${AR},0.35)`)}
            onBlur={(e) => (e.currentTarget.style.borderColor = `rgba(${AR},0.12)`)}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ─── 2. FEATURED POST ────────────────────────────────────────────────────────
function FeaturedPost({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);
  const colorRgb = CAT_RGB[post.category] ?? AR;
  const colorHex = CAT_HEX[post.category] ?? A;

  return (
    <section className="w-full px-6 pt-14 pb-6" style={{ background: "#0d0d0f" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div style={{ width: "32px", height: "1px", background: `rgba(${AR},0.4)` }} />
          <span style={{ fontFamily: share, fontSize: "0.7rem", letterSpacing: "0.3em", color: `rgba(${AR},0.5)` }}>
            // FEATURED
          </span>
        </div>

        <motion.article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.22 }}
          style={{
            background: "#141418",
            borderRadius: "18px",
            border: `1px solid rgba(${AR},0.08)`,
            boxShadow: hovered
              ? `10px 10px 28px #0a0a0c, -5px -5px 16px #1e1e25, 0 0 32px rgba(${AR},0.06)`
              : `8px 8px 22px #0a0a0c, -4px -4px 14px #1e1e25`,
            overflow: "hidden",
            cursor: "pointer",
            transition: "box-shadow 0.22s ease",
          }}
        >
          {/* thumbnail */}
          <div style={{ height: "220px", overflow: "hidden" }}>
            <AsciiThumbnail seed={post.id} colorRgb={colorRgb} hovered={hovered} height={220} />
          </div>

          {/* content */}
          <div style={{ padding: "28px 32px" }}>
            <div className="flex items-center gap-3 mb-4">
              <span style={{
                fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.2em",
                color: colorHex, background: `rgba(${colorRgb},0.08)`,
                border: `1px solid rgba(${colorRgb},0.2)`,
                borderRadius: "6px", padding: "4px 10px",
              }}>
                {post.category}
              </span>
              <span style={{ fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.15em", color: `rgba(${AR},0.3)` }}>
                {post.date}  ·  {post.readTime}
              </span>
            </div>
            <h2 style={{
              fontFamily: teko, fontWeight: 500,
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.06em", color: "#c8c8d0",
              textTransform: "uppercase", lineHeight: 1.05, marginBottom: "12px",
            }}>
              {post.title}
            </h2>
            <p style={{
              fontFamily: exo, fontWeight: 300, fontSize: "0.9rem",
              color: "#606070", lineHeight: 1.75, margin: 0, maxWidth: "600px",
            }}>
              {post.excerpt}
            </p>
            <div style={{ marginTop: "20px" }}>
              <span style={{
                fontFamily: share, fontSize: "0.65rem", letterSpacing: "0.2em",
                color: A, cursor: "pointer",
              }}>
                READ_POST →
              </span>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

// ─── 3+4. CATEGORY FILTER + POST GRID ────────────────────────────────────────
function PostCard({ post, index }: { post: Post; index: number }) {
  const [hovered, setHovered] = useState(false);
  const colorRgb = CAT_RGB[post.category] ?? AR;
  const colorHex = CAT_HEX[post.category] ?? A;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#141418",
        borderRadius: "14px",
        border: `1px solid rgba(${AR},0.06)`,
        boxShadow: hovered
          ? `8px 8px 20px #0a0a0c, -4px -4px 12px #1e1e25, 0 0 22px rgba(${AR},0.05), inset 0 1px 0 rgba(${AR},0.08)`
          : `6px 6px 16px #0a0a0c, -3px -3px 10px #1e1e25, inset 0 1px 0 rgba(${AR},0.04)`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* thumbnail */}
      <div style={{ height: "120px", flexShrink: 0, overflow: "hidden" }}>
        <AsciiThumbnail seed={post.id} colorRgb={colorRgb} hovered={hovered} height={120} />
      </div>

      {/* content */}
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="flex items-center gap-2 mb-3">
          <span style={{
            fontFamily: share, fontSize: "0.58rem", letterSpacing: "0.18em",
            color: colorHex, background: `rgba(${colorRgb},0.08)`,
            border: `1px solid rgba(${colorRgb},0.18)`,
            borderRadius: "5px", padding: "3px 8px",
          }}>
            {post.category}
          </span>
        </div>
        <h3 style={{
          fontFamily: teko, fontWeight: 500,
          fontSize: "1.2rem", letterSpacing: "0.08em",
          color: "#c8c8d0", textTransform: "uppercase",
          lineHeight: 1.05, marginBottom: "8px",
        }}>
          {post.title}
        </h3>
        <p style={{
          fontFamily: exo, fontWeight: 300, fontSize: "0.78rem",
          color: "#606070", lineHeight: 1.65, flex: 1,
          margin: 0, marginBottom: "14px",
        }}>
          {post.excerpt}
        </p>
        <div style={{
          fontFamily: share, fontSize: "0.58rem", letterSpacing: "0.14em",
          color: `rgba(${AR},0.3)`, borderTop: `1px solid rgba(${AR},0.06)`,
          paddingTop: "12px",
        }}>
          {post.date}  ·  {post.readTime}
        </div>
      </div>
    </motion.article>
  );
}

function FilterAndGrid({
  search,
  onCategoryChange,
}: {
  search: string;
  onCategoryChange?: (cat: string) => void;
}) {
  const [selected, setSelected] = useState("All");
  const [visible, setVisible] = useState(GRID_INITIAL);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ref = useRef<HTMLDivElement>(null);

  // measure sliding underline
  useLayoutEffect(() => {
    const el = itemRefs.current[selected];
    const container = containerRef.current;
    if (!el || !container) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setIndicator({ left: eRect.left - cRect.left, width: eRect.width });
  }, [selected]);

  const nonFeatured = POSTS.filter((p) => !p.featured);

  const filtered = nonFeatured.filter((p) => {
    const matchCat = selected === "All" || p.category === selected;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const handleSelect = (cat: string) => {
    setSelected(cat);
    setVisible(GRID_INITIAL);
    onCategoryChange?.(cat);
  };

  return (
    <section ref={ref} className="w-full px-6 pb-16" style={{ background: "#0d0d0f" }}>
      <div className="max-w-5xl mx-auto">

        {/* category filter */}
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <div style={{ width: "32px", height: "1px", background: `rgba(${AR},0.4)`, flexShrink: 0 }} />
          <div
            ref={containerRef}
            className="relative flex items-center gap-1 flex-wrap"
          >
            {/* sliding underline indicator */}
            {indicator.width > 0 && (
              <motion.div
                animate={{ left: indicator.left, width: indicator.width }}
                transition={{ type: "spring", stiffness: 400, damping: 36, mass: 0.7 }}
                style={{
                  position: "absolute",
                  bottom: -4,
                  height: "2px",
                  background: `linear-gradient(90deg, ${A}, rgba(${AR},0.3))`,
                  borderRadius: "1px",
                  boxShadow: `0 0 8px rgba(${AR},0.5)`,
                  pointerEvents: "none",
                }}
              />
            )}

            {CATEGORIES.map((cat) => {
              const isActive = selected === cat;
              return (
                <button
                  key={cat}
                  ref={(el) => { itemRefs.current[cat] = el; }}
                  onClick={() => handleSelect(cat)}
                  style={{
                    fontFamily: share,
                    fontSize: "0.65rem",
                    letterSpacing: "0.16em",
                    padding: "7px 16px",
                    borderRadius: "999px",
                    border: `1px solid ${isActive ? `rgba(${AR},0.22)` : `rgba(${AR},0.07)`}`,
                    background: isActive ? "#141418" : "transparent",
                    color: isActive ? A : `rgba(${AR},0.45)`,
                    cursor: "pointer",
                    boxShadow: isActive
                      ? `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25, inset 0 1px 0 rgba(${AR},0.08)`
                      : "none",
                    transition: "all 0.18s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.7)`;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.45)`;
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* grid — keyed by selected+search so cards remount on filter change */}
        {shown.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selected}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {shown.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{
            fontFamily: share, fontSize: "0.7rem", letterSpacing: "0.2em",
            color: `rgba(${AR},0.3)`, padding: "3rem 0", textAlign: "center",
          }}>
            // NO_POSTS_FOUND
          </div>
        )}

        {/* load more */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVisible((v) => v + 3)}
              style={{
                fontFamily: share,
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                padding: "12px 30px",
                borderRadius: "10px",
                border: `1px solid rgba(${AR},0.15)`,
                background: "#141418",
                color: `rgba(${AR},0.65)`,
                cursor: "pointer",
                boxShadow: `4px 4px 10px #0a0a0c, -3px -3px 8px #1e1e25`,
                transition: "color 0.18s, border-color 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = A;
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${AR},0.3)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = `rgba(${AR},0.65)`;
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${AR},0.15)`;
              }}
            >
              LOAD MORE POSTS →
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 5. NEWSLETTER BAND ──────────────────────────────────────────────────────
function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section
      className="w-full py-16 px-6"
      style={{
        background: "linear-gradient(160deg, #0f0f12 0%, #0d120f 50%, #0f0f12 100%)",
        borderTop: `1px solid rgba(${AR},0.06)`,
      }}
    >
      <div className="max-w-xl mx-auto flex flex-col items-center gap-6 text-center">
        <div style={{ fontFamily: share, fontSize: "0.65rem", letterSpacing: "0.3em", color: `rgba(${AR},0.45)` }}>
          // STAY IN THE LOOP
        </div>

        <h2 style={{
          fontFamily: russo, fontWeight: 400,
          fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)",
          letterSpacing: "0.02em", color: "#c8c8d0",
          textTransform: "uppercase", lineHeight: 1.1, margin: 0,
        }}>
          Get the next post{" "}
          <span style={{ color: A }}>before it's indexed.</span>
        </h2>

        <p style={{
          fontFamily: exo, fontWeight: 300, fontStyle: "italic",
          fontSize: "0.88rem", color: "#606070", margin: 0,
        }}>
          No cadence promises. One post when it's ready.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 w-full"
            style={{ maxWidth: "440px" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                fontFamily: share, fontSize: "0.72rem", letterSpacing: "0.08em",
                padding: "12px 16px", flex: 1,
                background: "#141418",
                border: `1px solid rgba(${AR},0.12)`,
                borderRadius: "10px",
                color: `rgba(${AR},0.8)`,
                outline: "none",
                boxShadow: `3px 3px 8px #0a0a0c, -2px -2px 6px #1e1e25`,
                transition: "border-color 0.18s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = `rgba(${AR},0.35)`)}
              onBlur={(e) => (e.currentTarget.style.borderColor = `rgba(${AR},0.12)`)}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: "'Syncopate', sans-serif",
                fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.18em",
                padding: "12px 22px", borderRadius: "10px",
                border: `1px solid rgba(${AR},0.28)`,
                background: `linear-gradient(135deg, rgba(${AR},0.16), rgba(${AR},0.07))`,
                color: A, cursor: "pointer",
                boxShadow: `0 0 20px rgba(${AR},0.1), 3px 3px 10px #0a0a0c, -2px -2px 7px #1e1e25`,
                whiteSpace: "nowrap",
              }}
            >
              SUBSCRIBE
            </motion.button>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: share, fontSize: "0.7rem", letterSpacing: "0.2em",
              color: A, padding: "12px 24px",
              background: `rgba(${AR},0.05)`,
              border: `1px solid rgba(${AR},0.18)`,
              borderRadius: "10px",
            }}
          >
            ✓ YOU'RE IN. NEXT POST LANDS IN YOUR INBOX.
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function BlogPage({ onHome }: { onHome: () => void }) {
  const [search, setSearch] = useState("");
  const featured = POSTS.find((p) => p.featured)!;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div style={{ background: "#0d0d0f" }}>
      <BlogHero onHome={onHome} search={search} onSearch={setSearch} />
      {!search && <FeaturedPost post={featured} />}
      <FilterAndGrid search={search} />
      <NewsletterBand />
      <Footer />
    </div>
  );
}
