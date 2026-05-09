import type { CurrencyType } from "@/types";

export function formatMoney(amount: number, currency: CurrencyType): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

