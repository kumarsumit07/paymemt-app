export type CurrencyType = "INR" | "USD";

export type PaymentStatus = "idle" | "processing" | "success" | "failed" | "timeout";

export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type PaymentFailureReason = "Insufficient funds";

export type PaymentResponse =
  | {
      status: "success";
    }
  | {
      status: "failed";
      reason: PaymentFailureReason;
    };

export interface PaymentPayload {
  transactionId: string;
  attempt: number;
  cardholderName: string;
  cardNumber: string; // digits only
  expiryMonth: number;
  expiryYear: number; // 4-digit year
  cvv: string;
  amount: number;
  currency: CurrencyType;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyType;
  status: Exclude<PaymentStatus, "idle" | "processing">;
  timestamp: number; // epoch ms
  attemptCount: number;
  failureReason?: PaymentFailureReason;
}

