import dotenv from "dotenv";
import crypto from "node:crypto";
import { createServer } from "node:http";
import bcrypt from "bcryptjs";
import { sendPasswordResetOtp } from "../lib/brevo.js";
import {
  clearOtpRecord,
  clearResetTokenRecord,
  findUserByEmail,
  getOtpRecord,
  getResetTokenRecord,
  normalizeEmail,
  setOtpRecord,
  setResetTokenRecord,
  updatePasswordForEmail,
} from "./auth-store.js";
import { createAccessRequest } from "./access-request-store.js";
import {
  handleListConnections,
  handleCreateConnection,
  handleUpdateConnection,
  handleDeleteConnection,
  handleTestConnection,
  handleListTables,
  handleFetchTableData,
} from "./connections-routes.mjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const port = Number(process.env.AUTH_PORT ?? 8787);
const otpExpiryMs = 10 * 60 * 1000;
const resetTokenExpiryMs = 15 * 60 * 1000;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const rawBody = Buffer.concat(chunks).toString("utf8");

      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function handleForgotPassword(req, res) {
  const { email } = await readRequestBody(req);
  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail) {
    const user = await findUserByEmail(normalizedEmail);

    if (user) {
      const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      const otpHash = await bcrypt.hash(otp, 10);
      await setOtpRecord(normalizedEmail, otpHash, new Date(Date.now() + otpExpiryMs).toISOString());

      try {
        await sendPasswordResetOtp({ email: normalizedEmail, otp });
      } catch (error) {
        console.error("Brevo OTP send failed:", error);
      }
    }
  }

  sendJson(res, 200, {
    success: true,
    message: "If this email exists, an OTP has been sent.",
  });
}

async function handleVerifyOtp(req, res) {
  const { email, otp } = await readRequestBody(req);
  const normalizedEmail = normalizeEmail(email);
  const otpRecord = normalizedEmail ? await getOtpRecord(normalizedEmail) : null;

  if (!otpRecord) {
    sendJson(res, 200, { success: false });
    return;
  }

  if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
    await clearOtpRecord(normalizedEmail);
    sendJson(res, 200, { success: false });
    return;
  }

  const isMatch = await bcrypt.compare(String(otp ?? ""), otpRecord.otpHash);

  if (!isMatch) {
    sendJson(res, 200, { success: false });
    return;
  }

  await clearOtpRecord(normalizedEmail);

  const resetToken = crypto.randomBytes(32).toString("hex");
  await setResetTokenRecord(normalizedEmail, hashValue(resetToken), new Date(Date.now() + resetTokenExpiryMs).toISOString());

  sendJson(res, 200, {
    success: true,
    resetToken,
  });
}

async function handleResetPassword(req, res) {
  const { resetToken, newPassword } = await readRequestBody(req);
  const resetTokenHash = hashValue(String(resetToken ?? ""));
  const resetTokenRecord = await getResetTokenRecord(resetTokenHash);

  if (!resetTokenRecord) {
    sendJson(res, 200, { success: false });
    return;
  }

  if (Date.now() > new Date(resetTokenRecord.expiresAt).getTime()) {
    await clearResetTokenRecord(resetTokenHash);
    sendJson(res, 200, { success: false });
    return;
  }

  if (!String(newPassword ?? "").trim()) {
    sendJson(res, 200, { success: false });
    return;
  }

  const updated = await updatePasswordForEmail(resetTokenRecord.email, String(newPassword));

  if (!updated) {
    sendJson(res, 200, { success: false });
    return;
  }

  await clearResetTokenRecord(resetTokenHash);
  sendJson(res, 200, { success: true });
}

async function handleAccessRequest(req, res){
  const body = await readRequestBody(req);
  const { plan, accountType, fullName, email } = body;

  if (!fullName?.trim() || !email?.trim() || (accountType === "organization" && !body.orgName?.trim())) {
    sendJson(res, 400, { success: false, message: "Missing requied fields." });
    return;
  }

  try {
    await createAccessRequest(body);
    sendJson(res, 200, { success: true });
  } catch (error) {
    console.error("Access request insert failed:", error);
    sendJson(res, 500, { success: false, message: "Could not submit request." });
  }
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { success: false });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (!["POST", "GET", "DELETE", "PATCH"].includes(req.method)) {
    sendJson(res, 405, { success: false });
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/api/auth/forgot-password") {
      await handleForgotPassword(req, res);
      return;
    }

    if (url.pathname === "/api/auth/verify-otp") {
      await handleVerifyOtp(req, res);
      return;
    }

    if (url.pathname === "/api/auth/reset-password") {
      await handleResetPassword(req, res);
      return;
    }

    if (url.pathname === "/api/access-requests") {
      await handleAccessRequest(req, res);
      return;
    }

    if (url.pathname === "/api/connections" && req.method === "GET") {
      await handleListConnections(req, res, url);
      return;
    }

    if (url.pathname === "/api/connections" && req.method === "POST") {
      await handleCreateConnection(req, res);
      return;
    }

    const testMatch = url.pathname.match(/^\/api\/connections\/([^/]+)\/test$/);
    if (testMatch && req.method === "POST") {
      await handleTestConnection(req, res, testMatch[1]);
      return;
    }

    const tablesMatch = url.pathname.match(/^\/api\/connections\/([^/]+)\/tables$/);
    if (tablesMatch && req.method === "GET") {
      await handleListTables(req, res, tablesMatch[1]);
      return;
    }

    const fetchMatch = url.pathname.match(/^\/api\/connections\/([^/]+)\/fetch$/);
    if (fetchMatch && req.method === "POST") {
      await handleFetchTableData(req, res, fetchMatch[1]);
      return;
    }

    const idMatch = url.pathname.match(/^\/api\/connections\/([^/]+)$/);
    if (idMatch && req.method === "DELETE") {
      await handleDeleteConnection(req, res, idMatch[1]);
      return;
    }
    if (idMatch && req.method === "PATCH") {
      await handleUpdateConnection(req, res, idMatch[1]);
      return;
    }

    sendJson(res, 404, { success: false });
  } catch (error) {
    console.error("Auth API error:", error);
    sendJson(res, 500, { success: false });
  }
});

server.listen(port, () => {
  console.log(`Auth API listening on http://localhost:${port}`);
});