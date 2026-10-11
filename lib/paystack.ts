import { createHmac, timingSafeEqual } from "crypto";

const BASE = "https://api.paystack.co";
// Your cut of every booking, as a whole percentage. Paystack takes this off the
// top automatically and sends the rest straight to the owner's subaccount —
// money never passes through your main account, so there's nothing to forward.
export const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT || 20);

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set in .env.local");
  return key;
}

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secretKey()}`, "Content-Type": "application/json", ...init?.headers },
  });
  const json = await res.json();
  if (!res.ok || json.status === false) throw new Error(json.message || `Paystack request failed (${res.status})`);
  return json.data as T;
}

export interface PaystackBank {
  name: string;
  code: string;
}

/** Nigerian banks, for a dropdown when an owner sets up payouts. */
export const listBanks = () =>
  paystack<PaystackBank[]>("/bank?country=nigeria&currency=NGN");

/** Confirms an account number is real and returns the account holder's name, before creating a subaccount. */
export const resolveAccountNumber = (accountNumber: string, bankCode: string) =>
  paystack<{ account_number: string; account_name: string }>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`
  );

/** Creates (or on retry, just returns) the subaccount an owner's share of each booking is paid into. */
export const createSubaccount = (input: { businessName: string; bankCode: string; accountNumber: string }) =>
  paystack<{ subaccount_code: string }>("/subaccount", {
    method: "POST",
    body: JSON.stringify({
      business_name: input.businessName,
      bank_code: input.bankCode,
      account_number: input.accountNumber,
      percentage_charge: PLATFORM_COMMISSION_PERCENT, // the percentage the MAIN account (you) keeps
    }),
  });

/** Starts a payment: redirect the browser to the returned authorization_url. */
export const initializeTransaction = (input: {
  email: string;
  amountNaira: number;
  reference: string;
  subaccountCode: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) =>
  paystack<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNaira * 100), // Paystack expects kobo
      reference: input.reference,
      subaccount: input.subaccountCode,
      bearer: "subaccount", // the owner's share absorbs the Paystack transaction fee, not your commission
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

export interface PaystackVerifyResult {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number; // kobo
}

export const verifyTransaction = (reference: string) =>
  paystack<PaystackVerifyResult>(`/transaction/verify/${encodeURIComponent(reference)}`);

/** Checks the `x-paystack-signature` header on an incoming webhook against the raw request body. */
export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
