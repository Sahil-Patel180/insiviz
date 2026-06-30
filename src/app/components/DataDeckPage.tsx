import { useState, useRef } from "react";
import {
  Plus, Search, ChevronRight, ChevronDown,
  Folder, FolderOpen, Upload, FileSpreadsheet,
  FileJson, FileText, X, Database,
} from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const mono  = "'JetBrains Mono', monospace";
const syn   = "'Syncopate', sans-serif";

// ── types ─────────────────────────────────────────────────────────────────

type DatasetType = "csv" | "json" | "xlsx" | "tsv";
type FilterType  = DatasetType | "all";

type Dataset = {
  id: string;
  name: string;
  type: DatasetType;
  rows: number | null;
  cols: number | null;
  sizeKb: number | null;
  uploadedAt: string;
};

type FolderNode = {
  id: string;
  name: string;
  children: FolderNode[];
  datasets: Dataset[];
};

type Project = {
  id: string;
  name: string;
  subfolders: FolderNode[];
  datasets: Dataset[];
};

// ── constants ─────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<DatasetType, string> = {
  csv:  "#5DCAA5",
  xlsx: "#7affc8",
  json: "#EF9F27",
  tsv:  "#378ADD",
};

const FILTER_OPTIONS: FilterType[] = ["all", "csv", "json", "xlsx", "tsv"];

// ── helpers ───────────────────────────────────────────────────────────────

function TypeIcon({ type, size = 15 }: { type: DatasetType; size?: number }) {
  const color = TYPE_COLORS[type];
  if (type === "json") return <FileJson size={size} color={color} />;
  if (type === "csv" || type === "xlsx") return <FileSpreadsheet size={size} color={color} />;
  return <FileText size={size} color={color} />;
}

