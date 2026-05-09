"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePaymentStore } from "@/store/paymentStore";
import type { ToastItem, ToastKind } from "@/store/paymentStore";
import { Button } from "@/components/ui/Button";

function iconFor(kind: ToastKind) {
  if (kind === "success") return CheckCircle2;
  if (kind === "error") return XCircle;
  return Info;
}

function tone(kind: ToastKind): string {
  if (kind === "success") return "border-emerald-400/25 bg-emerald-400/10";
  if (kind === "error") return "border-rose-400/25 bg-rose-400/10";
  return "border-white/15 bg-white/10";
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = useMemo(() => iconFor(item.kind), [item.kind]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn("glass rounded-2xl px-4 py-3", tone(item.kind))}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Icon className="h-5 w-5 text-white/85" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-0.5 text-sm text-white/70">{item.message}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-9 p-0"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(item.id)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = usePaymentStore((s) => s.toasts);
  const dismissToast = usePaymentStore((s) => s.dismissToast);

  useEffect(() => {
    const timeouts = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, 4200),
    );
    return () => {
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [dismissToast, toasts]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-xl flex-col gap-3 px-4">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard item={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

