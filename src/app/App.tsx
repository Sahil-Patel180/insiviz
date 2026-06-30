import { useState, useEffect } from "react";
import { AsciiBackground } from "./components/AsciiBackground";
import { AsciiChart } from "./components/AsciiChart";
import { Navbar } from "./components/Navbar";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { ServicesPage } from "./components/ServicesPage";
import { PricingPage } from "./components/PricingPage";
import { AboutPage } from "./components/AboutPage";
import { BlogPage } from "./components/BlogPage";
import { LoginPage } from "./components/LoginPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { RequestAccessPage } from "./components/RequestAccessPage";
import { DailyDeckPage } from "./components/DailyDeckPage";
import { DataDeckPage } from "./components/DataDeckPage";
import { DashboardPage } from "./components/DashboardPage";
import { getCurrentProfile, signOut, type Profile } from "./lib/auth";

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [accessCtx, setAccessCtx] = useState<{ planId: "perviz" | "orgviz"; billing: "monthly" | "annual" } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getCurrentProfile().then((p) => {
      if (p) {
        setProfile(p);
        setActivePage("DailyDeck");
      }
    });
  }, []);

  const goToRequestAccess = (ctx?: { planId: "perviz" | "orgviz"; billing: "monthly" | "annual" }) => {
    setAccessCtx(ctx ?? null);
    setActivePage("RequestAccess");
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#0d0d0f", overflowX: "hidden" }}
    >
      <Toaster richColors closeButton position="top-center" />
      {activePage !== "Dashboard" && activePage !== "DailyDeck" && (
        <Navbar activePage={activePage} onNavigate={setActivePage} />
      )}

      {activePage === "Services" && (
        <ServicesPage onHome={() => setActivePage("Home")} />
      )}

      {activePage === "Pricing" && (
        <PricingPage onHome={() => setActivePage("Home")} onRequestAccess={goToRequestAccess} />
      )}

      {activePage === "RequestAccess" && (
        <RequestAccessPage
          initialPlan={accessCtx}
          onHome={() => setActivePage("Home")}
          onBackToPricing={() => setActivePage("Pricing")} />
      )}

      {activePage === "About" && (
        <AboutPage onHome={() => setActivePage("Home")} />
      )}

      {activePage === "Blog" && (
        <BlogPage onHome={() => setActivePage("Home")} />
      )}

      {activePage === "Login" && (
        <LoginPage
          onHome={() => setActivePage("Home")}
          onForgotPassword={() => setActivePage("ForgotPassword")}
          onLoginSuccess={(p) => {
            setProfile(p);
            setActivePage("DailyDeck");
          }}
        />
      )}

      {activePage === "ForgotPassword" && (
        <ForgotPasswordPage
          onLogin={() => setActivePage("Login")}
        />
      )}

      {activePage === "DailyDeck" && (
        <DailyDeckPage
          profile={profile}
          onNavigate={setActivePage}
          onLogout={async () => {
            await signOut();
            setProfile(null);
            setActivePage("Home");
          }}
        />
      )}

      {activePage === "DataDeck" && (
        <DataDeckPage
          profile={profile}
          onNavigate={setActivePage}
          onLogout={async () => {
            await signOut();
            setProfile(null);
            setActivePage("Home");
          }}
        />
      )}

      {activePage === "Dashboard" && (
        <DashboardPage
          profile={profile}
          onNavigate={setActivePage}
          onLogout={async () => {
            await signOut();
            setProfile(null);
            setActivePage("Home");
          }}
        />
      )}

      {activePage !== "Services" && activePage !== "Pricing" && activePage !== "About" && activePage !== "Blog" && activePage !== "Login" && activePage !== "ForgotPassword" && activePage !== "RequestAccess" && activePage !== "DailyDeck" && activePage !== "DataDeck" && activePage !== "Dashboard" && <>

      {/* ── HERO SECTION ── */}
      <section
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", paddingTop: "42px" }}
      >
        <AsciiBackground />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, rgba(13,13,15,0.65) 70%, #0d0d0f 100%)",
          }}
        />

        <div
          className="relative z-10 w-full flex items-center justify-center px-4"
          style={{ minHeight: "calc(100vh - 72px)" }}
        >
          <AsciiChart bare />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "rgba(13,13,15,0.52)",
              backdropFilter: "blur(6px) saturate(1.4)",
              WebkitBackdropFilter: "blur(6px) saturate(1.4)",
            }}
          />

          <div
            className="relative flex flex-col items-center gap-8 text-center"
            style={{
              maxWidth: "860px",
              width: "100%",
              padding: "clamp(2.5rem, 5vw, 4.5rem) clamp(2rem, 6vw, 5rem)",
            }}
          >
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.32em",
                color: "rgba(122,255,200,0.55)",
                background: "rgba(122,255,200,0.04)",
                border: "1px solid rgba(122,255,200,0.12)",
                padding: "6px 20px",
                borderRadius: "999px",
              }}
            >
              // AI-POWERED CHART INTELLIGENCE
            </div>

            <h1
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 7vw, 5.8rem)",
                letterSpacing: "0.02em",
                color: "#c8c8d0",
                lineHeight: 1.05,
                maxWidth: "820px",
                textTransform: "uppercase",
              }}
            >
              See the signal
              <br />
              <span
                style={{
                  color: "#7affc8",
                  textShadow: "0 0 40px rgba(122,255,200,0.35)",
                }}
              >
                inside the noise
              </span>
            </h1>

            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: "clamp(0.88rem, 2vw, 1.08rem)",
                color: "#606070",
                maxWidth: "520px",
                lineHeight: 1.8,
              }}
            >
              InsiViz scans your dataset and surfaces every logical, legit visualization
              combination — no guesswork, no wrong charts, no wasted dashboard cycles.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                style={{
                  fontFamily: "'Syncopate', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  border: "1px solid rgba(122,255,200,0.22)",
                  cursor: "pointer",
                  background: "linear-gradient(135deg, rgba(122,255,200,0.15) 0%, rgba(122,255,200,0.08) 100%)",
                  color: "#7affc8",
                  boxShadow:
                    "0 0 30px rgba(122,255,200,0.12), 5px 5px 14px #0a0a0c, -3px -3px 8px #1e1e25",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, rgba(122,255,200,0.22) 0%, rgba(122,255,200,0.12) 100%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 40px rgba(122,255,200,0.2), 5px 5px 14px #0a0a0c, -3px -3px 8px #1e1e25";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, rgba(122,255,200,0.15) 0%, rgba(122,255,200,0.08) 100%)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 30px rgba(122,255,200,0.12), 5px 5px 14px #0a0a0c, -3px -3px 8px #1e1e25";
                }}
              >
                Get Started Free
              </button>
              <button
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.74rem",
                  letterSpacing: "0.18em",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  border: "1px solid rgba(122,255,200,0.08)",
                  cursor: "pointer",
                  background: "#141418",
                  color: "#606070",
                  boxShadow: "5px 5px 12px #0a0a0c, -3px -3px 8px #1e1e25",
                  transition: "all 0.22s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#c8c8d0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#606070";
                }}
              >
                VIEW_DEMO
              </button>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.28em",
            color: "rgba(122,255,200,0.25)",
          }}
        >
          <span>SCROLL</span>
          <span className="animate-bounce">▼</span>
        </div>
      </section>

      {/* ── SERVICES SECTION ── */}
      <ServicesSection />

      {/* ── ABOUT SECTION ── */}
      <AboutSection />

      <Footer />

      </>}
    </div>
  );
}