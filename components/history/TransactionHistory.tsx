"use client";

import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { formatMoney } from "@/utils/currency/formatMoney";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";

function statusTone(status: string) {
  if (status === "success") return "success";
  if (status === "failed") return "error";
  if (status === "timeout") return "warning";
  return "neutral";
}

export function TransactionHistory() {
  const { history, selectedId, select } = useTransactionHistory();

  const hasHistory = history.length > 0;

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Transaction history</h2>
          <p className="mt-1 text-sm text-white/60">Stored locally and survives refresh.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {history.length} saved
        </span>
      </div>

      {!hasHistory ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/65">
          No transactions yet. Complete a payment to populate your history.
        </div>
      ) : (
        <ul className="mt-6 space-y-2" aria-label="Transactions list">
          {history.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <motion.li
                key={item.id}
                layout
                initial={false}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition",
                  isSelected ? "border-white/30 bg-white/10" : "border-white/12 bg-white/5 hover:bg-white/8",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left focus-visible:rounded-2xl"
                  onClick={() => select(item.id)}
                >
                  <p className="truncate font-mono text-xs text-white/70">{item.id}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{formatMoney(item.amount, item.currency)}</p>
                    <Badge tone={statusTone(item.status)}>{item.status.toUpperCase()}</Badge>
                    <span className="text-xs text-white/55">Attempts: {item.attemptCount}</span>
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-10 p-0"
                  aria-label="View transaction details"
                  onClick={() => select(item.id)}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}

