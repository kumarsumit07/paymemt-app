import { MOCK_GATEWAY_TIMEOUT_SIMULATION_MS } from "@/constants/payment";

export const dynamic = "force-dynamic";

type PayResponse =
  | { status: "success" }
  | { status: "failed"; reason: "Insufficient funds" };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request): Promise<Response> {
  // Read body to reflect real gateway behavior (and avoid implicit caching assumptions).
  try {
    await request.json();
  } catch {
    return Response.json({ status: "failed", reason: "Insufficient funds" } satisfies PayResponse, {
      status: 400,
    });
  }

  const roll = Math.random();

  // 15%: delayed response (client is expected to timeout at 6s).
  if (roll >= 0.85) {
    await sleep(MOCK_GATEWAY_TIMEOUT_SIMULATION_MS);
    return Response.json({ status: "success" } satisfies PayResponse);
  }

  // 60% success
  if (roll < 0.6) {
    return Response.json({ status: "success" } satisfies PayResponse);
  }

  // 25% failed
  return Response.json({ status: "failed", reason: "Insufficient funds" } satisfies PayResponse);
}
