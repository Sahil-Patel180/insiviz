import { encryptSecret, decryptSecret } from "./connections-crypto.js";
import { createSupabaseAdminClient } from "./supabase-admin.js";

const supabaseAdmin = createSupabaseAdminClient();

function toSafeConnection(row) {
  const { encrypted_secret, ...safe } = row;
  return { ...safe, has_secret: Boolean(encrypted_secret) };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

// ── real mssql test — SELECT 1 only, bounded timeout, connection closed after ──
async function testSqlServerConnection({ host, port, database, username, password, sslEnabled, authType, domain }) {
  const sql = await import("mssql");

  const config = {
    server: host,
    port: Number(port) || 1433,
    database,
    connectionTimeout: 8000,
    requestTimeout: 8000,
    options: {
      encrypt: Boolean(sslEnabled),
      trustServerCertificate: !sslEnabled,
    },
  };

  if (authType === "windows") {
    config.authentication = {
      type: "ntlm",
      options: { userName: username, password, domain },
    };
  } else {
    config.user = username;
    config.password = password;
  }

  let pool;
  try {
    pool = await sql.default.connect(config);
    await pool.request().query("SELECT 1 AS ok");
    return { ok: true };
  } finally {
    if (pool) await pool.close();
  }
}

// ── GET /api/connections?user_id=... ──
export async function handleListConnections(req, res, url) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const userId = url.searchParams.get("user_id");
  if (!userId) return sendJson(res, 400, { error: "user_id required." });

  const { data, error } = await supabaseAdmin
    .from("connections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, data.map(toSafeConnection));
}

// ── POST /api/connections ──
export async function handleCreateConnection(req, res) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });

  const { user_id, name, type, subtype, host, port, database_name, username, password, ssl_enabled, auth_type, domain } = await readRequestBody(req);
  if (!user_id || !name || !type || !subtype) {
    return sendJson(res, 400, { error: "Missing required fields." });
  }

  const encrypted_secret = password ? encryptSecret(password) : null;

  const { data, error } = await supabaseAdmin
    .from("connections")
    .insert({ user_id, name, type, subtype, host, port, database_name, username, encrypted_secret, ssl_enabled: Boolean(ssl_enabled), auth_type: auth_type ?? "sql", domain, status: "untested" })
    .select()
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, toSafeConnection(data));
}

// ── DELETE /api/connections/:id ──
export async function handleDeleteConnection(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const { error } = await supabaseAdmin.from("connections").delete().eq("id", id);
  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, { deleted: true });
}

// ── POST /api/connections/:id/test ──
export async function handleTestConnection(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });

  const { data: row, error: fetchError } = await supabaseAdmin.from("connections").select("*").eq("id", id).single();
  if (fetchError || !row) return sendJson(res, 404, { error: "Connection not found." });

  if (row.type !== "database" || row.subtype !== "sqlserver") {
    return sendJson(res, 501, { error: `Testing for ${row.subtype ?? row.type} not implemented yet — only SQL Server is wired.` });
  }

  const password = row.encrypted_secret ? decryptSecret(row.encrypted_secret) : "";

  try {
    await testSqlServerConnection({
      host: row.host, port: row.port, database: row.database_name,
      username: row.username, password, sslEnabled: row.ssl_enabled,
      authType: row.auth_type, domain: row.domain,
    });

    await supabaseAdmin.from("connections").update({ status: "connected", last_tested_at: new Date().toISOString() }).eq("id", id);
    sendJson(res, 200, { status: "connected" });
  } catch (error) {
    await supabaseAdmin.from("connections").update({ status: "failed", last_tested_at: new Date().toISOString() }).eq("id", id);
    sendJson(res, 200, { status: "failed", error: error.message });
  }
}