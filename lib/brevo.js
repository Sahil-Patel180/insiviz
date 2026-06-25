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
  const templateId = process.env.BREVO_OTP_TEMPLATE_ID;

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is required.");
  }

  await getBrevoClient().transactionalEmails.sendTransacEmail({
    sender: {
      email: senderEmail,
      name: "InsiViz",
    },
    to: [{ email }],
    templateId: Number(templateId), // your template's numeric ID from Brevo dashboard
    params: {
      otp,
    },
  });
}