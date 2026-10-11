import { NextResponse } from "next/server";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB — stays under Vercel's 4.5MB request body limit
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Uploads a listing photo to Cloudinary and returns its permanent URL. */
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "owner") {
    return NextResponse.json({ error: "Only listing accounts can upload photos." }, { status: 403 });
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local." },
      { status: 500 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WEBP or GIF image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 4MB." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "air-listings",
      resource_type: "image",
    });
    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 502 });
  }
}
