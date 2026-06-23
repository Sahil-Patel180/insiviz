import { BrevoClient } from "@getbrevo/brevo";

let client;

function getBrevoClient() {
  if (!client) {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error("BREVO_API_KEY is required.");
    }

    client = new BrevoClient({ apiKey });
  }

  return client;
}

export async function sendPasswordResetOtp({ email, otp }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is required.");
  }

  await getBrevoClient().transactionalEmails.sendTransacEmail({
    sender: {
      email: senderEmail,
      name: "InsiViz",
    },
    to: [{ email }],
    subject: "Your InsiViz password reset code",
    textContent: `Your password reset code is ${otp}. It expires in 10 minutes.`,
    htmlContent: `<p>Your password reset code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
}