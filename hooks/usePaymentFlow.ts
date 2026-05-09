"use client";

import { useCallback, useMemo, useRef } from "react";

import { PAYMENT_MAX_ATTEMPTS, PAYMENT_REQUEST_TIMEOUT_MS, PROCESSING_UI_MS } from "@/constants/payment";
import { useAbortableRequest } from "@/hooks/useAbortableRequest";
import { usePaymentStore } from "@/store/paymentStore";
import type { PaymentPayload, PaymentStatus, Transaction } from "@/types";
import { createTransactionId } from "@/lib/ids";
import { validateExpiry } from "@/utils/card/validateExpiry";
import { onlyDigits } from "@/utils/strings";
import { postPayment } from "@/utils/api/paymentApi";
import type { PaymentFormValues } from "@/lib/validation/paymentSchema";

type TerminalStatus = Exclude<PaymentStatus, "idle" | "processing">;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPayload(values: PaymentFormValues, transactionId: string, attempt: number): PaymentPayload {
  const expiry = validateExpiry(values.expiry);
  if (!expiry.ok) {
    throw new Error("Expiry already validated by schema.");
  }
  const amount = Number(values.amount);
  return {
    transactionId,
    attempt,
    cardholderName: values.cardholderName.trim(),
    cardNumber: onlyDigits(values.cardNumber),
    expiryMonth: expiry.month,
    expiryYear: expiry.year,
    cvv: onlyDigits(values.cvv),
    amount,
    currency: values.currency,
  };
}

function toHistoryEntry(payload: PaymentPayload, status: TerminalStatus, failureReason: string | null): Transaction {
  return {
    id: payload.transactionId,
    amount: payload.amount,
    currency: payload.currency,
    status,
    timestamp: Date.now(),
    attemptCount: payload.attempt,
    failureReason: status === "failed" && failureReason === "Insufficient funds" ? "Insufficient funds" : undefined,
  };
}

export interface PaymentFlowApi {
  status: PaymentStatus;
  transactionId: string | null;
  attemptsUsed: number;
  canRetry: boolean;
  attemptLabel: string | null;
  failureReason: string | null;
  submitPayment: (values: PaymentFormValues) => Promise<void>;
  retry: () => Promise<void>;
  startNew: () => void;
  cancelInFlight: () => void;
}

export function usePaymentFlow(): PaymentFlowApi {
  const status = usePaymentStore((s) => s.status);
  const transactionId = usePaymentStore((s) => s.activeTransactionId);
  const attemptsUsed = usePaymentStore((s) => s.attemptsUsed);
  const failureReason = usePaymentStore((s) => s.failureReason);
  const beginProcessing = usePaymentStore((s) => s.beginProcessing);
  const setResult = usePaymentStore((s) => s.setResult);
  const setAttemptsUsed = usePaymentStore((s) => s.setAttemptsUsed);
  const upsertHistory = usePaymentStore((s) => s.upsertHistory);
  const resetFlow = usePaymentStore((s) => s.resetFlow);
  const pushToast = usePaymentStore((s) => s.pushToast);

  const { run, cancel } = useAbortableRequest();
  const transactionIdRef = useRef<string | null>(null);
  const lastValuesRef = useRef<PaymentFormValues | null>(null);
  const manualCancelRef = useRef(false);

  const canRetry = useMemo(() => {
    const terminal = status === "failed" || status === "timeout";
    return terminal && attemptsUsed > 0 && attemptsUsed < PAYMENT_MAX_ATTEMPTS && transactionId !== null;
  }, [attemptsUsed, status, transactionId]);

  const attemptLabel = useMemo(() => {
    if (!transactionIdRef.current) return null;
    if (attemptsUsed <= 0) return null;
    return `Attempt ${attemptsUsed} of ${PAYMENT_MAX_ATTEMPTS}`;
  }, [attemptsUsed]);

  const setTerminal = useCallback(
    (payload: PaymentPayload, terminal: TerminalStatus, reason: string | null) => {
      setResult(terminal, reason ?? undefined);
      upsertHistory(toHistoryEntry(payload, terminal, reason));
    },
    [setResult, upsertHistory],
  );

  const execute = useCallback(
    async (values: PaymentFormValues, attempt: number) => {
      manualCancelRef.current = false;
      const existing = transactionIdRef.current;
      const txId = existing ?? createTransactionId();
      if (!existing) transactionIdRef.current = txId;

      lastValuesRef.current = values;
      setAttemptsUsed(attempt);
      beginProcessing(txId);

      const payload = toPayload(values, txId, attempt);
      const startedAt = Date.now();

      const result = await run((signal) => postPayment(payload, signal), PAYMENT_REQUEST_TIMEOUT_MS);
      const elapsed = Date.now() - startedAt;
      if (elapsed < PROCESSING_UI_MS) await sleep(PROCESSING_UI_MS - elapsed);

      if (result.ok) {
        if (result.data.status === "success") {
          setTerminal(payload, "success", null);
          pushToast({ kind: "success", title: "Payment successful", message: "Your transaction was completed." });
          return;
        }
        setTerminal(payload, "failed", result.data.reason);
        pushToast({
          kind: "error",
          title: "Payment failed",
          message: "The transaction was declined. You can retry up to 3 attempts.",
        });
        return;
      }

      if (result.kind === "timeout") {
        setTerminal(payload, "timeout", null);
        pushToast({
          kind: "error",
          title: "Request timed out",
          message: "The gateway took too long to respond. Please retry.",
        });
        return;
      }

      if (result.kind === "aborted" && manualCancelRef.current) {
        resetFlow();
        return;
      }

      setTerminal(payload, "failed", null);
      pushToast({
        kind: "error",
        title: "Payment unavailable",
        message: "We couldn't process the payment right now. Please retry.",
      });
    },
    [beginProcessing, pushToast, resetFlow, run, setAttemptsUsed, setTerminal],
  );

  const submitPayment = useCallback(
    async (values: PaymentFormValues) => {
      transactionIdRef.current = null;
      await execute(values, 1);
    },
    [execute],
  );

  const retry = useCallback(async () => {
    const values = lastValuesRef.current;
    const txId = transactionIdRef.current;
    if (!values || !txId) return;
    const nextAttempt = attemptsUsed + 1;
    if (nextAttempt > PAYMENT_MAX_ATTEMPTS) return;
    await execute(values, nextAttempt);
  }, [attemptsUsed, execute]);

  const startNew = useCallback(() => {
    manualCancelRef.current = false;
    cancel();
    transactionIdRef.current = null;
    lastValuesRef.current = null;
    resetFlow();
    pushToast({ kind: "info", title: "New payment", message: "Start a new transaction when you're ready." });
  }, [cancel, pushToast, resetFlow]);

  const cancelInFlight = useCallback(() => {
    manualCancelRef.current = true;
    cancel();
    pushToast({ kind: "info", title: "Cancelled", message: "Payment request was cancelled." });
  }, [cancel, pushToast]);

  return {
    status,
    transactionId,
    attemptsUsed,
    canRetry,
    attemptLabel,
    failureReason,
    submitPayment,
    retry,
    startNew,
    cancelInFlight,
  };
}
