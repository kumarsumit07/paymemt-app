import type { CardType } from "@/types";
import { onlyDigits } from "@/utils/strings";

function groupBy(value: string, groupSizes: readonly number[]): string {
  const parts: string[] = [];
  let cursor = 0;
  for (const size of groupSizes) {
    if (cursor >= value.length) break;
    parts.push(value.slice(cursor, cursor + size));
    cursor += size;
  }
  if (cursor < value.length) parts.push(value.slice(cursor));
  return parts.filter(Boolean).join(" ");
}

export function formatCardNumber(cardNumberInput: string, cardType: CardType): string {
  const digits = onlyDigits(cardNumberInput);
  if (digits.length === 0) return "";

  if (cardType === "amex") {
    return groupBy(digits.slice(0, 15), [4, 6, 5]);
  }
  return groupBy(digits.slice(0, 19), [4, 4, 4, 4, 3]);
}

export function maxCardDigits(cardType: CardType): number {
  if (cardType === "amex") return 15;
  if (cardType === "unknown") return 19;
  return 16;
}

