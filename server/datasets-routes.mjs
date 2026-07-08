import { createSupabaseAdminClient } from "./supabase-admin.js";

const supabaseAdmin = createSupabaseAdminClient();
const MAX_ROWS = 500;

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

// dataset row shape returned to client for tree/list views — no `data` payload (keep it light)
function toDatasetSummary(row) {
  const { data, ...summary } = row;
  return summary;
}

// ───────────────────────── projects ─────────────────────────

// GET /api/projects?user_id=...  → { projects: [...], folders: [...], datasets: [...] }
// Client assembles the tree from the three flat lists (folders carry parent_folder_id).
export async function handleListProjectTree(req, res, url) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const userId = url.searchParams.get("user_id");
  if (!userId) return sendJson(res, 400, { error: "user_id required." });

  const [{ data: projects, error: pErr }, { data: folders, error: fErr }, { data: datasets, error: dErr }] =
    await Promise.all([
      supabaseAdmin.from("projects").select("*").eq("user_id", userId).order("created_at"),
      supabaseAdmin.from("folders").select("*").eq("user_id", userId).order("created_at"),
      supabaseAdmin.from("datasets").select("id, user_id, project_id, folder_id, name, type, source, row_count, col_count, size_kb, created_at, updated_at").eq("user_id", userId).order("created_at"),
    ]);

  if (pErr || fErr || dErr) return sendJson(res, 500, { error: (pErr || fErr || dErr).message });
  sendJson(res, 200, { projects, folders, datasets });
}

export async function handleCreateProject(req, res) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const { user_id, name } = await readRequestBody(req);
  if (!user_id || !name) return sendJson(res, 400, { error: "user_id and name required." });

  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ user_id, name })
    .select()
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, data);
}

// ───────────────────────── folders ─────────────────────────

export async function handleCreateFolder(req, res) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const { user_id, project_id, parent_folder_id, name } = await readRequestBody(req);
  if (!user_id || !project_id || !name) return sendJson(res, 400, { error: "user_id, project_id and name required." });

  const { data, error } = await supabaseAdmin
    .from("folders")
    .insert({ user_id, project_id, parent_folder_id: parent_folder_id ?? null, name })
    .select()
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, data);
}

// ───────────────────────── datasets ─────────────────────────

// POST /api/datasets — body: { user_id, project_id, folder_id, name, type, source, connection_id, columns, data }
export async function handleCreateDataset(req, res) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const body = await readRequestBody(req);
  const { user_id, project_id, folder_id, name, type, source, connection_id, columns, data } = body;
  if (!user_id || !project_id || !name || !type) {
    return sendJson(res, 400, { error: "user_id, project_id, name and type required." });
  }

  const rows = Array.isArray(data) ? data.slice(0, MAX_ROWS) : [];
  const cols = Array.isArray(columns) ? columns : (rows[0] ? Object.keys(rows[0]) : []);

  const { data: saved, error } = await supabaseAdmin
    .from("datasets")
    .insert({
      user_id, project_id, folder_id: folder_id ?? null, name, type,
      source: source ?? "upload", connection_id: connection_id ?? null,
      columns: cols, data: rows,
      row_count: rows.length, col_count: cols.length,
      size_kb: Math.round(JSON.stringify(rows).length / 1024),
    })
    .select("id, user_id, project_id, folder_id, name, type, source, row_count, col_count, size_kb, created_at, updated_at")
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, saved);
}

// GET /api/datasets/:id — full row data, for preview/edit
export async function handleGetDataset(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const { data, error } = await supabaseAdmin.from("datasets").select("*").eq("id", id).single();
  if (error) return sendJson(res, 404, { error: "Dataset not found." });
  sendJson(res, 200, data);
}

// PATCH /api/datasets/:id — body may include: name, columns, data (full replacement of edited grid)
export async function handleUpdateDataset(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const { name, columns, data } = await readRequestBody(req);

  const update = { updated_at: new Date().toISOString() };
  if (name !== undefined) update.name = name;
  if (Array.isArray(data)) {
    const rows = data.slice(0, MAX_ROWS);
    update.data = rows;
    update.row_count = rows.length;
    update.size_kb = Math.round(JSON.stringify(rows).length / 1024);
  }
  if (Array.isArray(columns)) {
    update.columns = columns;
    update.col_count = columns.length;
  }

  const { data: saved, error } = await supabaseAdmin
    .from("datasets")
    .update(update)
    .eq("id", id)
    .select("id, user_id, project_id, folder_id, name, type, source, row_count, col_count, size_kb, created_at, updated_at")
    .single();

  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, saved);
}

export async function handleDeleteDataset(req, res, id) {
  if (!supabaseAdmin) return sendJson(res, 500, { error: "Supabase admin not configured." });
  const { error } = await supabaseAdmin.from("datasets").delete().eq("id", id);
  if (error) return sendJson(res, 500, { error: error.message });
  sendJson(res, 200, { success: true });
}
