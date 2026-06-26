import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "./supabase-admin.js";

const storePath = path.resolve(process.cwd(), "server/data/access-requests.json");
const supabaseAdmin = createSupabaseAdminClient();

function hasSupabase() {
  return Boolean(supabaseAdmin);
}

async function readStore() {
  try {
    const fileText = await fs.readFile(storePath, "utf8");
    return JSON.parse(fileText);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify([], null, 2));
    return [];
  }
}

async function writeStore(rows) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(rows, null, 2));
}

export async function createAccessRequest(payload) {
  const row = {
    plan: payload.plan,
    billing_cycle: payload.billingCycle,
    account_type: payload.accountType,
    full_name: payload.fullName,
    email: String(payload.email).trim().toLowerCase(),
    phone: payload.phone || null,
    message: payload.message || null,
    org_name: payload.orgName || null,
    org_role: payload.orgRole || null,
    team_size: payload.teamSize || null,
    industry: payload.industry || null,
    status: "pending",
  };

  if (hasSupabase()) {
    const { error } = await supabaseAdmin.from("access_requests").insert(row);
    if (error) {
      throw error;
    }
    return;
  }

  const rows = await readStore();
  rows.push({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row });
  await writeStore(rows);
}