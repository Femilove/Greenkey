import { Schema, model, models, type Model } from "mongoose";

/**
 * A sign-up that has been started but not yet confirmed with the emailed code.
 * No real User exists until the code is verified. Documents delete themselves
 * (TTL index) shortly after the code expires.
 */
export interface IPendingSignup {
  email: string;
  passwordHash: string;
  role: "user" | "owner";
  codeHash: string;
  expiresAt: Date;
  attempts: number; // wrong guesses against the current code
  lastSentAt: Date;
}

const PendingSignupSchema = new Schema<IPendingSignup>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "owner"], default: "user" },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 3600 } }, // removed 1 hour after the code expires
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, required: true },
});

if (process.env.NODE_ENV !== "production" && models.PendingSignup) delete models.PendingSignup;

export default (models.PendingSignup as Model<IPendingSignup>) || model<IPendingSignup>("PendingSignup", PendingSignupSchema);
