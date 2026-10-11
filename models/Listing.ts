import { Schema, model, models, deleteModel, type Model, type Types } from "mongoose";
import { CITIES, type City, type ListingStatus } from "@/types/property";

export interface IListing {
  owner: Types.ObjectId;
  name: string;
  type: string;
  image: string; // cover photo (always equals images[0] when images is set)
  images?: string[]; // all photos in order, cover first
  imageAlt?: string;
  price: number;
  discount?: number; // percent
  location: { city: City; area?: string; address?: string };
  bedrooms: number;
  maxGuests: number;
  status: ListingStatus;
}

const ListingSchema = new Schema<IListing>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, required: true, trim: true, lowercase: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    imageAlt: String,
    price: { type: Number, required: true, min: 1 },
    discount: { type: Number, min: 0, max: 90 },
    location: {
      city: { type: String, enum: [...CITIES], required: true, index: true },
      area: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    bedrooms: { type: Number, required: true, min: 1, default: 1 },
    maxGuests: { type: Number, required: true, min: 1, default: 2 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

// In dev, hot reload keeps the first compiled model alive, so a newly added field (like `images`)
// would be silently dropped on save until the server restarts. Re-register it each time in dev.
if (process.env.NODE_ENV !== "production" && models.Listing) deleteModel("Listing");

export default (models.Listing as Model<IListing>) || model<IListing>("Listing", ListingSchema);
