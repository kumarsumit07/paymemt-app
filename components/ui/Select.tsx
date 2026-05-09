"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/cn";

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface SelectProps<TValue extends string>
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label: string;
  value: TValue;
  onChange: (value: TValue) => void;
  options: readonly SelectOption<TValue>[];
  error?: string | null;
  hint?: string | null;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps<string>>(function Select(
  { label, options, value, onChange, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const describedBy = [
    hint ? `${selectId}-hint` : null,
    error ? `${selectId}-error` : null,
  ].filter(Boolean).join(" ");

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="text-sm font-medium leading-tight text-white/85">
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy.length > 0 ? describedBy : undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-white/15 bg-white/5 px-3 pr-10 text-sm leading-tight text-white shadow-sm transition focus:border-white/35",
            error ? "border-rose-400/60 focus:border-rose-300/80" : null,
            className,
          )}
          onChange={(event) => onChange(event.target.value)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0B0F1A]">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-white/55" aria-hidden="true">
          ▼
        </span>
      </div>
      {hint ? (
        <p id={`${selectId}-hint`} className="text-xs leading-tight text-white/55">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${selectId}-error`} className="text-xs font-medium leading-tight text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
});
