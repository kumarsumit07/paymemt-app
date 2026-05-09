import { onlyDigits } from "@/utils/strings";

export function formatExpiry(expiryInput: string): string {
  const digits = onlyDigits(expiryInput).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

