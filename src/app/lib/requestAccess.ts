type AccessRequestPayload = {
  plan: "perviz" | "orgviz" | null;
  billingCycle: "monthly" | "annual";
  accountType: "personal" | "organization";
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  orgName?: string | null;
  orgRole?: string | null;
  teamSize?: string | null;
  industry?: string | null;
};

type AccessRequestResponse = {
  success: boolean;
  message?: string;
};

export async function submitAccessRequest(payload: AccessRequestPayload) {
  const response = await fetch("/api/access-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AccessRequestResponse | null;

  if (!data || !data.success) {
    throw new Error(data?.message ?? "Failed to submit access request.");
  }

  return data;
}