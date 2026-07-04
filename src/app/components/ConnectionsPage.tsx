import { useState } from "react";
import {
  Plus, Database, Cloud, Cpu, X, Check, Shield,
  Server, Lock, Eye, EyeOff, Trash2, Lock as LockIcon,
} from "lucide-react";
import type { Profile } from "../lib/auth";
import { AppNav } from "./AppNav";

const MINT  = "#7affc8";
const MR    = "122,255,200";
const share = "'Share Tech Mono', monospace";
const mono  = "'JetBrains Mono', monospace";
const syn   = "'Syncopate', sans-serif";

type ConnType = "database" | "warehouse" | "llm";
type DbSubtype = "postgresql" | "mysql" | "sqlserver" | "mongodb";

type Connection = {
  id: string;
  name: string;
  type: ConnType;
  subtype: string;
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  sslEnabled?: boolean;
  ollamaUrl?: string;
  ollamaModel?: string;
  status: "untested" | "connected" | "failed";
};

const DB_SUBTYPES: { value: DbSubtype; label: string; defaultPort: string }[] = [
  { value: "postgresql", label: "PostgreSQL", defaultPort: "5432" },
  { value: "mysql",      label: "MySQL",      defaultPort: "3306" },
  { value: "sqlserver",  label: "SQL Server", defaultPort: "1433" },
  { value: "mongodb",    label: "MongoDB",    defaultPort: "27017" },
];

