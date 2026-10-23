import { Schema, model, models, type Model, type Types } from "mongoose";

/** Dates an owner has marked as taken (own stay, a phone or cash booking). Guests can't book them. */
export interface IBlockedDate {
  listing: Types.ObjectId;
  owner: Types.ObjectId;
  checkIn: string; // YYYY-MM-DD; like bookings, the check-out day itself stays free
  checkOut: string;
  note?: string;
}

const BlockedDateSchema = new Schema<IBlockedDate>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    note: { type: String, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

export default (models.BlockedDate as Model<IBlockedDate>) || model<IBlockedDate>("BlockedDate", BlockedDateSchema);
