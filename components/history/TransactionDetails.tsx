"use client";

import { motion } from "framer-motion";
import { CalendarClock, Hash, Repeat2 } from "lucide-react";

import type { Transaction } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatMoney } from "@/utils/currency/formatMoney";

function statusTone(status: string) {
  if (status === "success") return "success";
  if (status === "failed") return "error";
  if (status === "timeout") return "warning";
  return "neutral";
}

function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(ts));
}

export function TransactionDetails({ transaction }: { transaction: Transaction | null }) {
  if (!transaction) {
    return (
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-white">Details</h2>
        <p className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/65">
          Select a transaction from history to view details.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Details</h2>
          <p className="mt-1 text-sm text-white/60">Transaction metadata and outcome.</p>
        </div>
        <Badge tone={statusTone(transaction.status)}>{transaction.status.toUpperCase()}</Badge>
      </div>

      <motion.dl
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold tracking-widest text-white/60">
            <Hash className="h-4 w-4" aria-hidden="true" />
            TRANSACTION ID
          </dt>
          <dd className="mt-2 break-all font-mono text-xs text-white/85">{transaction.id}</dd>
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
          <dt className="text-xs font-semibold tracking-widest text-white/60">AMOUNT</dt>
          <dd className="mt-2 text-lg font-semibold text-white">{formatMoney(transaction.amount, transaction.currency)}</dd>
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold tracking-widest text-white/60">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            LAST UPDATED
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white/85">{formatTimestamp(transaction.timestamp)}</dd>
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold tracking-widest text-white/60">
            <Repeat2 className="h-4 w-4" aria-hidden="true" />
            ATTEMPTS
          </dt>
          <dd className="mt-2 text-sm font-semibold text-white/85">{transaction.attemptCount}</dd>
        </div>

        {transaction.failureReason ? (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 p-4 sm:col-span-2">
            <dt className="text-xs font-semibold tracking-widest text-rose-100/80">FAILURE REASON</dt>
            <dd className="mt-2 text-sm font-semibold text-rose-50">{transaction.failureReason}</dd>
          </div>
        ) : null}
      </motion.dl>
    </GlassCard>
  );
}

