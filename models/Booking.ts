import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IBooking {
  listing: Types.ObjectId;
  user: Types.ObjectId;
  checkIn: string; // YYYY-MM-DD; the check-out day itself is free for the next guest
  checkOut: string;
  guests: number;
  status: "pending_payment" | "confirmed" | "cancelled";
  // Money fields are set once, at checkout time — never recomputed from the live
  // listing price later, so a price change afterwards can't alter a past booking.
  amount: number; // total paid, in NGN (naira, not kobo)
  commission: number; // the platform's cut, in NGN
  paystackReference: string;
  // Set when a late payment clashed with other dates: the booking was not confirmed and the guest must be refunded.
  refundNeeded?: boolean;
}

const BookingSchema = new Schema<IBooking>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ["pending_payment", "confirmed", "cancelled"], default: "pending_payment", index: true },
    amount: { type: Number, required: true },
    commission: { type: Number, required: true, default: 0 },
    paystackReference: { type: String, required: true, unique: true },
    refundNeeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (models.Booking as Model<IBooking>) || model<IBooking>("Booking", BookingSchema);
