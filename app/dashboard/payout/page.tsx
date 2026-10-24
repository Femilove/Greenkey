import PayoutForm from "@/components/dashboard/PayoutForm";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/paystack";

export const metadata = { title: "Payout details | Avenir" };

export default function PayoutPage() {
  return (
    <div className="dashboard-page">
      <h1>Payout details</h1>
      <p className="dashboard-page-intro">
        Add the bank account guests&apos; payments should settle into. Avenir
        keeps its service fee automatically and sends you the rest — you
        don&apos;t need to transfer anything yourself.
      </p>
      <div className="owner-fee-notice">
        <strong>What you earn.</strong> Avenir keeps{" "}
        {PLATFORM_COMMISSION_PERCENT}% of the stay price as its service
        commission. Guests pay the payment processing fee on top, so nothing
        else is taken from your share. You receive{" "}
        {100 - PLATFORM_COMMISSION_PERCENT}% of the price you set. For example,
        a stay priced at NGN 100,000 pays you NGN{" "}
        {(
          100000 - Math.round((100000 * PLATFORM_COMMISSION_PERCENT) / 100)
        ).toLocaleString("en-NG")}
        . Payouts reach your bank on the next business day after the guest pays.
      </div>
      <PayoutForm />
    </div>
  );
}