function fmt(kb: number | null): string {
  if (kb === null) return "—";
  return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── tree state helpers ────────────────────────────────────────────────────

function findFolderInTree(folders: FolderNode[], id: string): FolderNode | null {
  for (const f of folders) {
    if (f.id === id) return f;
    const hit = findFolderInTree(f.children, id);
    if (hit) return hit;
  }
  return null;
}

function resolveSelected(
  projects: Project[],
  id: string | null
): { type: "project"; node: Project } | { type: "folder"; node: FolderNode } | null {
  if (!id) return null;
  const proj = projects.find((p) => p.id === id);
  if (proj) return { type: "project", node: proj };
  for (const p of projects) {
    const f = findFolderInTree(p.subfolders, id);
    if (f) return { type: "folder", node: f };
  }
  return null;
}

function mutateFolderInTree(
  folders: FolderNode[],
  targetId: string,
  fn: (f: FolderNode) => FolderNode
): FolderNode[] {
  return folders.map((f) =>
    f.id === targetId ? fn(f) : { ...f, children: mutateFolderInTree(f.children, targetId, fn) }
  );
}

function addToNode(
  projects: Project[],
  targetId: string,
  payload: { dataset?: Dataset; folder?: FolderNode }
): Project[] {
  return projects.map((p) => {
    if (p.id === targetId) {
      return {
        ...p,
        datasets: payload.dataset ? [...p.datasets, payload.dataset] : p.datasets,
        subfolders: payload.folder ? [...p.subfolders, payload.folder] : p.subfolders,
      };
    }
    return {
      ...p,
      subfolders: mutateFolderInTree(p.subfolders, targetId, (f) => ({
        ...f,
        datasets: payload.dataset ? [...f.datasets, payload.dataset] : f.datasets,
        children: payload.folder ? [...f.children, payload.folder] : f.children,
      })),
    };
  });
}

// ── Recursive folder tree (sidebar) ──────────────────────────────────────

function FolderTree({
  folders,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  depth = 1,
}: {
  folders: FolderNode[];
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  depth?: number;
}) {
  return (
    <>
      {folders.map((f) => {
        const isOpen   = expandedIds.has(f.id);
        const isActive = selectedId === f.id;
        return (
          <div key={f.id}>
            <button
              onClick={() => { onToggle(f.id); onSelect(f.id); }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                width: "100%", padding: `6px 8px 6px ${10 + depth * 14}px`,
                background: isActive ? `rgba(${MR},0.08)` : "transparent",
                border: "none", borderRadius: "8px", cursor: "pointer",
                color: isActive ? MINT : "#9a9aa2",
                fontFamily: mono, fontSize: "0.68rem", textAlign: "left",
              }}
            >
              {f.children.length > 0
                ? isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />
                : <span style={{ width: 11 }} />
              }
              {isOpen
                ? <FolderOpen size={14} color={isActive ? MINT : "#45454d"} />
                : <Folder size={14} color={isActive ? MINT : "#45454d"} />
              }
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name}
              </span>
              {(f.datasets.length + f.children.length) > 0 && (
                <span style={{ fontFamily: share, fontSize: "0.48rem", color: "#45454d", background: "#1e1e25", padding: "2px 6px", borderRadius: "999px" }}>
                  {f.datasets.length + f.children.length}
                </span>
              )}
            </button>
            {isOpen && f.children.length > 0 && (
              <FolderTree
                folders={f.children}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export function DataDeckPage({
  profile,
  onLogout,
  onNavigate,
}: {
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const [projects, setProjects]               = useState<Project[]>([]);
  const [selectedId, setSelectedId]           = useState<string | null>(null);
  const [expandedIds, setExpandedIds]         = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery]         = useState("");
  const [typeFilter, setTypeFilter]           = useState<FilterType>("all");
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName]   = useState("");
  const [creatingFolder, setCreatingFolder]   = useState(false);
  const [newFolderName, setNewFolderName]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = resolveSelected(projects, selectedId);

  // ── derive panel content ──

  const panelFolders: FolderNode[] =
    selected?.type === "project" ? selected.node.subfolders :
    selected?.type === "folder"  ? selected.node.children   : [];

  const panelDatasets: Dataset[] =
    selected?.type === "project" ? selected.node.datasets :
    selected?.type === "folder"  ? selected.node.datasets  : [];

  const breadcrumb = selected?.node.name ?? "";

  const filteredDatasets = panelDatasets.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || d.name.toLowerCase().includes(q)) &&
      (typeFilter === "all" || d.type === typeFilter)
    );
  });

  const filteredProjects = projects.filter((p) =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── actions ──

  const createProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    const id = crypto.randomUUID();
    setProjects((prev) => [...prev, { id, name, subfolders: [], datasets: [] }]);
    setSelectedId(id);
    setExpandedIds((prev) => new Set([...prev, id]));
    setNewProjectName("");
    setCreatingProject(false);
  };

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name || !selectedId) return;
    const newFolder: FolderNode = { id: crypto.randomUUID(), name, children: [], datasets: [] };
    setProjects((prev) => addToNode(prev, selectedId, { folder: newFolder }));
    setExpandedIds((prev) => new Set([...prev, selectedId]));
    setNewFolderName("");
    setCreatingFolder(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedId) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "json", "xlsx", "tsv"].includes(ext)) return;
    const dataset: Dataset = {
      id: crypto.randomUUID(),
      name: file.name,
      type: ext as DatasetType,
      rows: null,
      cols: null,
      sizeKb: Math.round(file.size / 1024),
      uploadedAt: new Date().toISOString(),
    };
    setProjects((prev) => addToNode(prev, selectedId, { dataset }));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAndExpand = (id: string) => {
    setSelectedId(id);
    setExpandedIds((prev) => new Set([...prev, id]));
  };

  // ── shared button styles ──

  const ghostBtn = {
    fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.1em",
    padding: "7px 12px", borderRadius: "8px",
    border: `1px solid rgba(${MR},0.12)`, background: "transparent",
    color: "#9a9aa2" as const, cursor: "pointer" as const,
    display: "flex", alignItems: "center" as const, gap: "6px",
  };

  const mintBtn = {
    fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.1em",
    padding: "7px 12px", borderRadius: "8px",
    border: `1px solid rgba(${MR},0.22)`,
    background: `rgba(${MR},0.07)`,
    color: MINT, cursor: "pointer" as const,
    display: "flex", alignItems: "center" as const, gap: "6px",
  };

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f", display: "flex", flexDirection: "column" }}>
      <AppNav active="DataDeck" profile={profile} onLogout={onLogout} onNavigate={onNavigate} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 60px)" }}>

        {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
        <aside
          style={{
            width: "262px", flexShrink: 0,
            background: "#141418",
            borderRight: `1px solid rgba(${MR},0.07)`,
            display: "flex", flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* header */}
          <div style={{ padding: "16px 12px 10px", borderBottom: `1px solid rgba(${MR},0.06)` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontFamily: syn, fontWeight: 700, fontSize: "0.56rem", letterSpacing: "0.16em", color: MINT }}>
                DATA DECK
              </span>
              <button
                onClick={() => { setCreatingProject(true); setCreatingFolder(false); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: MINT, display: "flex", alignItems: "center", gap: "4px", fontFamily: share, fontSize: "0.58rem", letterSpacing: "0.08em" }}
              >
                <Plus size={12} /> PROJECT
              </button>
            </div>

            {/* inline new project input */}
            {creatingProject && (
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
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
                    flex: 1, background: "#0d0d0f",
                    border: `1px solid rgba(${MR},0.2)`, borderRadius: "6px",
                    padding: "6px 8px", fontFamily: mono, fontSize: "0.65rem",
                    color: "#e8e8ea", outline: "none",
                  }}
                />
                <button onClick={createProject} style={{ background: "transparent", border: "none", cursor: "pointer", color: MINT }}>
                  <Plus size={14} />
                </button>
                <button onClick={() => { setCreatingProject(false); setNewProjectName(""); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* search */}
            <div style={{ position: "relative" }}>
              <Search size={12} color="#45454d" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects & datasets…"
                style={{
                  width: "100%", background: "#0d0d0f",
                  border: `1px solid rgba(${MR},0.06)`, borderRadius: "8px",
                  padding: "7px 8px 7px 28px",
                  fontFamily: mono, fontSize: "0.63rem", color: "#e8e8ea",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* project tree */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
            {projects.length === 0 ? (
              <p style={{ fontFamily: share, fontSize: "0.58rem", color: "#45454d", textAlign: "center", marginTop: "28px", letterSpacing: "0.06em", lineHeight: 1.8 }}>
                No projects yet.<br />Create one above.
              </p>
            ) : (
              (searchQuery ? filteredProjects : projects).map((proj) => {
                const isOpen   = expandedIds.has(proj.id);
                const isActive = selectedId === proj.id;
                return (
                  <div key={proj.id}>
                    <button
                      onClick={() => { toggleExpand(proj.id); setSelectedId(proj.id); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        width: "100%", padding: "8px 8px",
                        background: isActive ? `rgba(${MR},0.08)` : "transparent",
                        border: "none", borderRadius: "8px", cursor: "pointer",
                        color: isActive ? MINT : "#c8c8d0",
                        fontFamily: mono, fontSize: "0.72rem", textAlign: "left",
                      }}
                    >
                      {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      {isOpen
                        ? <FolderOpen size={15} color={isActive ? MINT : "#9a9aa2"} />
                        : <Folder size={15} color={isActive ? MINT : "#9a9aa2"} />
                      }
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proj.name}</span>
                      <span style={{ fontFamily: share, fontSize: "0.48rem", color: "#45454d", background: "#1e1e25", padding: "2px 6px", borderRadius: "999px" }}>
                        {proj.subfolders.length + proj.datasets.length}
                      </span>
                    </button>
                    {isOpen && (
                      <FolderTree
                        folders={proj.subfolders}
                        selectedId={selectedId}
                        expandedIds={expandedIds}
                        onSelect={setSelectedId}
                        onToggle={toggleExpand}
                        depth={1}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ══ MAIN PANEL ═══════════════════════════════════════════════════ */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* ── nothing selected: show all project cards ── */}
          {!selectedId && (
            <>
              <p style={{ fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.1em", color: "#6e6e76", marginBottom: "16px" }}>
                // PROJECTS
              </p>
              {projects.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", minHeight: "320px", textAlign: "center" }}>
                  <Database size={30} color="#2a2a32" />
                  <p style={{ fontFamily: share, fontSize: "0.66rem", letterSpacing: "0.07em", color: "#6e6e76", lineHeight: 1.9 }}>
                    No projects yet.<br />Create a project to start organizing datasets.
                  </p>
                  <button
                    onClick={() => setCreatingProject(true)}
                    style={{
                      fontFamily: syn, fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.18em",
                      padding: "13px 24px", borderRadius: "10px",
                      border: `1px solid rgba(${MR},0.22)`, cursor: "pointer",
                      background: `linear-gradient(135deg,rgba(${MR},0.13) 0%,rgba(${MR},0.06) 100%)`,
                      color: MINT,
                    }}
                  >
                    + NEW_PROJECT
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "14px" }}>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectAndExpand(p.id)}
                      style={{
                        background: "#141418", borderRadius: "14px", padding: "18px 16px",
                        border: `1px solid rgba(${MR},0.07)`, cursor: "pointer", textAlign: "left",
                        boxShadow: "5px 5px 12px #0a0a0c,-3px -3px 8px #1e1e25",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `rgba(${MR},0.22)`)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `rgba(${MR},0.07)`)}
                    >
                      <Folder size={24} color="#45454d" style={{ marginBottom: "12px" }} />
                      <p style={{ fontFamily: mono, fontSize: "0.78rem", color: "#e8e8ea", margin: "0 0 5px", fontWeight: 500 }}>{p.name}</p>
                      <p style={{ fontFamily: share, fontSize: "0.56rem", color: "#6e6e76", margin: 0 }}>
                        {p.subfolders.length} folder{p.subfolders.length !== 1 ? "s" : ""} · {p.datasets.length} dataset{p.datasets.length !== 1 ? "s" : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── project or folder selected ── */}
          {selectedId && selected && (
            <>
              {/* breadcrumb + action buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6e6e76", fontFamily: share, fontSize: "0.6rem", letterSpacing: "0.08em" }}
                  >
                    DataDeck
                  </button>
                  <ChevronRight size={12} color="#45454d" />
                  <span style={{ fontFamily: mono, fontSize: "0.78rem", color: "#e8e8ea", fontWeight: 500 }}>{breadcrumb}</span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setCreatingFolder(true)} style={ghostBtn}>
                    <Folder size={12} /> + SUBFOLDER
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.tsv" style={{ display: "none" }} onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} style={mintBtn}>
                    <Upload size={12} /> UPLOAD_DATASET
                  </button>
                </div>
              </div>

              {/* inline new subfolder input */}
              {creatingFolder && (
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", maxWidth: "340px" }}>
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createFolder();
                      if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName(""); }
                    }}
                    placeholder="folder name…"
                    style={{
                      flex: 1, background: "#141418",
                      border: `1px solid rgba(${MR},0.2)`, borderRadius: "8px",
                      padding: "8px 12px", fontFamily: mono, fontSize: "0.68rem",
                      color: "#e8e8ea", outline: "none",
                    }}
                  />
                  <button onClick={createFolder} style={{ ...mintBtn, padding: "8px 14px" }}>CREATE</button>
                  <button onClick={() => { setCreatingFolder(false); setNewFolderName(""); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* subfolder cards */}
              {panelFolders.length > 0 && (
                <>
                  <p style={{ fontFamily: share, fontSize: "0.58rem", letterSpacing: "0.1em", color: "#6e6e76", marginBottom: "12px" }}>
                    // FOLDERS
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "12px", marginBottom: "28px" }}>
                    {panelFolders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => selectAndExpand(f.id)}
                        style={{
                          background: "#141418", borderRadius: "12px", padding: "16px 14px",
                          border: `1px solid rgba(${MR},0.07)`, cursor: "pointer", textAlign: "left",
                          boxShadow: "4px 4px 10px #0a0a0c,-2px -2px 6px #1e1e25",
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `rgba(${MR},0.2)`)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `rgba(${MR},0.07)`)}
                      >
                        <Folder size={20} color="#45454d" style={{ marginBottom: "8px" }} />
                        <p style={{ fontFamily: mono, fontSize: "0.72rem", color: "#e8e8ea", margin: "0 0 4px", fontWeight: 500 }}>{f.name}</p>
                        <p style={{ fontFamily: share, fontSize: "0.54rem", color: "#6e6e76", margin: 0 }}>
                          {f.children.length + f.datasets.length} item{(f.children.length + f.datasets.length) !== 1 ? "s" : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* datasets section */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <p style={{ fontFamily: share, fontSize: "0.58rem", letterSpacing: "0.1em", color: "#6e6e76", margin: 0 }}>
                  // DATASETS
                </p>
                {/* type filter chips */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {FILTER_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      style={{
                        fontFamily: share, fontSize: "0.52rem", letterSpacing: "0.08em",
                        padding: "4px 10px", borderRadius: "999px",
                        border: `1px solid ${typeFilter === t ? `rgba(${MR},0.3)` : `rgba(${MR},0.08)`}`,
                        background: typeFilter === t ? `rgba(${MR},0.1)` : "transparent",
                        color: typeFilter === t ? MINT : "#6e6e76",
                        cursor: "pointer",
                      }}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDatasets.length === 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: "10px", minHeight: "140px",
                  border: `1px dashed rgba(${MR},0.08)`, borderRadius: "12px",
                }}>
                  <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#45454d", letterSpacing: "0.07em", textAlign: "center" }}>
                    {panelDatasets.length === 0
                      ? "No datasets here yet. Upload one above."
                      : "No datasets match this filter."}
                  </p>
                </div>
              ) : (
                <div style={{ background: "#141418", borderRadius: "12px", border: `1px solid rgba(${MR},0.07)`, overflow: "hidden" }}>
                  {/* table header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 130px", padding: "10px 16px", borderBottom: `1px solid rgba(${MR},0.07)` }}>
                    {["Name", "Type", "Size", "Rows", "Uploaded"].map((h) => (
                      <span key={h} style={{ fontFamily: share, fontSize: "0.52rem", letterSpacing: "0.1em", color: "#45454d" }}>{h}</span>
                    ))}
                  </div>
                  {/* table rows */}
                  {filteredDatasets.map((d, i) => (
                    <div
                      key={d.id}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 130px",
                        padding: "12px 16px", alignItems: "center",
                        borderBottom: i < filteredDatasets.length - 1 ? `1px solid rgba(${MR},0.05)` : "none",
                        cursor: "default", transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1a1a20")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <TypeIcon type={d.type} />
                        <span style={{ fontFamily: mono, fontSize: "0.72rem", color: "#e8e8ea" }}>{d.name}</span>
                      </div>
                      <span style={{ fontFamily: share, fontSize: "0.56rem", color: TYPE_COLORS[d.type], letterSpacing: "0.06em" }}>{d.type.toUpperCase()}</span>
                      <span style={{ fontFamily: mono, fontSize: "0.64rem", color: "#6e6e76" }}>{fmt(d.sizeKb)}</span>
                      <span style={{ fontFamily: mono, fontSize: "0.64rem", color: "#6e6e76" }}>{d.rows ?? "—"}</span>
                      <span style={{ fontFamily: mono, fontSize: "0.62rem", color: "#6e6e76" }}>{fmtDate(d.uploadedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}