import { CreditCard } from "lucide-react";

import type { CardType } from "@/types";
import { Badge } from "@/components/ui/Badge";

function label(cardType: CardType): string {
  if (cardType === "visa") return "VISA";
  if (cardType === "mastercard") return "MASTERCARD";
  if (cardType === "amex") return "AMEX";
  return "CARD";
}

export function CardBrandBadge({ cardType }: { cardType: CardType }) {
  const tone = cardType === "unknown" ? "neutral" : "success";
  return (
    <Badge tone={tone} className="gap-1">
      <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
      {label(cardType)}
    </Badge>
  );
}

