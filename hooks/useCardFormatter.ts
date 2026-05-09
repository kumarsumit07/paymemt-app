"use client";

import { useCallback, useMemo, useState } from "react";

import type { CardType } from "@/types";
import { detectCardType } from "@/utils/card/detectCardType";
import { formatCardNumber, maxCardDigits } from "@/utils/card/formatCardNumber";
import { formatExpiry } from "@/utils/card/formatExpiry";
import { onlyDigits } from "@/utils/strings";

export interface CardFormatterApi {
  cardType: CardType;
  formatCardNumberInput: (nextValue: string) => string;
  formatExpiryInput: (nextValue: string) => string;
  normalizeCardNumber: (formattedValue: string) => string;
  maxDigits: number;
}

export function useCardFormatter(initialCardType: CardType = "unknown"): CardFormatterApi {
  const [cardType, setCardType] = useState<CardType>(initialCardType);

  const maxDigits = useMemo(() => maxCardDigits(cardType), [cardType]);

  const normalizeCardNumber = useCallback((formattedValue: string) => onlyDigits(formattedValue), []);

  const formatCardNumberInput = useCallback((nextValue: string) => {
    const nextType = detectCardType(nextValue);
    setCardType(nextType);
    const formatted = formatCardNumber(nextValue, nextType);
    const digits = onlyDigits(formatted).slice(0, maxCardDigits(nextType));
    return formatCardNumber(digits, nextType);
  }, []);

  const formatExpiryInput = useCallback((nextValue: string) => formatExpiry(nextValue), []);

  return { cardType, formatCardNumberInput, formatExpiryInput, normalizeCardNumber, maxDigits };
}

