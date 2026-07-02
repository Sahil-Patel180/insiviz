import { encryptSecret } from "./connections-crypto.js";
import { supabaseAdmin } from "./supabase-admin.js";

// Strips secret before sending to client — never return encrypted_secret or raw password.
function toSafeConnection(row) {
  const { encrypted_secret, ...safe } = row;
  return { ...safe, has_secret: Boolean(encrypted_secret) };
}

export function registerConnectionRoutes(app) {
  // POST /api/connections — create
  app.post("/api/connections", async (req, res) => {
    const { user_id, name, type, subtype, host, port, database_name, username, password, ssl_enabled } = req.body;

    if (!user_id || !name || !type || !subtype) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const encrypted_secret = password ? encryptSecret(password) : null;

    const { data, error } = await supabaseAdmin
      .from("connections")
      .insert({
        user_id, name, type, subtype, host, port,
        database_name, username, encrypted_secret,
        ssl_enabled: Boolean(ssl_enabled),
        status: "untested",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(toSafeConnection(data));
  });

  // GET /api/connections?user_id=... — list, masked
  app.get("/api/connections", async (req, res) => {
    const { user_id } = req.query;
    const { data, error } = await supabaseAdmin
      .from("connections")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(toSafeConnection));
  });

  // POST /api/connections/:id/test — TODO: actual driver-level test query
  app.post("/api/connections/:id/test", async (req, res) => {
    // TODO: fetch row, decryptSecret(row.encrypted_secret), open real driver
    // (pg for postgres, mysql2 for mysql, mongodb for mongo, mssql for sqlserver),
    // run a trivial read query, close connection, update status + last_tested_at.
    // Not implemented yet — wiring drivers per DB type is the next real chunk of work.
    res.status(501).json({ error: "Connection testing not implemented yet." });
  });

  // DELETE /api/connections/:id
  app.delete("/api/connections/:id", async (req, res) => {
    const { error } = await supabaseAdmin.from("connections").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ deleted: true });
  });
}