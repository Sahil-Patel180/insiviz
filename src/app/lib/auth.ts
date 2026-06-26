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

import { supabase } from "./supabase";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  status: string | null;
  organization: string | null;
  must_change_password: boolean;
};

export type SignInResult =
  | { success: true; profile: Profile }
  | { success: false; message: string };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  if (!supabase) {
    return { success: false, message: "Auth not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { success: false, message: error?.message ?? "Invalid email or password." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, status, organization, must_change_password")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { success: false, message: "Could not load account." };
  }

  if (profile.status && profile.status !== "approved") {
    await supabase.auth.signOut();
    return { success: false, message: "Account not yet approved." };
  }

  return { success: true, profile: profile as Profile };
}

export async function signOut() {
  await supabase?.auth.signOut();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, status, organization, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  return (profile as Profile) ?? null;
}