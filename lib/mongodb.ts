import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

// Cache the connection so dev hot-reloads don't open a new one each time.
const globalCache = globalThis as unknown as { _mongoose?: Promise<typeof mongoose> };

export default function connectDB() {
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");
  // If the first attempt fails, drop the cached promise so the next request retries
  // instead of replaying the same rejection until the server restarts.
  return (globalCache._mongoose ??= mongoose.connect(uri).catch((err) => {
    globalCache._mongoose = undefined;
    throw err;
  }));
}
