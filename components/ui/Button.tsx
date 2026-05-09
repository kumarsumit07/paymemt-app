"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white/90 text-black hover:bg-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] active:translate-y-px",
  secondary:
    "bg-white/10 text-white hover:bg-white/15 border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.25)] active:translate-y-px",
  ghost: "bg-transparent text-white/85 hover:bg-white/10 border border-white/10 active:translate-y-px",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", isLoading = false, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2" aria-live="polite">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black/80" />
          <span>Processing</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});
