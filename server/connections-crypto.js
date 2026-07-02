import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = process.env.CONNECTIONS_ENC_KEY; // 32-byte hex string, server-only env var

function getKeyBuffer() {
  if (!KEY || KEY.length !== 64) {
    throw new Error("CONNECTIONS_ENC_KEY must be a 32-byte hex string (64 chars).");
  }
  return Buffer.from(KEY, "hex");
}

export function encryptSecret(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKeyBuffer(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // store as iv:authTag:ciphertext, all hex
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptSecret(blob) {
  const [ivHex, tagHex, dataHex] = blob.split(":");
  const decipher = crypto.createDecipheriv(ALGO, getKeyBuffer(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}