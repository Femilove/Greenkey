import Link from "next/link";
import connectDB from "@/lib/mongodb";
import { verifyTransaction } from "@/lib/paystack";
import Booking from "@/models/Booking";

export const metadata = { title: "Confirming your booking | Avenir" };

export default async function BookingCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  if (!reference) {
    return (
      <Result
        title="Something went wrong"
        message="No payment reference was given."
      />
    );
  }

  await connectDB();
  const booking = await Booking.findOne({
    paystackReference: reference,
  }).populate("listing", "name");
  if (!booking) {
    return (
      <Result
        title="Booking not found"
        message="We couldn't find a booking for that payment."
      />
    );
  }

  // The webhook is the real source of truth and may have already confirmed this.
  if (booking.status === "confirmed") {
    return (
      <Success
        listingName={(booking.listing as unknown as { name: string })?.name}
      />
    );
  }
  if (booking.status === "cancelled") {
    return (
      <Result
        title="Payment not completed"
        message="This booking was cancelled."
      />
    );
  }

  // Still pending_payment: ask Paystack directly rather than making the guest wait on the webhook.
  try {
    const result = await verifyTransaction(reference);
    if (
      result.status === "success" &&
      result.amount < Math.round(booking.amount * 100)
    ) {
      return (
        <Result
          title="Payment amount mismatch"
          message="The amount paid doesn't match this booking, so it wasn't confirmed. Please contact support with your payment reference."
        />
      );
    }
    if (result.status === "success") {
      booking.status = "confirmed";
      await booking.save();
      return (
        <Success
          listingName={(booking.listing as unknown as { name: string })?.name}
        />
      );
    }
    booking.status = "cancelled";
    await booking.save();
    return (
      <Result
        title="Payment not completed"
        message="Your payment wasn't successful, so this booking wasn't made. You haven't been charged."
      />
    );
  } catch {
    return (
      <Result
        title="Still confirming…"
        message="We couldn't reach Paystack to confirm this just now. Check your bookings page in a minute — if the payment went through, it'll show up there."
      />
    );
  }
}

function Success({ listingName }: { listingName?: string }) {
  return (
    <Result
      title="Booking confirmed"
      message={`Your stay${listingName ? ` at ${listingName}` : ""} is booked. A receipt was sent to your email.`}
      ok
    />
  );
}

function Result({
  title,
  message,
  ok = false,
}: {
  title: string;
  message: string;
  ok?: boolean;
}) {
  return (
    <div className="booking-callback">
      <h1 className={ok ? "booking-callback-ok" : "booking-callback-fail"}>
        {title}
      </h1>
      <p>{message}</p>
      <Link className="dashboard-add-button" href="/bookings">
        Go to your bookings
      </Link>
    </div>
  );
}
