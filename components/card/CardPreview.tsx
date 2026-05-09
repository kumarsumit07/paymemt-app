"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import type { CardType } from "@/types";
import { cn } from "@/lib/cn";
import { CardBrandBadge } from "@/components/card/CardBrandBadge";

export interface CardPreviewModel {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cardType: CardType;
}

function maskedNumber(number: string): string {
  const trimmed = number.trim();
  if (trimmed.length === 0) return "**** **** **** ****";
  const visible = trimmed.replace(/\d/g, "*");
  return visible;
}

function displayName(name: string): string {
  const value = name.trim();
  return value.length > 0 ? value.toUpperCase() : "CARDHOLDER";
}

function displayExpiry(expiry: string): string {
  const value = expiry.trim();
  return value.length > 0 ? value : "MM/YY";
}

export function CardPreview({ model, className }: { model: CardPreviewModel; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("relative overflow-hidden rounded-3xl p-6 text-white glass", className)}
      aria-label="Live card preview"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(130,182,255,0.35),transparent_50%),radial-gradient(circle_at_70%_85%,rgba(197,120,255,0.28),transparent_55%)]" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-widest text-white/70">PAYMENT CARD</p>
            <p className="text-sm text-white/70">Secure preview</p>
          </div>
          <CardBrandBadge cardType={model.cardType} />
        </div>

        <div className="mt-8 space-y-4">
          <p className="font-mono text-xl tracking-[0.18em] text-white/95 sm:text-2xl">
            {model.cardNumber.trim().length > 0 ? model.cardNumber : "**** **** **** ****"}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-widest text-white/70">CARDHOLDER</p>
              <p className="truncate text-sm font-semibold">{displayName(model.cardholderName)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-widest text-white/70">EXPIRES</p>
              <p className="text-sm font-semibold">{displayExpiry(model.expiry)}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-white/75">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>Tokenized simulation</span>
            </div>
            <span className="font-mono text-xs text-white/65">{maskedNumber(model.cardNumber)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


