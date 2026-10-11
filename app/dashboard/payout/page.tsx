import PayoutForm from "@/components/dashboard/PayoutForm";

export const metadata = { title: "Payout details | Greenkey" };

export default function PayoutPage() {
  return (
    <div className="dashboard-page">
      <h1>Payout details</h1>
      <p className="dashboard-page-intro">
        Add the bank account guests&apos; payments should settle into. Greenkey
        keeps its service fee automatically and sends you the rest — you
        don&apos;t need to transfer anything yourself.
      </p>
      <PayoutForm />
    </div>
  );
}