export function ConnectionsPage({
  profile,
  onLogout,
  onNavigate,
}: {
  profile: Profile | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [modalOpen, setModalOpen]     = useState<ConnType | null>(null);

  // form state
  const [name, setName]           = useState("");
  const [subtype, setSubtype]     = useState<DbSubtype>("postgresql");
  const [host, setHost]           = useState("");
  const [port, setPort]           = useState("5432");
  const [database, setDatabase]   = useState("");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sslEnabled, setSslEnabled]     = useState(false);
  const [ollamaUrl, setOllamaUrl]       = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel]   = useState("llama3");
  const [authType, setAuthType] = useState<"sql" | "windows">("sql");
  const [domain, setDomain]     = useState("");

  const resetForm = () => {
    setName(""); setHost(""); setDatabase(""); setUsername(""); setPassword("");
    setSslEnabled(false); setShowPassword(false);
    setSubtype("postgresql"); setPort("5432");
    setOllamaUrl("http://localhost:11434"); setOllamaModel("llama3");
    setAuthType("sql"); setDomain("");
  };

  const closeModal = () => { setModalOpen(null); resetForm(); };

  const saveConnection = async () => {
    if (!name.trim() || !profile?.id) return;

    const body = modalOpen === "llm"
      ? { user_id: profile.id, name, type: "llm", subtype: "ollama", host: ollamaUrl, database_name: ollamaModel }
      : { user_id: profile.id, name, type: "database", subtype, host, port, database_name: database, username, password, ssl_enabled: sslEnabled, auth_type: authType, domain };

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();

      setConnections((prev) => [...prev, {
        id: saved.id, name: saved.name, type: saved.type, subtype: saved.subtype,
        host: saved.host, port: saved.port, database: saved.database_name, username: saved.username,
        sslEnabled: saved.ssl_enabled, status: saved.status,
        ollamaUrl: saved.type === "llm" ? saved.host : undefined,
        ollamaModel: saved.type === "llm" ? saved.database_name : undefined,
      }]);
      closeModal();
    } catch {
      console.error("Could not save connection.");
    }
  };

  const removeConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const testConnection = async (id: string) => {
    setConnections((prev) => prev.map((c) => c.id === id ? { ...c, status: "untested" } : c));
    try {
      const res = await fetch(`/api/connections/${id}/test`, { method: "POST" });
      const result = await res.json();
      setConnections((prev) => prev.map((c) => c.id === id ? { ...c, status: result.status ?? "failed" } : c));
    } catch {
      setConnections((prev) => prev.map((c) => c.id === id ? { ...c, status: "failed" } : c));
    }
  };

  const inputStyle = {
    width: "100%", background: "#0d0d0f", border: `1px solid rgba(${MR},0.14)`,
    borderRadius: "8px", padding: "9px 12px", fontFamily: mono, fontSize: "0.72rem",
    color: "#e8e8ea", outline: "none", boxSizing: "border-box" as const,
  };

  const labelStyle = { fontFamily: share, fontSize: "0.56rem", letterSpacing: "0.08em", color: "#6e6e76", marginBottom: "6px", display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f" }}>
      <AppNav active="Connections" profile={profile} onLogout={onLogout} onNavigate={onNavigate} />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 64px" }}>

        {/* security banner */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#141418", border: `1px solid rgba(${MR},0.1)`, borderRadius: "12px", padding: "14px 16px", marginBottom: "28px" }}>
          <Shield size={16} color={MINT} style={{ flexShrink: 0, marginTop: "1px" }} />
          <p style={{ fontFamily: share, fontSize: "0.62rem", letterSpacing: "0.04em", color: "#9a9aa2", margin: 0, lineHeight: 1.8 }}>
            Credentials are encrypted before storage and only decrypted server-side to run a connection.
            They're never sent back to your browser after saving. Use a dedicated read-only database user — never an admin account.
          </p>
        </div>

        {/* section: databases */}
        <SectionHeader icon={<Database size={14} />} title="DIRECT DATABASE CONNECTIONS" onAdd={() => setModalOpen("database")} />
        {connections.filter((c) => c.type === "database").length === 0 ? (
          <EmptyRow text="No database connections yet." />
        ) : (
          <div style={{ display: "grid", gap: "10px", marginBottom: "32px" }}>
            {connections.filter((c) => c.type === "database").map((c) => (
              <ConnectionCard key={c.id} conn={c} onTest={() => testConnection(c.id)} onDelete={() => removeConnection(c.id)} />
            ))}
          </div>
        )}

        {/* section: warehouses — locked/soon */}
        <SectionHeader icon={<Cloud size={14} />} title="CLOUD DATA WAREHOUSES & STORAGE" locked />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", border: `1px dashed rgba(${MR},0.1)`, borderRadius: "12px", marginBottom: "32px" }}>
          <LockIcon size={14} color="#45454d" />
          <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#45454d", letterSpacing: "0.06em", margin: 0 }}>
            Snowflake, BigQuery, Redshift, S3 — coming soon.
          </p>
        </div>

        {/* section: LLM */}
        <SectionHeader icon={<Cpu size={14} />} title="LLM INTEGRATIONS" onAdd={() => setModalOpen("llm")} />
        {connections.filter((c) => c.type === "llm").length === 0 ? (
          <EmptyRow text="No LLM connected. Local Ollama supported now — cloud-hosted swap-in later." />
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {connections.filter((c) => c.type === "llm").map((c) => (
              <ConnectionCard key={c.id} conn={c} onTest={() => testConnection(c.id)} onDelete={() => removeConnection(c.id)} />
            ))}
          </div>
        )}
      </main>

      {/* ── modal ── */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#141418", borderRadius: "16px", border: `1px solid rgba(${MR},0.12)`, width: "420px", maxHeight: "85vh", overflowY: "auto", padding: "22px" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <span style={{ fontFamily: syn, fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.14em", color: MINT }}>
                {modalOpen === "llm" ? "NEW LLM CONNECTION" : "NEW DATABASE CONNECTION"}
              </span>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}><X size={16} /></button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Connection Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Prod Postgres (read-only)" style={inputStyle} />
            </div>

            {modalOpen === "database" && (
              <>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Database Type</label>
                  <select
                    value={subtype}
                    onChange={(e) => {
                      const val = e.target.value as DbSubtype;
                      setSubtype(val);
                      setPort(DB_SUBTYPES.find((d) => d.value === val)?.defaultPort ?? "");
                    }}
                    style={inputStyle}
                  >
                    {DB_SUBTYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Authentication Type</label>
                  <select value={authType} onChange={(e) => setAuthType(e.target.value as "sql" | "windows")} style={inputStyle}>
                    <option value="sql">SQL Server Authentication</option>
                    <option value="windows">Windows Authentication (NTLM)</option>
                  </select>
                </div>

                {authType === "windows" && (
                  <div style={{ marginBottom: "14px" }}>
                    <label style={labelStyle}>Domain</label>
                    <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="CORP or corp.local" style={inputStyle} />
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  <div>
                    <label style={labelStyle}>Host / Server Address</label>
                    <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="db.example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Port</label>
                    <input value={port} onChange={(e) => setPort(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Database Name</label>
                  <input value={database} onChange={(e) => setDatabase(e.target.value)} placeholder="analytics_db" style={inputStyle} />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="readonly_user" style={inputStyle} />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: "34px" }}
                    />
                    <button
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px", cursor: "pointer" }}>
                  <input type="checkbox" checked={sslEnabled} onChange={(e) => setSslEnabled(e.target.checked)} />
                  <span style={{ fontFamily: share, fontSize: "0.58rem", color: "#9a9aa2", letterSpacing: "0.04em" }}>
                    Require SSL/TLS (recommended for external connections)
                  </span>
                </label>
              </>
            )}

            {modalOpen === "llm" && (
              <>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Ollama Base URL</label>
                  <input value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: "18px" }}>
                  <label style={labelStyle}>Model</label>
                  <input value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} placeholder="llama3" style={inputStyle} />
                </div>
                <p style={{ fontFamily: share, fontSize: "0.56rem", color: "#45454d", letterSpacing: "0.04em", marginBottom: "18px", lineHeight: 1.7 }}>
                  Local only for now — reachable from the server, not the browser. Swapping to a hosted model later just changes this URL.
                </p>
              </>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={saveConnection}
                style={{
                  flex: 1, fontFamily: syn, fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.14em",
                  padding: "12px", borderRadius: "10px", border: `1px solid rgba(${MR},0.25)`,
                  background: `rgba(${MR},0.1)`, color: MINT, cursor: "pointer",
                }}
              >
                SAVE_CONNECTION
              </button>
              <button
                onClick={closeModal}
                style={{ padding: "12px 18px", borderRadius: "10px", border: `1px solid rgba(${MR},0.1)`, background: "transparent", color: "#6e6e76", fontFamily: share, fontSize: "0.58rem", cursor: "pointer" }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── small pieces ──

function SectionHeader({ icon, title, onAdd, locked }: { icon: React.ReactNode; title: string; onAdd?: () => void; locked?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", marginTop: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: locked ? "#45454d" : "#9a9aa2" }}>
        {icon}
        <span style={{ fontFamily: "'Syncopate', sans-serif", fontWeight: 700, fontSize: "0.56rem", letterSpacing: "0.14em" }}>{title}</span>
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: "5px", background: "transparent", border: "none", cursor: "pointer", color: MINT, fontFamily: share, fontSize: "0.58rem", letterSpacing: "0.08em" }}>
          <Plus size={12} /> ADD
        </button>
      )}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div style={{ padding: "14px 16px", border: `1px dashed rgba(${MR},0.08)`, borderRadius: "12px", marginBottom: "32px" }}>
      <p style={{ fontFamily: share, fontSize: "0.6rem", color: "#45454d", letterSpacing: "0.05em", margin: 0 }}>{text}</p>
    </div>
  );
}

function ConnectionCard({ conn, onTest, onDelete }: { conn: Connection; onTest: () => void; onDelete: () => void }) {
  const statusColor = conn.status === "connected" ? MINT : conn.status === "failed" ? "#ED93B1" : "#45454d";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#141418", border: `1px solid rgba(${MR},0.06)`, borderRadius: "12px", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {conn.type === "llm" ? <Cpu size={16} color="#9a9aa2" /> : <Server size={16} color="#9a9aa2" />}
        <div>
          <p style={{ fontFamily: mono, fontSize: "0.72rem", color: "#e8e8ea", margin: "0 0 2px" }}>{conn.name}</p>
          <p style={{ fontFamily: share, fontSize: "0.55rem", color: "#6e6e76", margin: 0 }}>
            {conn.type === "llm" ? `Ollama · ${conn.ollamaModel}` : `${conn.subtype} · ${conn.host || "—"}:${conn.port}`}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: share, fontSize: "0.54rem", color: statusColor, letterSpacing: "0.05em" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
          {conn.status.toUpperCase()}
        </span>
        <button onClick={onTest} style={{ background: "transparent", border: `1px solid rgba(${MR},0.14)`, borderRadius: "6px", padding: "5px 10px", cursor: "pointer", color: "#9a9aa2", fontFamily: share, fontSize: "0.54rem" }}>
          TEST
        </button>
        <button onClick={onDelete} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#45454d" }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}