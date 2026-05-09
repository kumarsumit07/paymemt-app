import type { CurrencyType } from "@/types";

export const CURRENCIES: readonly CurrencyType[] = ["INR", "USD"] as const;

export const PAYMENT_MAX_ATTEMPTS = 3;

export const PROCESSING_UI_MS = 2000;

export const PAYMENT_REQUEST_TIMEOUT_MS = 6000;

export const MOCK_GATEWAY_TIMEOUT_SIMULATION_MS = 8000;

export const DEFAULT_CURRENCY: CurrencyType = "INR";

