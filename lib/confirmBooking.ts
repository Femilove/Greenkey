import type { HydratedDocument } from "mongoose";
import { sendEmail } from "@/lib/email";
import BlockedDate from "@/models/BlockedDate";
import Booking, { type IBooking } from "@/models/Booking";

/**
 * Called once Paystack says a booking was paid. Normally this just marks it confirmed. But a
 * guest can pay after the 30-minute date hold ended; if someone else got those dates in the
 * meantime (or the owner blocked them), confirming would double-book the home. In that case
 * the booking is cancelled, flagged `refundNeeded`, and you are emailed (set ADMIN_EMAIL) so
 * you can refund the guest in the Paystack dashboard.
 */
export async function confirmPaidBooking(booking: HydratedDocument<IBooking>): Promise<"confirmed" | "conflict"> {
  const overlap = { checkIn: { $lt: booking.checkOut }, checkOut: { $gt: booking.checkIn } };
  const [otherBooking, blocked] = await Promise.all([
    Booking.exists({ _id: { $ne: booking._id }, listing: booking.listing, status: "confirmed", ...overlap }),
    BlockedDate.exists({ listing: booking.listing, ...overlap }),
  ]);

  if (!otherBooking && !blocked) {
    booking.status = "confirmed";
    await booking.save();
    return "confirmed";
  }

  booking.status = "cancelled";
  booking.refundNeeded = true;
  await booking.save();

  const detail = `Reference ${booking.paystackReference}, NGN ${booking.amount}, ${booking.checkIn} to ${booking.checkOut}.`;
  console.error(`REFUND NEEDED: a late payment clashed with another booking or blocked dates. ${detail}`);
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim();
  if (adminEmail) {
    try {
      await sendEmail({
        to: adminEmail,
        subject: "Avenir: refund needed for a late payment",
        html: `<p>A guest paid after the dates were taken by someone else (or blocked by the owner), so the booking was <strong>not</strong> confirmed.</p><p>${detail}</p><p>Please refund this payment in your Paystack dashboard (Transactions, open the payment, Refund).</p>`,
      });
    } catch (err) {
      console.error("Could not email the refund notice:", err);
    }
  }
  return "conflict";
}
