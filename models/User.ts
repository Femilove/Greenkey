import { Schema, model, models, type Model } from "mongoose";

export interface IUser {
  email: string;
  passwordHash: string; // empty for accounts created via Google/Apple
  role: "user" | "owner" | "admin";
  // Set once an owner has added their payout bank details (see /api/account/payout).
  paystackSubaccountCode?: string;
  payoutBank?: { bankCode: string; bankName: string; accountNumber: string; accountName: string };
  // Set only while a password-reset link is active; cleared once used or expired.
  // Set by the admin for one owner who has a special deal; empty means the site-wide commission applies.
  commissionPercent?: number;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    // "admin" is never set by the app itself — grant it by hand in the database (see README).
    role: { type: String, enum: ["user", "owner", "admin"], default: "user" },
    paystackSubaccountCode: { type: String },
    payoutBank: {
      bankCode: String,
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
    commissionPercent: { type: Number, min: 0, max: 50 },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// In development, hot reload can keep an OLD copy of this model that doesn't know newer fields
// (like commissionPercent), so Mongoose silently refuses to save them. Dropping the cached copy
// makes the current fields always apply. Production is unaffected.
if (process.env.NODE_ENV !== "production" && models.User) delete models.User;

export default (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
