import type { CardType } from "@/types";
import { onlyDigits } from "@/utils/strings";

export function detectCardType(cardNumberInput: string): CardType {
  const digits = onlyDigits(cardNumberInput);
  if (digits.length === 0) return "unknown";

  if (/^4/.test(digits)) return "visa";

  if (/^(34|37)/.test(digits)) return "amex";

  // Mastercard: 51-55, 2221-2720
  const firstTwo = Number(digits.slice(0, 2));
  if (digits.length >= 2 && firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  const firstFour = Number(digits.slice(0, 4));
  if (digits.length >= 4 && firstFour >= 2221 && firstFour <= 2720) return "mastercard";

  return "unknown";
}


