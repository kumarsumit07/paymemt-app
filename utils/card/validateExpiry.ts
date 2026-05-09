export type ExpiryValidationResult =
  | { ok: true; month: number; year: number }
  | { ok: false; message: string };

function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function validateExpiry(mmYYInput: string): ExpiryValidationResult {
  const trimmed = mmYYInput.trim();
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(trimmed);
  if (!match) return { ok: false, message: "Use MM/YY format." };

  const month = Number(match[1]);
  const year2 = Number(match[2]);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false, message: "Invalid month." };
  }
  const year = 2000 + year2;
  const { month: currentMonth, year: currentYear } = currentMonthYear();
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { ok: false, message: "Card has expired." };
  }
  return { ok: true, month, year };
}

