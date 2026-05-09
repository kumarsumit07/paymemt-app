import type { PaymentPayload, PaymentResponse } from "@/types";

export type ApiErrorKind = "timeout" | "network" | "server" | "aborted" | "unknown";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: ApiErrorKind; message: string };

export async function postPayment(
  payload: PaymentPayload,
  signal: AbortSignal,
): Promise<ApiResult<PaymentResponse>> {
  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    if (!res.ok) {
      return { ok: false, kind: "server", message: "Payment service is unavailable." };
    }
    const data: unknown = await res.json();
    if (
      typeof data === "object" &&
      data !== null &&
      ("status" in data ? typeof (data as { status?: unknown }).status === "string" : false)
    ) {
      const status = (data as { status: string }).status;
      if (status === "success") return { ok: true, data: { status: "success" } };
      if (
        status === "failed" &&
        typeof (data as { reason?: unknown }).reason === "string" &&
        (data as { reason: string }).reason === "Insufficient funds"
      ) {
        return { ok: true, data: { status: "failed", reason: "Insufficient funds" } };
      }
    }
    return { ok: false, kind: "unknown", message: "Unexpected payment response." };
  } catch (error) {
    const err = error instanceof Error ? error : null;
    const name = err?.name ?? "";
    if (name === "AbortError") {
      return { ok: false, kind: "aborted", message: "Request was cancelled." };
    }
    if (err && /network|fetch/i.test(err.message)) {
      return { ok: false, kind: "network", message: "Network error. Check your connection." };
    }
    return { ok: false, kind: "unknown", message: "Something went wrong." };
  }
}

