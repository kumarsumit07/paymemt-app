"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, RefreshCcw, TimerOff, XCircle, Shield, ArrowLeft } from "lucide-react";

import type { PaymentStatus } from "@/types";
import { PAYMENT_MAX_ATTEMPTS } from "@/constants/payment";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

type Model = {
  status: PaymentStatus;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: "success" | "error" | "warning" | "neutral";
};

function modelFor(status: PaymentStatus, failureReason: string | null): Model {
  if (status === "processing") {
    return {
      status,
      title: "Processing",
      description: "Validating card details and contacting the gateway...",
      icon: Shield,
      tone: "neutral",
    };
  }
  if (status === "success") {
    return {
      status,
      title: "Success",
      description: "Payment approved. Your transaction is saved in history.",
      icon: CheckCircle2,
      tone: "success",
    };
  }
  if (status === "timeout") {
    return {
      status,
      title: "Timeout",
      description: "The gateway took too long to respond. Please retry.",
      icon: TimerOff,
      tone: "warning",
    };
  }
  if (status === "failed") {
    return {
      status,
      title: "Failed",
      description: failureReason ?? "The gateway declined this payment.",
      icon: XCircle,
      tone: "error",
    };
  }
  return {
    status: "idle",
    title: "Ready",
    description: "Fill the form to simulate a payment.",
    icon: Shield,
    tone: "neutral",
  };
}

function toneClass(tone: Model["tone"]): string {
  if (tone === "success") return "border-emerald-400/25 bg-emerald-400/10";
  if (tone === "error") return "border-rose-400/25 bg-rose-400/10";
  if (tone === "warning") return "border-amber-400/25 bg-amber-400/10";
  return "border-white/12 bg-white/5";
}

export interface PaymentStatusScreenProps {
  status: Exclude<PaymentStatus, "idle">;
  transactionId: string | null;
  attemptsUsed: number;
  canRetry: boolean;
  failureReason: string | null;
  onRetry: () => Promise<void>;
  onStartNew: () => void;
  onCancel: () => void;
}

export function PaymentStatusScreen(props: PaymentStatusScreenProps) {
  const { status, transactionId, attemptsUsed, canRetry, failureReason, onRetry, onStartNew, onCancel } = props;
  const model = useMemo(() => modelFor(status, failureReason), [failureReason, status]);
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (status === "processing") return;
    primaryRef.current?.focus();
  }, [status]);

  const attemptLabel = `Attempt ${attemptsUsed} of ${PAYMENT_MAX_ATTEMPTS}`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.99 }}
        transition={{ duration: 0.25 }}
      >
        <GlassCard className={"p-6 " + toneClass(model.tone)} aria-live="polite" aria-label="Payment status" aria-busy={status === "processing"}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <model.icon className="h-6 w-6 text-white/90" aria-hidden={true} />
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-white">{model.title}</h2>
                <p className="mt-1 text-sm text-white/70">{model.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={model.tone === "neutral" ? "neutral" : model.tone}>{attemptLabel}</Badge>
            </div>
          </div>

          {transactionId ? (
            <div className="mt-4 rounded-2xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs font-semibold tracking-widest text-white/60">TRANSACTION ID</p>
              <p className="mt-2 break-all font-mono text-xs text-white/85">{transactionId}</p>
            </div>
          ) : null}

          {status === "processing" ? (
            <div className="mt-4 rounded-2xl border border-white/12 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <Spinner label="Authorizing..." />
                <span className="text-xs font-semibold text-white/55">Gateway handshake</span>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {status === "processing" ? (
              <Button type="button" variant="ghost" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Cancel
              </Button>
            ) : null}

            {status === "failed" || status === "timeout" ? (
              <Button
                ref={primaryRef}
                type="button"
                variant="secondary"
                onClick={onRetry}
                disabled={!canRetry}
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Retry
              </Button>
            ) : null}

            {status === "success" || !canRetry ? (
              <Button ref={primaryRef} type="button" variant="primary" onClick={onStartNew}>
                Start new payment
              </Button>
            ) : status === "processing" ? null : (
              <Button type="button" variant="ghost" onClick={onStartNew}>
                Start new
              </Button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}

