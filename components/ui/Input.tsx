"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string | null;
  startIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, startIcon, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = [
    hint ? `${inputId}-hint` : null,
    error ? `${inputId}-error` : null,
  ].filter(Boolean).join(" ");

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium leading-tight text-white/85">
        {label}
      </label>
      <div className="relative">
        {startIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-white/45" aria-hidden="true">
            {startIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy.length > 0 ? describedBy : undefined}
          className={cn(
            "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm leading-tight text-white placeholder:text-white/40 shadow-sm transition focus:border-white/35",
            startIcon ? "pl-10" : null,
            error ? "border-rose-400/60 focus:border-rose-300/80" : null,
            className,
          )}
          {...props}
        />
      </div>
      {hint ? (
        <p id={`${inputId}-hint`} className="text-xs leading-tight text-white/55">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium leading-tight text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
});
