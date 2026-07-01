import { useState } from "react";
import {
  Plus, Search, Pencil, Check, X, Link2,
  LayoutGrid, Folder, ChevronDown, Eye, Pencil as EditIcon,
} from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const mono  = "'JetBrains Mono', monospace";
const syn   = "'Syncopate', sans-serif";

// ── types ─────────────────────────────────────────────────────────────────

type Widget = {
  id: string;
  title: string;
  chartLabel: string;
  color: string;
  x: number; y: number; w: number; h: number;
  linkPageId: string | null; // "button action" → redirects to another page
};

type Page = {
  id: string;
  number: number;
  name: string;
  widgets: Widget[];
};

type DashProject = {
  id: string;
  name: string;
  pages: Page[];
};

// dummy palette for widget placeholders
const WIDGET_COLORS = ["#7affc8", "#378ADD", "#EF9F27", "#ED93B1", "#AFA9EC", "#5DCAA5"];

function makePage(number: number): Page {
  return { id: crypto.randomUUID(), number, name: `Page ${number}`, widgets: [] };
}

export function DashboardPage({
  profile,
  onLogout,
  onNavigate,
}: {
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const [projects, setProjects]           = useState<DashProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activePageId, setActivePageId]   = useState<string | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName]   = useState("");
  const [renamingPageId, setRenamingPageId]   = useState<string | null>(null);
  const [renameValue, setRenameValue]         = useState("");
  const [vizSearch, setVizSearch]             = useState("");
  const [previewMode, setPreviewMode]         = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;
  const activePage    = activeProject?.pages.find((pg) => pg.id === activePageId) ?? null;

  // ── project actions ──

  const createProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const firstPage = makePage(1);
    const proj: DashProject = { id: crypto.randomUUID(), name, pages: [firstPage] };
    setProjects((prev) => [...prev, proj]);
    setActiveProjectId(proj.id);
    setActivePageId(firstPage.id);
    setNewProjectName("");
    setCreatingProject(false);
  };

  const selectProject = (id: string) => {
    setActiveProjectId(id);
    const proj = projects.find((p) => p.id === id);
    setActivePageId(proj?.pages[0]?.id ?? null);
  };

  // ── page actions ──

  const addPage = () => {
    if (!activeProject) return;
    const nextNumber = activeProject.pages.length + 1;
    const newPage = makePage(nextNumber);
    setProjects((prev) =>
      prev.map((p) => p.id === activeProject.id ? { ...p, pages: [...p.pages, newPage] } : p)
    );
    setActivePageId(newPage.id);
  };

  const startRename = (page: Page) => {
    setRenamingPageId(page.id);
    setRenameValue(page.name);
  };

  const commitRename = () => {
    if (!activeProject || !renamingPageId) return;
    const name = renameValue.trim() || `Page ${activeProject.pages.find(p => p.id === renamingPageId)?.number}`;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, pages: p.pages.map((pg) => pg.id === renamingPageId ? { ...pg, name } : pg) }
          : p
      )
    );
    setRenamingPageId(null);
  };

  // ── widget link (button action → redirect to another page) ──

  const setWidgetLink = (widgetId: string, targetPageId: string | null) => {
    if (!activeProject || !activePage) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== activeProject.id ? p : {
          ...p,
          pages: p.pages.map((pg) =>
            pg.id !== activePage.id ? pg : {
              ...pg,
              widgets: pg.widgets.map((w) => w.id === widgetId ? { ...w, linkPageId: targetPageId } : w),
            }
          ),
        }
      )
    );
  };

  const addDummyWidget = () => {
    if (!activeProject || !activePage) return;
    const idx = activePage.widgets.length;
    const widget: Widget = {
      id: crypto.randomUUID(),
      title: `Widget ${idx + 1}`,
      chartLabel: "Chart · awaiting VizStore",
      color: WIDGET_COLORS[idx % WIDGET_COLORS.length],
      x: 20 + (idx % 3) * 180,
      y: 20 + Math.floor(idx / 3) * 130,
      w: 160, h: 110,
      linkPageId: null,
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== activeProject.id ? p : {
          ...p,
          pages: p.pages.map((pg) => pg.id !== activePage.id ? pg : { ...pg, widgets: [...pg.widgets, widget] }),
        }
      )
    );
  };

  const goToLinkedPage = (targetId: string | null) => {
    if (!targetId || !previewMode) return;
    setActivePageId(targetId);
  };

  const displayName = profile?.full_name?.trim() || profile?.email || "there";

  const ghostBtn = {
    fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.1em",
    padding: "7px 12px", borderRadius: "8px",
    border: `1px solid rgba(${MR},0.14)`, background: "transparent",
    color: "#9a9aa2" as const, cursor: "pointer" as const,
    display: "flex", alignItems: "center" as const, gap: "6px",
  };

  const mintBtn = {
    fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.1em",
    padding: "7px 12px", borderRadius: "8px",
    border: `1px solid rgba(${MR},0.22)`, background: `rgba(${MR},0.08)`,
    color: MINT, cursor: "pointer" as const,
    display: "flex", alignItems: "center" as const, gap: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f", display: "flex", flexDirection: "column" }}>
      <AppNav active="Dashboard" profile={profile} onLogout={onLogout} onNavigate={onNavigate} />

      {/* ── project bar ── */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 24px", borderBottom: `1px solid rgba(${MR},0.06)`,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontFamily: syn, fontWeight: 700, fontSize: "0.56rem", letterSpacing: "0.16em", color: "#6e6e76", marginRight: "4px" }}>
          PROJECT
        </span>

        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => selectProject(p.id)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontFamily: mono, fontSize: "0.68rem",
              padding: "6px 12px", borderRadius: "8px",
              border: `1px solid ${activeProjectId === p.id ? `rgba(${MR},0.28)` : `rgba(${MR},0.08)`}`,
              background: activeProjectId === p.id ? `rgba(${MR},0.08)` : "transparent",
              color: activeProjectId === p.id ? MINT : "#9a9aa2",
              cursor: "pointer",
            }}
          >
            <Folder size={12} /> {p.name}
          </button>
        ))}

        {creatingProject ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createProject();
                if (e.key === "Escape") { setCreatingProject(false); setNewProjectName(""); }
              }}
              placeholder="project name…"
              style={{
                background: "#141418", border: `1px solid rgba(${MR},0.2)`, borderRadius: "8px",
                padding: "6px 10px", fontFamily: mono, fontSize: "0.66rem", color: "#e8e8ea", outline: "none",
              }}
            />
            <button onClick={createProject} style={{ background: "transparent", border: "none", cursor: "pointer", color: MINT }}><Check size={14} /></button>
            <button onClick={() => { setCreatingProject(false); setNewProjectName(""); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setCreatingProject(true)} style={ghostBtn}><Plus size={12} /> NEW_PROJECT</button>
        )}
      </div>

      {!activeProject ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", minHeight: "400px", textAlign: "center" }}>
          <LayoutGrid size={28} color="#2a2a32" />
          <p style={{ fontFamily: share, fontSize: "0.66rem", color: "#6e6e76", letterSpacing: "0.07em", lineHeight: 1.9 }}>
            Create a Project to start building a Dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* ── page tabs ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 24px", borderBottom: `1px solid rgba(${MR},0.06)`, flexWrap: "wrap" }}>
            {activeProject.pages.map((pg) => {
              const isActive = activePageId === pg.id;
              const isRenaming = renamingPageId === pg.id;
              return (
                <div
                  key={pg.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 10px", borderRadius: "8px",
                    background: isActive ? `rgba(${MR},0.09)` : "#141418",
                    border: `1px solid ${isActive ? `rgba(${MR},0.25)` : `rgba(${MR},0.05)`}`,
                  }}
                >
                  <span style={{ fontFamily: mono, fontSize: "0.6rem", color: isActive ? MINT : "#45454d" }}>{pg.number}</span>
                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingPageId(null); }}
                      onBlur={commitRename}
                      style={{ background: "transparent", border: "none", outline: "none", fontFamily: mono, fontSize: "0.68rem", color: "#e8e8ea", width: "90px" }}
                    />
                  ) : (
                    <button
                      onClick={() => setActivePageId(pg.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: mono, fontSize: "0.68rem", color: isActive ? MINT : "#9a9aa2" }}
                    >
                      {pg.name}
                    </button>
                  )}
                  <button onClick={() => startRename(pg)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d", display: "flex" }}>
                    <Pencil size={10} />
                  </button>
                </div>
              );
            })}
            <button onClick={addPage} style={{ ...ghostBtn, padding: "6px 10px" }}><Plus size={12} /></button>

            <div style={{ flex: 1 }} />

            <button
              onClick={() => setPreviewMode((v) => !v)}
              style={previewMode ? mintBtn : ghostBtn}
            >
              {previewMode ? <Eye size={12} /> : <EditIcon size={12} />}
              {previewMode ? "PREVIEW" : "EDIT"}
            </button>
          </div>

          {/* ── canvas + viz search panel ── */}
          {activePage && (
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

              {/* canvas */}
              <div
                style={{
                  flex: 1, position: "relative", margin: "20px",
                  minHeight: "480px", borderRadius: "14px",
                  backgroundImage: "radial-gradient(rgba(122,255,200,0.06) 1px,transparent 1px)",
                  backgroundSize: "22px 22px",
                  border: `1px solid rgba(${MR},0.05)`,
                }}
              >
                {!previewMode && (
                  <button onClick={addDummyWidget} style={{ position: "absolute", top: "10px", left: "10px", ...ghostBtn, zIndex: 2 }}>
                    <Plus size={12} /> ADD_WIDGET
                  </button>
                )}

                {activePage.widgets.length === 0 && (
                  <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: share, fontSize: "0.62rem", color: "#45454d", textAlign: "center", width: "260px" }}>
                    No widgets yet. Add one, or search VizStore on the right →
                  </p>
                )}

                {activePage.widgets.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => goToLinkedPage(w.linkPageId)}
                    style={{
                      position: "absolute", left: w.x, top: w.y, width: w.w, height: w.h,
                      background: w.color, borderRadius: "12px", padding: "12px",
                      cursor: previewMode && w.linkPageId ? "pointer" : "default",
                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                      boxShadow: previewMode && w.linkPageId ? `0 0 0 2px rgba(${MR},0.4)` : "none",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: mono, fontSize: "0.7rem", fontWeight: 600, color: "#0d0d0f", margin: "0 0 3px" }}>{w.title}</p>
                      <p style={{ fontFamily: share, fontSize: "0.5rem", color: "rgba(13,13,15,0.6)", margin: 0 }}>{w.chartLabel}</p>
                    </div>

                    {!previewMode && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Link2 size={10} color="rgba(13,13,15,0.5)" />
                        <select
                          value={w.linkPageId ?? ""}
                          onChange={(e) => setWidgetLink(w.id, e.target.value || null)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontFamily: share, fontSize: "0.5rem", background: "rgba(13,13,15,0.12)",
                            border: "none", borderRadius: "4px", color: "#0d0d0f", padding: "2px 4px",
                            outline: "none", flex: 1,
                          }}
                        >
                          <option value="">No link</option>
                          {activeProject.pages.filter((pg) => pg.id !== activePage.id).map((pg) => (
                            <option key={pg.id} value={pg.id}>{pg.number}. {pg.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {previewMode && w.linkPageId && (
                      <p style={{ fontFamily: share, fontSize: "0.48rem", color: "rgba(13,13,15,0.55)", margin: 0 }}>
                        → {activeProject.pages.find((pg) => pg.id === w.linkPageId)?.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* right panel — viz search (stub, VizStore not built) */}
              <div
                style={{
                  width: "260px", flexShrink: 0, margin: "20px 20px 20px 0",
                  background: "#141418", borderRadius: "14px",
                  border: `1px solid rgba(${MR},0.06)`,
                  padding: "16px", height: "fit-content",
                }}
              >
                <p style={{ fontFamily: syn, fontWeight: 700, fontSize: "0.54rem", letterSpacing: "0.14em", color: "#6e6e76", marginBottom: "10px" }}>
                  VISUALIZATIONS
                </p>
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <Search size={12} color="#45454d" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    value={vizSearch}
                    onChange={(e) => setVizSearch(e.target.value)}
                    disabled
                    placeholder="Search VizStore…"
                    style={{
                      width: "100%", background: "#0d0d0f", border: `1px solid rgba(${MR},0.06)`,
                      borderRadius: "8px", padding: "7px 8px 7px 28px", fontFamily: mono,
                      fontSize: "0.62rem", color: "#45454d", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", border: `1px dashed rgba(${MR},0.1)`, borderRadius: "10px" }}>
                  <ChevronDown size={12} color="#45454d" style={{ transform: "rotate(-90deg)" }} />
                  <p style={{ fontFamily: share, fontSize: "0.56rem", color: "#45454d", letterSpacing: "0.05em", margin: 0, lineHeight: 1.6 }}>
                    Pulling visuals from VizStore lands with that tab. For now, use ADD_WIDGET for placeholders.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}