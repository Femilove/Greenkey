import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { isValidWebhookSignature } from "@/lib/paystack";
import Booking from "@/models/Booking";

/**
 * Paystack calls this after every transaction. This; not the browser
 * redirect in /bookings/callback:- is the authoritative confirmation: a
 * guest can close the tab right after paying and this still fires.
 * Configure this URL (https://yourdomain.com/api/webhooks/paystack) in your
 * Paystack dashboard under Settings → API Keys & Webhooks.
 */
export async function POST(req: Request) {
  const rawBody = await req.text(); // must check the signature against the raw bytes, not parsed JSON
  if (!isValidWebhookSignature(rawBody, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data?.reference as string | undefined;
    if (reference) {
      await connectDB();
      // Idempotent: a webhook can legitimately be sent more than once for the same event.
      // Only confirm if the amount paid matches the booking total (Paystack reports kobo).
      const paidKobo = Number(event.data?.amount);
      const booking = await Booking.findOne({ paystackReference: reference, status: "pending_payment" });
      if (booking && paidKobo >= Math.round(booking.amount * 100)) {
        booking.status = "confirmed";
        await booking.save();
      } else if (booking) {
        console.error(`Paystack amount mismatch for ${reference}: paid ${paidKobo} kobo, expected ${Math.round(booking.amount * 100)}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
