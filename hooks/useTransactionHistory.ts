"use client";

import { useCallback, useMemo } from "react";

import type { Transaction } from "@/types";
import { usePaymentStore } from "@/store/paymentStore";

export interface TransactionHistoryApi {
  history: Transaction[];
  selected: Transaction | null;
  selectedId: string | null;
  select: (id: string | null) => void;
}

export function useTransactionHistory(): TransactionHistoryApi {
  const history = usePaymentStore((s) => s.history);
  const selectedId = usePaymentStore((s) => s.selectedHistoryId);
  const selectHistory = usePaymentStore((s) => s.selectHistory);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return history.find((item) => item.id === selectedId) ?? null;
  }, [history, selectedId]);

  const select = useCallback(
    (id: string | null) => {
      selectHistory(id);
    },
    [selectHistory],
  );

  return { history, selected, selectedId, select };
}

