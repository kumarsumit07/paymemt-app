import type { FieldError, FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

type ZodSchema<T> = z.ZodType<T>;

function setPath(target: Record<string, unknown>, path: string[], value: FieldError): void {
  let cursor: Record<string, unknown> = target;
  for (let index = 0; index < path.length; index += 1) {
    const key = path[index];
    const isLeaf = index === path.length - 1;
    const existing = cursor[key];
    if (isLeaf) {
      if (existing) return; // keep first error per field
      cursor[key] = value;
      return;
    }
    if (typeof existing === "object" && existing !== null) {
      cursor = existing as Record<string, unknown>;
    } else {
      const next: Record<string, unknown> = {};
      cursor[key] = next;
      cursor = next;
    }
  }
}

function toFieldErrors<TValues extends FieldValues>(issues: z.ZodIssue[]): FieldErrors<TValues> {
  const tree: Record<string, unknown> = {};
  for (const issue of issues) {
    const path = issue.path.map((segment) => String(segment)).filter((p) => p.length > 0);
    if (path.length === 0) continue;
    setPath(tree, path, { type: issue.code, message: issue.message });
  }
  return tree as FieldErrors<TValues>;
}

export function zodResolver<TValues extends FieldValues>(schema: ZodSchema<TValues>): Resolver<TValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    return { values: {}, errors: toFieldErrors<TValues>(result.error.issues) };
  };
}
