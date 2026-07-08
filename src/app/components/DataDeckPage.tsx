import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, ChevronRight, ChevronDown,
  Folder, FolderOpen, Upload, FileSpreadsheet,
  FileJson, FileText, X, Database, Server, Eye, Pencil, Trash2, Save, Check
} from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const mono  = "'JetBrains Mono', monospace";
const syn   = "'Syncopate', sans-serif";
const MAX_ROWS = 500;

// ── types ─────────────────────────────────────────────────────────────────

type DatasetType = "csv" | "json" | "xlsx" | "tsv" | "table";
type FilterType  = DatasetType | "all";

type Dataset = {
  id: string;
  name: string;
  type: DatasetType;
  rows: number | null;
  cols: number | null;
  sizeKb: number | null;
  uploadedAt: string;
  projectId: string;
  folderId: string | null;
};

type FolderNode = {
  id: string;
  name: string;
  projectId: string;
  parentFolderId: string | null;
  children: FolderNode[];
  datasets: Dataset[];
};

type Project = {
  id: string;
  name: string;
  subfolders: FolderNode[];
  datasets: Dataset[];
};

type RawFolder = { id: string; name: string; project_id: string; parent_folder_id: string | null };
type RawDataset = {
  id: string; name: string; type: DatasetType; project_id: string; folder_id: string | null;
  row_count: number | null; col_count: number | null; size_kb: number | null; created_at: string;
};

// ── constants ─────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<DatasetType, string> = {
  csv:  "#5DCAA5",
  xlsx: "#7affc8",
  json: "#EF9F27",
  tsv:  "#378ADD",
  table: "#AFA9EC",
};

const FILTER_OPTIONS: FilterType[] = ["all", "csv", "json", "xlsx", "tsv"];

// ── helpers ───────────────────────────────────────────────────────────────

function TypeIcon({ type, size = 15 }: { type: DatasetType; size?: number }) {
  const color = TYPE_COLORS[type];
  if (type === "json") return <FileJson size={size} color={color} />;
  if (type === "csv" || type === "xlsx") return <FileSpreadsheet size={size} color={color} />;
  if (type === "table") return <Database size={size} color={color} />;
  return <FileText size={size} color={color} />;
}

function fmt(kb: number | null): string {
  if (kb === null) return "—";
  return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// naive CSV/TSV parser — no quoted-delimiter escaping. Fine for plain exports; flag if you need RFC4180 quoting.
function parseDelimited(text: string, delimiter: string): { columns: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };
  const columns = lines[0].split(delimiter).map((c) => c.trim());
  const rows = lines.slice(1, MAX_ROWS + 1).map((line) => {
    const cells = line.split(delimiter);
    const row: Record<string, string> = {};
    columns.forEach((c, i) => { row[c] = cells[i] ?? ""; });
    return row;
  });
  return { columns, rows };
}

function parseJsonFile(text: string): { columns: string[]; rows: Record<string, any>[] } {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.data) ? parsed.data : [parsed];
  const rows = arr.slice(0, MAX_ROWS);
  const columns = rows[0] ? Object.keys(rows[0]) : [];
  return { columns, rows };
}

async function parseXlsxFile(file: File): Promise<{ columns: string[]; rows: Record<string, any>[] }> {
  // requires `npm install xlsx` (SheetJS) in the project — not wired in package.json yet
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, any>[];
  const capped = rows.slice(0, MAX_ROWS);
  const columns = capped[0] ? Object.keys(capped[0]) : [];
  return { columns, rows: capped };
}

// ── build nested tree from flat backend rows ─────────────────────────────

