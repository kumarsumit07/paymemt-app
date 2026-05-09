import { onlyDigits } from "@/utils/strings";

export function isValidLuhn(cardNumberInput: string): boolean {
  const digits = onlyDigits(cardNumberInput);
  if (digits.length < 12) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    const digit = digits.charCodeAt(index) - 48;
    if (digit < 0 || digit > 9) return false;
    let value = digit;
    if (shouldDouble) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

