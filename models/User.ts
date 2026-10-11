import { Schema, model, models, type Model } from "mongoose";

export interface IUser {
  email: string;
  passwordHash: string; // empty for accounts created via Google/Apple
  role: "user" | "owner" | "admin";
  // Set once an owner has added their payout bank details (see /api/account/payout).
  paystackSubaccountCode?: string;
  payoutBank?: { bankCode: string; bankName: string; accountNumber: string; accountName: string };
  // Set only while a password-reset link is active; cleared once used or expired.
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
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

export default (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