function buildProjects(rawProjects: { id: string; name: string }[], rawFolders: RawFolder[], rawDatasets: RawDataset[]): Project[] {
  const toDataset = (d: RawDataset): Dataset => ({
    id: d.id, name: d.name, type: d.type, rows: d.row_count, cols: d.col_count,
    sizeKb: d.size_kb, uploadedAt: d.created_at, projectId: d.project_id, folderId: d.folder_id,
  });

  const buildFolder = (f: RawFolder): FolderNode => ({
    id: f.id, name: f.name, projectId: f.project_id, parentFolderId: f.parent_folder_id,
    children: rawFolders.filter((c) => c.parent_folder_id === f.id).map(buildFolder),
    datasets: rawDatasets.filter((d) => d.folder_id === f.id).map(toDataset),
  });

  return rawProjects.map((p) => ({
    id: p.id, name: p.name,
    subfolders: rawFolders.filter((f) => f.project_id === p.id && f.parent_folder_id === null).map(buildFolder),
    datasets: rawDatasets.filter((d) => d.project_id === p.id && d.folder_id === null).map(toDataset),
  }));
}

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
  const [treeLoading, setTreeLoading]         = useState(true);
  const [selectedId, setSelectedId]           = useState<string | null>(null);
  const [expandedIds, setExpandedIds]         = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery]         = useState("");
  const [typeFilter, setTypeFilter]           = useState<FilterType>("all");
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName]   = useState("");
  const [creatingFolder, setCreatingFolder]   = useState(false);
  const [newFolderName, setNewFolderName]     = useState("");
  const [fetchModalOpen, setFetchModalOpen]   = useState(false);
  const [connections, setConnections]         = useState<{ id: string; name: string; type: string; subtype: string; status: string }[]>([]);
  const [selectedConnId, setSelectedConnId]   = useState<string | null>(null);
  const [tables, setTables]                   = useState<string[]>([]);
  const [selectedTables, setSelectedTables]   = useState<Set<string>>(new Set());
  const [fetchStep, setFetchStep]             = useState<"pick-connection" | "pick-table" | "loading" | "error">("pick-connection");
  const [fetchError, setFetchError]           = useState<string | null>(null);
  const [uploadError, setUploadError]         = useState<string | null>(null);

  // preview / edit / delete modal state
  const [activeDataset, setActiveDataset]     = useState<Dataset | null>(null);
  const [gridColumns, setGridColumns]         = useState<string[]>([]);
  const [gridRows, setGridRows]               = useState<Record<string, any>[]>([]);
  const [gridLoading, setGridLoading]         = useState(false);
  const [gridEditing, setGridEditing]         = useState(false);
  const [gridDirty, setGridDirty]             = useState(false);
  const [gridSaving, setGridSaving]           = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── fetch full project/folder/dataset tree on mount ──

  const loadTree = async () => {
    if (!profile?.id) { setTreeLoading(false); return; }
    setTreeLoading(true);
    try {
      const res = await fetch(`/api/projects?user_id=${profile.id}`);
      if (!res.ok) throw new Error("Load failed");
      const { projects: rp, folders: rf, datasets: rd } = await res.json();
      setProjects(buildProjects(rp, rf, rd));
    } catch {
      console.error("Could not load DataDeck contents.");
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => { loadTree(); }, [profile?.id]);

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

  const createProject = async () => {
    const name = newProjectName.trim();
    if (!name || !profile?.id) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: profile.id, name }),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || "Create failed");
      await loadTree();
      setSelectedId(saved.id);
      setExpandedIds((prev) => new Set([...prev, saved.id]));
    } catch {
      console.error("Could not create project.");
    }
    setNewProjectName("");
    setCreatingProject(false);
  };

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !selectedId || !profile?.id) return;
    const project_id = selected?.type === "project" ? selected.node.id : selected?.node ? (selected.node as FolderNode).projectId : null;
    const parent_folder_id = selected?.type === "folder" ? selected.node.id : null;
    if (!project_id) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: profile.id, project_id, parent_folder_id, name }),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || "Create failed");
      await loadTree();
      setExpandedIds((prev) => new Set([...prev, selectedId]));
    } catch {
      console.error("Could not create folder.");
    }
    setNewFolderName("");
    setCreatingFolder(false);
  };

  // resolve project_id/folder_id for wherever is currently selected
  const currentTarget = (): { project_id: string; folder_id: string | null } | null => {
    if (!selected) return null;
    if (selected.type === "project") return { project_id: selected.node.id, folder_id: null };
    return { project_id: selected.node.projectId, folder_id: selected.node.id };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const target = currentTarget();
    if (files.length === 0 || !target || !profile?.id) return;
    setUploadError(null);

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["csv", "json", "xlsx", "tsv"].includes(ext)) continue;

      try {
        let columns: string[] = [];
        let rows: Record<string, any>[] = [];

        if (ext === "csv") ({ columns, rows } = parseDelimited(await file.text(), ","));
        else if (ext === "tsv") ({ columns, rows } = parseDelimited(await file.text(), "\t"));
        else if (ext === "json") ({ columns, rows } = parseJsonFile(await file.text()));
        else ({ columns, rows } = await parseXlsxFile(file));

        const res = await fetch("/api/datasets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: profile.id, project_id: target.project_id, folder_id: target.folder_id,
            name: file.name, type: ext, source: "upload", columns, data: rows,
          }),
        });
        if (!res.ok) { const e2 = await res.json(); throw new Error(e2.error || "Save failed"); }
      } catch (err: any) {
        setUploadError(
          ext === "xlsx" && /Cannot find module|Failed to fetch dynamically imported module/.test(err.message ?? "")
            ? "XLSX parsing needs the 'xlsx' package — run `npm install xlsx` in Codespaces, then retry."
            : `${file.name}: ${err.message ?? "upload failed"}`
        );
      }
    }
    await loadTree();
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

  // ── preview / edit / delete ──

  const openDataset = async (d: Dataset) => {
    setActiveDataset(d);
    setGridEditing(false);
    setGridDirty(false);
    setGridLoading(true);
    try {
      const res = await fetch(`/api/datasets/${d.id}`);
      const full = await res.json();
      if (!res.ok) throw new Error(full.error || "Load failed");
      setGridColumns(full.columns ?? []);
      setGridRows((full.data ?? []).slice(0, 50));
    } catch {
      setGridColumns([]);
      setGridRows([]);
    } finally {
      setGridLoading(false);
    }
  };

  const closeDatasetModal = () => {
    setActiveDataset(null);
    setGridColumns([]);
    setGridRows([]);
    setGridEditing(false);
    setGridDirty(false);
  };

  const updateCell = (rowIdx: number, col: string, value: string) => {
    setGridRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [col]: value } : r)));
    setGridDirty(true);
  };

  const saveGridEdits = async () => {
    if (!activeDataset) return;
    setGridSaving(true);
    try {
      const res = await fetch(`/api/datasets/${activeDataset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: gridRows }),
      });
      if (!res.ok) throw new Error("Save failed");
      setGridDirty(false);
      setGridEditing(false);
      await loadTree();
    } catch {
      console.error("Could not save edits.");
    } finally {
      setGridSaving(false);
    }
  };

  const deleteDataset = async (d: Dataset) => {
    try {
      const res = await fetch(`/api/datasets/${d.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (activeDataset?.id === d.id) closeDatasetModal();
      await loadTree();
    } catch {
      console.error("Could not delete dataset.");
    }
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
      <AppNav profile={profile} onLogout={onLogout} onNavigate={onNavigate} active="DataDeck" />

      <div style={{ display: "flex", flex: 1 }}>
        {/* ── sidebar ── */}
        <aside style={{ width: "260px", borderRight: `1px solid rgba(${MR},0.06)`, padding: "18px 12px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", padding: "0 4px" }}>
            <span style={{ fontFamily: syn, fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.12em", color: "#6e6e76" }}>PROJECTS</span>
            <button onClick={() => setCreatingProject(true)} style={{ background: "transparent", border: "none", cursor: "pointer", color: MINT }}>
              <Plus size={14} />
            </button>
          </div>

          <div style={{ position: "relative", marginBottom: "14px" }}>
            <Search size={12} color="#45454d" style={{ position: "absolute", left: "10px", top: "9px" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                width: "100%", background: "#141418", border: `1px solid rgba(${MR},0.08)`,
                borderRadius: "8px", padding: "7px 10px 7px 28px", color: "#e8e8ea",
                fontFamily: mono, fontSize: "0.68rem", outline: "none",
              }}
            />
          </div>

          {creatingProject && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              <input
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createProject()}
                placeholder="Project name"
                style={{ flex: 1, background: "#141418", border: `1px solid rgba(${MR},0.15)`, borderRadius: "6px", padding: "6px 8px", color: "#e8e8ea", fontFamily: mono, fontSize: "0.65rem", outline: "none" }}
              />
              <button onClick={createProject} style={{ background: "transparent", border: "none", cursor: "pointer", color: MINT }}><Plus size={14} /></button>
              <button onClick={() => setCreatingProject(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}><X size={14} /></button>
            </div>
          )}

          {treeLoading ? (
            <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#45454d", padding: "8px" }}>Loading…</p>
          ) : filteredProjects.length === 0 ? (
            <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#45454d", padding: "8px" }}>No projects yet.</p>
          ) : (
            filteredProjects.map((p) => {
              const isOpen   = expandedIds.has(p.id);
              const isActive = selectedId === p.id;
              return (
                <div key={p.id}>
                  <button
                    onClick={() => selectAndExpand(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", width: "100%",
                      padding: "7px 8px", background: isActive ? `rgba(${MR},0.08)` : "transparent",
                      border: "none", borderRadius: "8px", cursor: "pointer",
                      color: isActive ? MINT : "#c8c8ce", fontFamily: mono, fontSize: "0.72rem", textAlign: "left",
                    }}
                  >
                    {(p.subfolders.length > 0)
                      ? isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />
                      : <span style={{ width: 11 }} />}
                    <Database size={13} color={isActive ? MINT : "#6e6e76"} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  </button>
                  {isOpen && (
                    <FolderTree
                      folders={p.subfolders}
                      selectedId={selectedId}
                      expandedIds={expandedIds}
                      onSelect={selectAndExpand}
                      onToggle={toggleExpand}
                    />
                  )}
                </div>
              );
            })
          )}
        </aside>

        {/* ── main panel ── */}
        <main style={{ flex: 1, padding: "22px 28px" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "10px" }}>
              <Database size={32} color="#2a2a30" />
              <p style={{ fontFamily: share, fontSize: "0.64rem", color: "#45454d", letterSpacing: "0.06em" }}>Select or create a project to get started.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: mono, fontSize: "0.78rem", color: "#e8e8ea", fontWeight: 500 }}>{breadcrumb}</span>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setCreatingFolder(true)} style={ghostBtn}>
                    <Folder size={12} /> + SUBFOLDER
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.tsv" multiple style={{ display: "none" }} onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} style={mintBtn}>
                    <Upload size={12} /> UPLOAD_DATASET
                  </button>
                  <button
                    onClick={async () => {
                      setFetchModalOpen(true);
                      setFetchStep("pick-connection");
                      setFetchError(null);
                      setSelectedTables(new Set());
                      if (!profile?.id) return;
                      try {
                        const res = await fetch(`/api/connections?user_id=${profile.id}`);
                        const data = await res.json();
                        setConnections(
                          data.filter((c: any) => c.type === "database" && c.status === "connected")
                        );
                      } catch {
                        setFetchError("Could not load connections.");
                      }
                    }}
                    style={ghostBtn}
                  >
                    <Server size={12} /> FETCH_FROM_CONNECTION
                  </button>
                </div>
              </div>

              {uploadError && (
                <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#ED93B1", marginBottom: "14px" }}>{uploadError}</p>
              )}

              {creatingFolder && (
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createFolder()}
                    placeholder="Folder name"
                    style={{ background: "#141418", border: `1px solid rgba(${MR},0.15)`, borderRadius: "6px", padding: "7px 10px", color: "#e8e8ea", fontFamily: mono, fontSize: "0.68rem", outline: "none" }}
                  />
                  <button onClick={createFolder} style={mintBtn}><Check size={12} /> ADD</button>
                  <button onClick={() => setCreatingFolder(false)} style={ghostBtn}><X size={12} /> CANCEL</button>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontFamily: share, fontSize: "0.56rem", letterSpacing: "0.1em", color: "#45454d" }}>
                  {filteredDatasets.length} DATASET{filteredDatasets.length !== 1 ? "S" : ""}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {FILTER_OPTIONS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      style={{
                        background: "transparent", border: "none", padding: "4px 8px",
                        fontFamily: share, fontSize: "0.56rem", letterSpacing: "0.06em",
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 130px 90px", padding: "10px 16px", borderBottom: `1px solid rgba(${MR},0.07)` }}>
                    {["Name", "Type", "Size", "Rows", "Uploaded", ""].map((h) => (
                      <span key={h} style={{ fontFamily: share, fontSize: "0.52rem", letterSpacing: "0.1em", color: "#45454d" }}>{h}</span>
                    ))}
                  </div>
                  {/* table rows */}
                  {filteredDatasets.map((d, i) => (
                    <div
                      key={d.id}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 80px 70px 80px 130px 90px",
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
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => openDataset(d)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9a9aa2" }} title="Preview / edit">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => deleteDataset(d)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── fetch-from-connection modal (multi-table select) ── */}
      {fetchModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#141418", borderRadius: "16px", border: `1px solid rgba(${MR},0.12)`, width: "420px", maxHeight: "80vh", overflowY: "auto", padding: "22px" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontFamily: syn, fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.14em", color: MINT }}>
                FETCH FROM CONNECTION
              </span>
              <button onClick={() => setFetchModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}>
                <X size={16} />
              </button>
            </div>

            {fetchError && (
              <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#ED93B1", marginBottom: "14px" }}>{fetchError}</p>
            )}

            {/* step 1: pick connection */}
            {fetchStep === "pick-connection" && (
              <>
                {connections.length === 0 ? (
                  <p style={{ fontFamily: share, fontSize: "0.62rem", color: "#6e6e76", lineHeight: 1.8, marginBottom: "16px" }}>
                    No tested-and-connected database connections yet. Set one up and test it in Connections first.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                    {connections.map((c) => (
                      <button
                        key={c.id}
                        onClick={async () => {
                          setSelectedConnId(c.id);
                          setFetchStep("loading");
                          setFetchError(null);
                          try {
                            const res = await fetch(`/api/connections/${c.id}/tables`);
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "Could not list tables.");
                            setTables(data.tables);
                            setSelectedTables(new Set());
                            setFetchStep("pick-table");
                          } catch (e: any) {
                            setFetchError(e.message);
                            setFetchStep("error");
                          }
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 12px", borderRadius: "8px",
                          border: `1px solid rgba(${MR},0.1)`, background: "#0d0d0f",
                          color: "#e8e8ea", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <Server size={14} color="#9a9aa2" />
                        <div>
                          <p style={{ fontFamily: mono, fontSize: "0.7rem", margin: 0 }}>{c.name}</p>
                          <p style={{ fontFamily: share, fontSize: "0.54rem", color: "#6e6e76", margin: 0 }}>{c.subtype}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => onNavigate("Connections")} style={ghostBtn}>GO_TO_CONNECTIONS</button>
              </>
            )}

            {/* step 2: loading */}
            {fetchStep === "loading" && (
              <p style={{ fontFamily: share, fontSize: "0.62rem", color: "#6e6e76", letterSpacing: "0.06em" }}>Loading…</p>
            )}

            {/* step 3: pick table(s) — multi-select */}
            {fetchStep === "pick-table" && (
              <>
                <p style={{ fontFamily: share, fontSize: "0.58rem", color: "#6e6e76", marginBottom: "10px", letterSpacing: "0.06em" }}>
                  {tables.length} table{tables.length !== 1 ? "s" : ""} found — select one or more
                </p>
                <div style={{ display: "grid", gap: "6px", marginBottom: "16px", maxHeight: "260px", overflowY: "auto" }}>
                  {tables.map((t) => {
                    const isChecked = selectedTables.has(t);
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTables((prev) => {
                            const next = new Set(prev);
                            next.has(t) ? next.delete(t) : next.add(t);
                            return next;
                          });
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "8px 12px", borderRadius: "6px",
                          border: `1px solid ${isChecked ? `rgba(${MR},0.4)` : `rgba(${MR},0.08)`}`,
                          background: isChecked ? `rgba(${MR},0.08)` : "#0d0d0f",
                          color: "#e8e8ea", cursor: "pointer", textAlign: "left",
                          fontFamily: mono, fontSize: "0.68rem",
                        }}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: "4px", flexShrink: 0,
                          border: `1px solid rgba(${MR},0.3)`, background: isChecked ? MINT : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isChecked && <Check size={10} color="#0d0d0f" />}
                        </span>
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    disabled={selectedTables.size === 0}
                    onClick={async () => {
                      const target = currentTarget();
                      if (!selectedConnId || !target || !profile?.id) return;
                      setFetchStep("loading");
                      try {
                        for (const t of selectedTables) {
                          const res = await fetch(`/api/connections/${selectedConnId}/fetch`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ table: t, limit: MAX_ROWS }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || `Fetch failed for ${t}.`);

                          await fetch("/api/datasets", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              user_id: profile.id, project_id: target.project_id, folder_id: target.folder_id,
                              name: t, type: "table", source: "connection", connection_id: selectedConnId,
                              columns: data.columns, data: data.rows,
                            }),
                          });
                        }
                        await loadTree();
                        setFetchModalOpen(false);
                      } catch (e: any) {
                        setFetchError(e.message);
                        setFetchStep("error");
                      }
                    }}
                    style={{ ...mintBtn, opacity: selectedTables.size === 0 ? 0.4 : 1, cursor: selectedTables.size === 0 ? "default" : "pointer" }}
                  >
                    FETCH_SELECTED ({selectedTables.size})
                  </button>
                  <button onClick={() => setFetchStep("pick-connection")} style={ghostBtn}>← BACK</button>
                </div>
              </>
            )}

            {/* step 4: error */}
            {fetchStep === "error" && (
              <button onClick={() => setFetchStep("pick-connection")} style={ghostBtn}>← BACK</button>
            )}
          </div>
        </div>
      )}

      {/* ── preview / edit dataset modal ── */}
      {activeDataset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#141418", borderRadius: "16px", border: `1px solid rgba(${MR},0.12)`, width: "min(90vw, 900px)", maxHeight: "84vh", display: "flex", flexDirection: "column", padding: "20px" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TypeIcon type={activeDataset.type} />
                <span style={{ fontFamily: mono, fontSize: "0.78rem", color: "#e8e8ea" }}>{activeDataset.name}</span>
              </div>
              <button onClick={closeDatasetModal} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontFamily: share, fontSize: "0.56rem", color: "#45454d", marginBottom: "14px", letterSpacing: "0.06em" }}>
              Showing first {Math.min(gridRows.length, 50)} of {activeDataset.rows ?? gridRows.length} rows.
            </p>

            {gridLoading ? (
              <p style={{ fontFamily: share, fontSize: "0.62rem", color: "#6e6e76" }}>Loading…</p>
            ) : gridColumns.length === 0 ? (
              <p style={{ fontFamily: share, fontSize: "0.62rem", color: "#6e6e76" }}>No data stored for this dataset.</p>
            ) : (
              <div style={{ overflow: "auto", border: `1px solid rgba(${MR},0.07)`, borderRadius: "8px", flex: 1 }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      {gridColumns.map((c) => (
                        <th key={c} style={{
                          position: "sticky", top: 0, background: "#1a1a20", textAlign: "left",
                          padding: "8px 12px", fontFamily: share, fontSize: "0.54rem",
                          letterSpacing: "0.06em", color: "#9a9aa2", whiteSpace: "nowrap",
                          borderBottom: `1px solid rgba(${MR},0.1)`,
                        }}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridRows.map((row, ri) => (
                      <tr key={ri}>
                        {gridColumns.map((c) => (
                          <td key={c} style={{ borderBottom: `1px solid rgba(${MR},0.04)`, padding: "0" }}>
                            {gridEditing ? (
                              <input
                                value={row[c] ?? ""}
                                onChange={(e) => updateCell(ri, c, e.target.value)}
                                style={{
                                  width: "100%", background: "transparent", border: "none", outline: "none",
                                  padding: "7px 12px", fontFamily: mono, fontSize: "0.66rem", color: "#e8e8ea",
                                }}
                              />
                            ) : (
                              <span style={{ display: "block", padding: "7px 12px", fontFamily: mono, fontSize: "0.66rem", color: "#c8c8ce", whiteSpace: "nowrap" }}>
                                {String(row[c] ?? "")}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              {gridEditing ? (
                <>
                  <button
                    onClick={saveGridEdits}
                    disabled={gridSaving}
                    style={{ ...mintBtn, opacity: gridSaving ? 0.6 : 1 }}
                  >
                    <Save size={12} /> {gridSaving ? "SAVING…" : "SAVE_CHANGES"}
                  </button>
                  <button onClick={() => { setGridEditing(false); openDataset(activeDataset); }} style={ghostBtn}>
                    CANCEL
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setGridEditing(true)} style={ghostBtn}>
                    <Pencil size={12} /> EDIT
                  </button>
                  <button onClick={() => deleteDataset(activeDataset)} style={{ ...ghostBtn, color: "#ED93B1", borderColor: "rgba(237,147,177,0.25)" }}>
                    <Trash2 size={12} /> DELETE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
