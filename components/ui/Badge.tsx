import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "success" | "error" | "warning";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-white/10 text-white/80 border-white/10",
  success: "bg-emerald-400/15 text-emerald-100 border-emerald-400/25",
  error: "bg-rose-400/15 text-rose-100 border-rose-400/25",
  warning: "bg-amber-400/15 text-amber-100 border-amber-400/25",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

