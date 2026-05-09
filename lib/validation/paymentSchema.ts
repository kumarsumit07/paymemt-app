import { z } from "zod";

import type { CurrencyType } from "@/types";
import { CURRENCIES } from "@/constants/payment";
import { detectCardType } from "@/utils/card/detectCardType";
import { isValidLuhn } from "@/utils/card/luhn";
import { onlyDigits } from "@/utils/strings";
import { validateExpiry } from "@/utils/card/validateExpiry";

export const currencySchema = z.custom<CurrencyType>((value) => CURRENCIES.includes(value as CurrencyType), {
  message: "Select a currency.",
});

export const paymentFormSchema = z
  .object({
    cardholderName: z
      .string()
      .trim()
      .min(2, "Cardholder name is required.")
      .max(60, "Name is too long.")
      .regex(/^[a-zA-Z][a-zA-Z\s.'-]*$/, "Enter a valid name."),
    cardNumber: z.string().min(1, "Card number is required."),
    expiry: z.string().min(1, "Expiry date is required."),
    cvv: z.string().min(1, "CVV is required."),
    amount: z
      .string()
      .min(1, "Amount is required.")
      .refine((value) => !Number.isNaN(Number(value)), "Enter a valid amount.")
      .refine((value) => Number(value) > 0, "Amount must be greater than 0.")
      .refine((value) => Number(value) <= 1000000, "Amount is too large."),
    currency: currencySchema,
  })
  .superRefine((values, ctx) => {
    const digits = onlyDigits(values.cardNumber);
    const type = detectCardType(digits);
    const length = digits.length;

    const isAmex = type === "amex";
    const requiredLength = isAmex ? 15 : 16;
    if (type === "unknown") {
      ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Card type not supported." });
      return;
    }

    if (length !== requiredLength) {
      ctx.addIssue({
        code: "custom",
        path: ["cardNumber"],
        message: `Card number must be ${requiredLength} digits.`,
      });
      return;
    }

    if (!isValidLuhn(digits)) {
      ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Invalid card number." });
    }

    const expiry = validateExpiry(values.expiry);
    if (!expiry.ok) {
      ctx.addIssue({ code: "custom", path: ["expiry"], message: expiry.message });
    }

    const cvvDigits = onlyDigits(values.cvv);
    const cvvRequired = isAmex ? 4 : 3;
    if (cvvDigits.length !== cvvRequired) {
      ctx.addIssue({ code: "custom", path: ["cvv"], message: `CVV must be ${cvvRequired} digits.` });
    }
  });

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

