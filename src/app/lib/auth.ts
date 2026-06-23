type GenericResponse = {
  success: boolean;
  message?: string;
  resetToken?: string;
};

async function postJson<T extends GenericResponse>(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as T | null;

  if (!data) {
    throw new Error("Invalid API response.");
  }

  return data;
}

export function requestForgotPassword(email: string) {
  return postJson<GenericResponse>("/api/auth/forgot-password", { email });
}

export function requestOtpVerification(email: string, otp: string) {
  return postJson<GenericResponse>("/api/auth/verify-otp", { email, otp });
}

export function requestPasswordReset(resetToken: string, newPassword: string) {
  return postJson<GenericResponse>("/api/auth/reset-password", { resetToken, newPassword });
}