export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

