import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { createSupabaseAdminClient } from "./supabase-admin.js";

const storePath = path.resolve(process.cwd(), "server/data/auth-store.json");
const supabaseAdmin = createSupabaseAdminClient();
const TEMPORARY_HASH_PREFIX = {
  otp: "otp:",
  reset: "reset:",
};

function hasSupabase() {
  return Boolean(supabaseAdmin);
}

async function getProfileByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, role, status, organization, full_name, must_change_password")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

function tagTemporaryHash(purpose, hash) {
  return `${TEMPORARY_HASH_PREFIX[purpose]}${hash}`;
}

function untagTemporaryHash(value) {
  for (const prefix of Object.values(TEMPORARY_HASH_PREFIX)) {
    if (value.startsWith(prefix)) {
      return value.slice(prefix.length);
    }
  }

  return value;
}

async function deleteTemporaryRows(email, purpose) {
  const normalizedEmail = normalizeEmail(email);

  const { error } = await supabaseAdmin
    .from("otp_codes")
    .delete()
    .eq("email", normalizedEmail)
    .like("otp_hash", `${TEMPORARY_HASH_PREFIX[purpose]}%`);

  if (error) {
    throw error;
  }
}

function createDefaultStore() {
  const timestamp = new Date().toISOString();

  return {
    users: [
      {
        id: crypto.randomUUID(),
        email: "demo@insiviz.test",
        passwordHash: bcrypt.hashSync("ChangeMe123!", 10),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    otpByEmail: {},
    resetTokensByHash: {},
  };
}

async function readStore() {
  try {
    const fileText = await fs.readFile(storePath, "utf8");
    return JSON.parse(fileText);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }

    const defaultStore = createDefaultStore();
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(defaultStore, null, 2));
    return defaultStore;
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export async function findUserByEmail(email) {
  if (hasSupabase()) {
    return await getProfileByEmail(email);
  }

  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);
  return store.users.find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
}

export async function setOtpRecord(email, otpHash, expiresAt) {
  if (hasSupabase()) {
    await deleteTemporaryRows(email, "otp");
    await deleteTemporaryRows(email, "reset");

    const { error } = await supabaseAdmin.from("otp_codes").insert({
      email: normalizeEmail(email),
      otp_hash: tagTemporaryHash("otp", otpHash),
      expires_at: expiresAt,
      attempts: 0,
    });

    if (error) {
      throw error;
    }

    return;
  }

  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);

  store.otpByEmail[normalizedEmail] = {
    otpHash,
    expiresAt,
  };

  for (const [tokenHash, record] of Object.entries(store.resetTokensByHash)) {
    if (normalizeEmail(record.email) === normalizedEmail) {
      delete store.resetTokensByHash[tokenHash];
    }
  }

  await writeStore(store);
}

export async function getOtpRecord(email) {
  if (hasSupabase()) {
    const { data, error } = await supabaseAdmin
      .from("otp_codes")
      .select("otp_hash, expires_at, attempts, created_at")
      .eq("email", normalizeEmail(email))
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? {
          otpHash: untagTemporaryHash(data.otp_hash),
          expiresAt: data.expires_at,
          attempts: data.attempts ?? 0,
        }
      : null;
  }

  const store = await readStore();
  return store.otpByEmail[normalizeEmail(email)] ?? null;
}

export async function clearOtpRecord(email) {
  if (hasSupabase()) {
    await deleteTemporaryRows(email, "otp");
    return;
  }

  const store = await readStore();
  delete store.otpByEmail[normalizeEmail(email)];
  await writeStore(store);
}

export async function setResetTokenRecord(email, resetTokenHash, expiresAt) {
  if (hasSupabase()) {
    await deleteTemporaryRows(email, "reset");

    const { error } = await supabaseAdmin.from("otp_codes").insert({
      email: normalizeEmail(email),
      otp_hash: tagTemporaryHash("reset", resetTokenHash),
      expires_at: expiresAt,
      attempts: 0,
    });

    if (error) {
      throw error;
    }

    return;
  }

  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);

  for (const [tokenHash, record] of Object.entries(store.resetTokensByHash)) {
    if (normalizeEmail(record.email) === normalizedEmail) {
      delete store.resetTokensByHash[tokenHash];
    }
  }

  store.resetTokensByHash[resetTokenHash] = {
    email: normalizedEmail,
    expiresAt,
  };

  await writeStore(store);
}

export async function getResetTokenRecord(resetTokenHash) {
  if (hasSupabase()) {
    const { data, error } = await supabaseAdmin
      .from("otp_codes")
      .select("email, expires_at")
      .eq("otp_hash", tagTemporaryHash("reset", resetTokenHash))
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? {
          email: data.email,
          expiresAt: data.expires_at,
        }
      : null;
  }

  const store = await readStore();
  return store.resetTokensByHash[resetTokenHash] ?? null;
}

export async function clearResetTokenRecord(resetTokenHash) {
  if (hasSupabase()) {
    const { error } = await supabaseAdmin
      .from("otp_codes")
      .delete()
      .eq("otp_hash", tagTemporaryHash("reset", resetTokenHash));

    if (error) {
      throw error;
    }

    return;
  }

  const store = await readStore();
  delete store.resetTokensByHash[resetTokenHash];
  await writeStore(store);
}

export async function updatePasswordForEmail(email, newPassword) {
  if (hasSupabase()) {
    const normalizedEmail = normalizeEmail(email);
    const profile = await getProfileByEmail(normalizedEmail);

    if (!profile?.id) {
      return false;
    }

    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: String(newPassword),
    });

    if (passwordError) {
      throw passwordError;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: false, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (profileError) {
      throw profileError;
    }

    return true;
  }

  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);
  const user = store.users.find((entry) => normalizeEmail(entry.email) === normalizedEmail);

  if (!user) {
    return false;
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  user.updatedAt = new Date().toISOString();
  await writeStore(store);
  return true;
}