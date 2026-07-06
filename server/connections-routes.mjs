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
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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

function splitSchemaTable(fullName) {
  const parts = fullName.split(".");
  return parts.length === 2 ? { schema: parts[0], table: parts[1] } : { schema: "dbo", table: parts[0] };
}

async function listSqlServerTables({ host, port, database, username, password, sslEnabled, authType, domain }) {
  const sql = await import("mssql");
  const config = {
    server: host, port: Number(port) || 1433, database,
    connectionTimeout: 8000, requestTimeout: 8000,
    options: { encrypt: Boolean(sslEnabled), trustServerCertificate: !sslEnabled },
  };
  if (authType === "windows") {
    config.authentication = { type: "ntlm", options: { userName: username, password, domain } };
  } else {
    config.user = username;
    config.password = password;
  }

  let pool;
  try {
    pool = await sql.default.connect(config);
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    return result.recordset.map((r) => `${r.TABLE_SCHEMA}.${r.TABLE_NAME}`);
  } finally {
    if (pool) await pool.close();
  }
}

async function fetchSqlServerTableData({ host, port, database, username, password, sslEnabled, authType, domain, tableName, limit }) {
  const sql = await import("mssql");
  const { schema, table } = splitSchemaTable(tableName);

  // Guard against injection: identifiers checked against a strict charset, not interpolated raw user text elsewhere.
  const safeIdent = /^[A-Za-z0-9_]+$/;
  if (!safeIdent.test(schema) || !safeIdent.test(table)) {
    throw new Error("Invalid table identifier.");
  }

  const config = {
    server: host, port: Number(port) || 1433, database,
    connectionTimeout: 8000, requestTimeout: 15000,
    options: { encrypt: Boolean(sslEnabled), trustServerCertificate: !sslEnabled },
  };
  if (authType === "windows") {
    config.authentication = { type: "ntlm", options: { userName: username, password, domain } };
  } else {
    config.user = username;
    config.password = password;
  }

  let pool;
  try {
    pool = await sql.default.connect(config);

    const countResult = await pool.request().query(`SELECT COUNT(*) AS total FROM [${schema}].[${table}]`);
    const totalRows = countResult.recordset[0].total;

    const cappedLimit = Math.min(Number(limit) || 100, 500); // hard cap — this is a preview fetch, not a full export
    const dataResult = await pool.request().query(`SELECT TOP (${cappedLimit}) * FROM [${schema}].[${table}]`);

    return {
      columns: dataResult.recordset.columns ? Object.keys(dataResult.recordset.columns) : Object.keys(dataResult.recordset[0] ?? {}),
      rows: dataResult.recordset,
      totalRows,
    };
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

export async function handleUpdateConnection(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });

  const { name, host, port, database_name, username, password, ssl_enabled, auth_type, domain } = await readRequestBody(req);
  if (!name) return sendJson(res, 400, { error: "name required." });

  const update = {
    name, host, port, database_name, username,
    ssl_enabled: Boolean(ssl_enabled), auth_type: auth_type ?? "sql", domain,
    status: "untested", last_tested_at: null, // creds/host may have changed — force re-test
  };

  if (password) {
    update.encrypted_secret = encryptSecret(password);
  }

  const { data, error } = await supabaseAdmin
    .from("connections")
    .update(update)
    .eq("id", id)
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

// ── GET /api/connections/:id/tables ──
export async function handleListTables(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });

  const { data: row, error } = await supabaseAdmin.from("connections").select("*").eq("id", id).single();
  if (error || !row) return sendJson(res, 404, { error: "Connection not found." });

  if (row.type !== "database" || row.subtype !== "sqlserver") {
    return sendJson(res, 501, { error: `Table listing for ${row.subtype ?? row.type} not implemented yet — only SQL Server is wired.` });
  }

  const password = row.encrypted_secret ? decryptSecret(row.encrypted_secret) : "";

  try {
    const tables = await listSqlServerTables({
      host: row.host, port: row.port, database: row.database_name,
      username: row.username, password, sslEnabled: row.ssl_enabled,
      authType: row.auth_type, domain: row.domain,
    });
    sendJson(res, 200, { tables });
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
}

// ── POST /api/connections/:id/fetch ──  body: { table, limit }
export async function handleFetchTableData(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });

  const { data: row, error } = await supabaseAdmin.from("connections").select("*").eq("id", id).single();
  if (error || !row) return sendJson(res, 404, { error: "Connection not found." });

  if (row.type !== "database" || row.subtype !== "sqlserver") {
    return sendJson(res, 501, { error: `Fetching for ${row.subtype ?? row.type} not implemented yet — only SQL Server is wired.` });
  }

  const { table, limit } = await readRequestBody(req);
  if (!table) return sendJson(res, 400, { error: "table is required." });

  const password = row.encrypted_secret ? decryptSecret(row.encrypted_secret) : "";

  try {
    const result = await fetchSqlServerTableData({
      host: row.host, port: row.port, database: row.database_name,
      username: row.username, password, sslEnabled: row.ssl_enabled,
      authType: row.auth_type, domain: row.domain,
      tableName: table, limit,
    });
    sendJson(res, 200, result);
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
}