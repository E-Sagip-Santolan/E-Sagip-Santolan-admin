import mockHealth from "@/mock/health.json";

export async function getHealth() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    return mockHealth;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  let response;
  try {
    response = await fetch(`${apiUrl}/api/health`, { cache: "no-store" });
  } catch (error) {
    throw new Error(
      error instanceof Error ? `Unable to reach the API: ${error.message}` : "Unable to reach the API.",
    );
  }

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("The health endpoint returned invalid JSON.");
  }
}
