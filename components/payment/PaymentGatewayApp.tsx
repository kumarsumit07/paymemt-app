"use client";

import { useCallback, useMemo, useState } from "react";
import { Shield, Sparkles } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { CardPreview, type CardPreviewModel } from "@/components/card/CardPreview";
import { PaymentStatusScreen } from "@/components/status/PaymentStatusScreen";
import { TransactionHistory } from "@/components/history/TransactionHistory";
import { TransactionDetails } from "@/components/history/TransactionDetails";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { detectCardType } from "@/utils/card/detectCardType";
import { onlyDigits } from "@/utils/strings";
import type { PaymentFormValues } from "@/lib/validation/paymentSchema";

const emptyPreview: CardPreviewModel = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cardType: "unknown",
};

function toPreview(values: Partial<PaymentFormValues>): CardPreviewModel {
  const number = values.cardNumber ?? "";
  const cardType = detectCardType(onlyDigits(number));
  return {
    cardholderName: values.cardholderName ?? "",
    cardNumber: number,
    expiry: values.expiry ?? "",
    cardType,
  };
}

export function PaymentGatewayApp() {
  const [preview, setPreview] = useState<CardPreviewModel>(emptyPreview);
  const payment = usePaymentFlow();
  const history = useTransactionHistory();

  const handleLiveChange = useCallback((values: Partial<PaymentFormValues>) => {
    setPreview(toPreview(values));
  }, []);

  const hasActiveTransaction = payment.status !== "idle";

  const headline = useMemo(() => {
    return payment.status === "idle" ? "Simulate a payment" : "Payment status";
  }, [payment.status]);

  return (
    <main id="main" className="min-h-screen py-10 sm:py-14">
      <Container>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-white/70">
              <Shield className="h-4 w-4" aria-hidden="true" />
              PAYMENT GATEWAY SIMULATOR
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{headline}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              Built with Next.js App Router, TypeScript, Zustand, React Hook Form, Zod, Framer Motion, and Tailwind CSS.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Glassmorphism / Responsive / Accessible
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <CardPreview model={preview} />
            <TransactionDetails transaction={history.selected} />
          </div>

          <div className="space-y-6 lg:col-span-3">
            <GlassCard className="p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Payment form</h2>
                  <p className="mt-1 text-sm text-white/60">Real-time validation, formatting, and card detection.</p>
                </div>
              </div>
              {payment.status === "idle" ? (
                <PaymentForm disabled={false} onValidSubmit={payment.submitPayment} onLiveChange={handleLiveChange} />
              ) : (
                <PaymentStatusScreen
                  status={payment.status}
                  transactionId={payment.transactionId}
                  attemptsUsed={payment.attemptsUsed}
                  canRetry={payment.canRetry}
                  failureReason={payment.failureReason}
                  onRetry={payment.retry}
                  onStartNew={() => {
                    payment.startNew();
                    setPreview(emptyPreview);
                    history.select(null);
                  }}
                  onCancel={payment.cancelInFlight}
                />
              )}
              {hasActiveTransaction ? (
                <p className="mt-4 text-sm text-white/55" role="note">
                  Form inputs are locked for this transaction. Retry reuses the same transaction ID.
                </p>
              ) : null}
            </GlassCard>

            <TransactionHistory />
          </div>
        </div>
      </Container>
    </main>
  );
}

