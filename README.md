# Payment Gateway Simulator (Next.js App Router)

Production-quality **payment gateway simulation** built with **Next.js App Router + TypeScript**.

It implements a realistic lifecycle (processing → success/failed/timeout), strict idempotency & retry rules, card formatting/detection, local transaction history persistence, accessibility, and responsive fintech UI.

## Tech Stack

- Next.js App Router (Next 15)
- TypeScript (strict)
- Tailwind CSS
- Zustand (`persist` + `devtools`)
- React Hook Form
- Zod (schema-driven validation)
- Framer Motion (screen transitions)
- Lucide React (icons)

No payment SDKs (Stripe/Razorpay/PayPal/etc.). Everything is simulated.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Features (What to Look For)

- **Payment form**: inline errors, validates on blur + typing, submit disabled until valid, prevents double submit
- **Card handling**: auto-format, Visa/Mastercard/Amex detection, CVV length rules per card type, Luhn validation
- **Expiry**: auto MM/YY formatting, rejects invalid months and past dates
- **Live card preview**: real-time updates while typing
- **Lifecycle**: `idle → processing → success|failed|timeout` with Framer Motion transitions
- **Mock gateway**: `/api/pay` returns success/failed/timeout distribution
- **Timeout handling**: frontend aborts after 6 seconds via `AbortController` and shows timeout UI
- **Retry logic**: retry only on failed/timeout, max 3 attempts, shows attempt count, reuses the same transaction ID
- **Idempotency**: transaction ID generated once per transaction using `crypto.randomUUID()` and reused across retries
- **Transaction history**: stores a single entry per transaction ID (updates on retries), persisted in localStorage
- **Accessibility**: proper labels, `aria-describedby`, keyboard-friendly controls, focus management after transitions, visible focus states
- **Responsive UI**: mobile/tablet/desktop layouts
- **Toasts**: friendly notifications (never exposes raw errors)

## Folder Structure

```txt
app/
  api/pay/route.ts        # mock payment gateway
  layout.tsx              # app shell + toaster + skip link
  page.tsx                # renders the gateway UI
  globals.css             # tailwind + glass/gradient utilities

components/
  payment/                # form + composition
  card/                   # card preview + brand badge
  history/                # list + details view
  status/                 # processing/success/failed/timeout screen
  ui/                     # reusable primitives

hooks/
  usePaymentFlow.ts       # lifecycle + retries + idempotency + history updates
  useAbortableRequest.ts  # abort + timeout + error classification
  useCardFormatter.ts     # input formatting + card type inference
  useTransactionHistory.ts# history selection helpers

store/
  paymentStore.ts         # zustand global store (persisted history + toasts)

types/
  payment.ts              # domain types

utils/
  api/paymentApi.ts       # typed fetch wrapper
  card/*                  # formatting/detection/luhn/expiry validation
  currency/*              # currency formatting
  storage/localStorage.ts # safe localStorage helpers
  timeout.ts              # shared timeout utility

constants/
  payment.ts              # timeouts, attempt limits, currencies

lib/
  cn.ts                   # className utility
  ids.ts                  # transaction id generation
  validation/*            # Zod schema + custom RHF resolver
```

## State Management (Zustand)

Global store responsibilities:

- `status`, active transaction metadata, attempt count
- toast notifications (UI-only state)
- **transaction history** persisted via `zustand/middleware/persist`

Only history is persisted; sensitive details (card data) are never stored.

## Payment Flow Design

`hooks/usePaymentFlow.ts` coordinates:

1. Generate `transactionId` once per transaction
2. Move to `processing`
3. Call `/api/pay` with an **abortable** request (6s timeout)
4. Enforce a minimum ~2s processing UI to feel realistic
5. Update terminal status and **upsert** history by transaction ID
6. Allow retry only for `failed`/`timeout` and only up to 3 attempts (same `transactionId`)

## Mock Gateway API

`POST /api/pay` behavior:

- 60%: `{ "status": "success" }`
- 25%: `{ "status": "failed", "reason": "Insufficient funds" }`
- 15%: delayed response (~8s) to trigger a **client-side timeout**

## Assumptions

- This is a **simulation**: no real payments are processed.
- For security, **card data is never persisted** to localStorage.
- History stores the latest attempt outcome per transaction ID (retries update the existing entry).

## Future Improvements

- Add pagination/search to transaction history
- Export/import history (encrypted at rest)
- Add more failure reasons and gateway rules
- Add unit tests for utilities and flow (Luhn, expiry, retry state machine)
- Add route-grouped layouts for a multi-page dashboard experience
