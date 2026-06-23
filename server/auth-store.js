import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";

const storePath = path.resolve(process.cwd(), "server/data/auth-store.json");

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
  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);
  return store.users.find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
}

export async function setOtpRecord(email, otpHash, expiresAt) {
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
  const store = await readStore();
  return store.otpByEmail[normalizeEmail(email)] ?? null;
}

export async function clearOtpRecord(email) {
  const store = await readStore();
  delete store.otpByEmail[normalizeEmail(email)];
  await writeStore(store);
}

export async function setResetTokenRecord(email, resetTokenHash, expiresAt) {
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
  const store = await readStore();
  return store.resetTokensByHash[resetTokenHash] ?? null;
}

export async function clearResetTokenRecord(resetTokenHash) {
  const store = await readStore();
  delete store.resetTokensByHash[resetTokenHash];
  await writeStore(store);
}

export async function updatePasswordForEmail(email, passwordHash) {
  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);
  const user = store.users.find((entry) => normalizeEmail(entry.email) === normalizedEmail);

  if (!user) {
    return false;
  }

  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();
  await writeStore(store);
  return true;
}