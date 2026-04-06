export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type Payment = {
  id: string;
  user_id: string;
  listing_id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  receipt_url: string | null;
  paid_at: string | null;
  created_at: string;
};

export const PACKAGE_PRICE_CENTS = Number(
  process.env.PACKAGE_PRICE_CENTS || "9900"
);
