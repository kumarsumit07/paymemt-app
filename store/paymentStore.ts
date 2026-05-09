"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import type { PaymentStatus, Transaction } from "@/types";

export type ToastKind = "info" | "success" | "error";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message: string;
  createdAt: number;
}

export interface PaymentUiState {
  status: PaymentStatus;
  activeTransactionId: string | null;
  attemptsUsed: number;
  failureReason: string | null;
  history: Transaction[];
  selectedHistoryId: string | null;
  toasts: ToastItem[];
}

export interface PaymentActions {
  beginProcessing: (transactionId: string) => void;
  setResult: (result: Exclude<PaymentStatus, "idle" | "processing">, failureReason?: string) => void;
  setAttemptsUsed: (attemptsUsed: number) => void;
  upsertHistory: (entry: Transaction) => void;
  selectHistory: (id: string | null) => void;
  resetFlow: () => void;
  pushToast: (toast: Omit<ToastItem, "id" | "createdAt">) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export type PaymentStore = PaymentUiState & PaymentActions;

function createToastId(): string {
  return crypto.randomUUID();
}

function upsertById(items: Transaction[], entry: Transaction): Transaction[] {
  const index = items.findIndex((item) => item.id === entry.id);
  if (index === -1) return [entry, ...items].slice(0, 50);
  const next = items.slice();
  next[index] = entry;
  return next;
}

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    persist(
      (set, get) => ({
        status: "idle",
        activeTransactionId: null,
        attemptsUsed: 0,
        failureReason: null,
        history: [],
        selectedHistoryId: null,
        toasts: [],

        beginProcessing: (transactionId) => {
          set(
            {
              status: "processing",
              activeTransactionId: transactionId,
              failureReason: null,
            },
            false,
            "payment/beginProcessing",
          );
        },

        setResult: (result, failureReason) => {
          set(
            {
              status: result,
              failureReason: failureReason ?? null,
            },
            false,
            "payment/setResult",
          );
        },

        setAttemptsUsed: (attemptsUsed) => {
          set({ attemptsUsed }, false, "payment/setAttemptsUsed");
        },

        upsertHistory: (entry) => {
          set({ history: upsertById(get().history, entry) }, false, "payment/upsertHistory");
        },

        selectHistory: (id) => {
          set({ selectedHistoryId: id }, false, "payment/selectHistory");
        },

        resetFlow: () => {
          set(
            {
              status: "idle",
              activeTransactionId: null,
              attemptsUsed: 0,
              failureReason: null,
            },
            false,
            "payment/resetFlow",
          );
        },

        pushToast: (toast) => {
          const item: ToastItem = {
            id: createToastId(),
            createdAt: Date.now(),
            ...toast,
          };
          set({ toasts: [...get().toasts, item] }, false, "payment/pushToast");
        },

        dismissToast: (id) => {
          set({ toasts: get().toasts.filter((toast) => toast.id !== id) }, false, "payment/dismissToast");
        },

        clearToasts: () => {
          set({ toasts: [] }, false, "payment/clearToasts");
        },
      }),
      {
        name: "payment-gateway-store",
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ history: state.history }),
      },
    ),
    { name: "PaymentGateway" },
  ),
);

