"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Banknote, CreditCard, DollarSign, Lock, User } from "lucide-react";

import type { CurrencyType } from "@/types";
import { DEFAULT_CURRENCY, CURRENCIES } from "@/constants/payment";
import { zodResolver } from "@/lib/validation/zodResolver";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/validation/paymentSchema";
import { useCardFormatter } from "@/hooks/useCardFormatter";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface PaymentFormProps {
  disabled?: boolean;
  initialCurrency?: CurrencyType;
  onValidSubmit: (values: PaymentFormValues) => Promise<void>;
  onLiveChange?: (values: Partial<PaymentFormValues>) => void;
}

const currencyOptions = CURRENCIES.map((currency) => ({ value: currency, label: currency }));

export function PaymentForm({ disabled = false, initialCurrency = DEFAULT_CURRENCY, onValidSubmit, onLiveChange }: PaymentFormProps) {
  const { cardType, formatCardNumberInput, formatExpiryInput } = useCardFormatter();

  const resolver = useMemo(() => zodResolver(paymentFormSchema), []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PaymentFormValues>({
    resolver,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      amount: "",
      currency: initialCurrency,
      },
  });

  const watched = useWatch({ control });
  useEffect(() => {
    onLiveChange?.(watched);
  }, [onLiveChange, watched]);

  const onSubmit = useMemo(() => handleSubmit(async (values) => onValidSubmit(values)), [handleSubmit, onValidSubmit]);

  const submitDisabled = disabled || isSubmitting || !isValid;

  return (
    <form className="space-y-5" onSubmit={onSubmit} aria-label="Payment form" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="cardholderName"
            render={({ field }) => (
              <Input
                {...field}
                label="Cardholder Name"
                placeholder="Aarav Sharma"
                autoComplete="cc-name"
                startIcon={<User className="h-4 w-4" />}
                error={errors.cardholderName?.message ?? null}
                disabled={disabled || isSubmitting}
              />
            )}
          />
        </div>

        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="cardNumber"
            render={({ field }) => (
              <Input
                {...field}
                label="Card Number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder={cardType === "amex" ? "3782 822463 10005" : "4242 4242 4242 4242"}
                startIcon={<CreditCard className="h-4 w-4" />}
                className="font-mono tracking-wider"
                error={errors.cardNumber?.message ?? null}
                disabled={disabled || isSubmitting}
                onChange={(event) => field.onChange(formatCardNumberInput(event.target.value))}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            name="expiry"
            render={({ field }) => (
              <Input
                {...field}
                label="Expiry Date"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                startIcon={<Banknote className="h-4 w-4" />}
                className="font-mono tracking-widest"
                error={errors.expiry?.message ?? null}
                disabled={disabled || isSubmitting}
                onChange={(event) => field.onChange(formatExpiryInput(event.target.value))}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            name="cvv"
            render={({ field }) => (
              <Input
                {...field}
                label="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={cardType === "amex" ? "1234" : "123"}
                startIcon={<Lock className="h-4 w-4" />}
                className="font-mono tracking-widest"
                error={errors.cvv?.message ?? null}
                disabled={disabled || isSubmitting}
                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, "").slice(0, cardType === "amex" ? 4 : 3))}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <Input
                {...field}
                label="Amount"
                inputMode="decimal"
                placeholder="1499"
                startIcon={<DollarSign className="h-4 w-4" />}
                error={errors.amount?.message ?? null}
                disabled={disabled || isSubmitting}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select
              label="Currency"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={currencyOptions}
              error={errors.currency?.message ?? null}
              disabled={disabled || isSubmitting}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn("text-sm text-white/60", submitDisabled ? "opacity-90" : null)}>
          Submit is enabled when all fields are valid.
        </p>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={submitDisabled}>
          Pay securely
        </Button>
      </div>
    </form>
  );
}
