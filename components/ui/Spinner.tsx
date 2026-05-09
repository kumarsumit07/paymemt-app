import { cn } from "@/lib/cn";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-white/80", className)} role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
      <span>{label}</span>
    </div>
  );
}

