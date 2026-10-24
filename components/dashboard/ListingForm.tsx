"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { CITIES, MAX_PHOTOS, type Property } from "@/types/property";

interface Props {
  commissionPercent?: number; // Avenir's cut, shown so owners know what they will earn
  mode: "create" | "edit";
  id?: string;
  initial?: Property;
}

export default function ListingForm({
  mode,
  id,
  initial,
  commissionPercent,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  // All photos in order; the first one is the cover shown on /homes and first on the listing page.
  const [images, setImages] = useState<string[]>(
    initial?.images?.length
      ? initial.images
      : initial?.image
        ? [initial.image]
        : [],
  );
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [discount, setDiscount] = useState(initial?.discount?.toString() ?? "");
  const [city, setCity] = useState(initial?.location.city ?? CITIES[0]);
  const [area, setArea] = useState(initial?.location.area ?? "");
  const [address, setAddress] = useState(initial?.location.address ?? "");
  const [bedrooms, setBedrooms] = useState(
    initial?.bedrooms?.toString() ?? "1",
  );
  const [maxGuests, setMaxGuests] = useState(
    initial?.maxGuests?.toString() ?? "2",
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // lets the owner pick the same file again later
    if (!files.length) return;

    const room = MAX_PHOTOS - images.length;
    if (room <= 0)
      return setUploadError(`You can add up to ${MAX_PHOTOS} photos.`);
    setUploading(true);
    setUploadError("");

    const added: string[] = [];
    let failed = false;
    try {
      // One at a time, in the order picked, so the first photo chosen stays first.
      for (const file of files.slice(0, room)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setUploadError(
            `${file.name}: ${data?.error ?? "could not be uploaded."}`,
          );
          failed = true;
          break;
        }
        added.push(data.url);
      }
      if (!failed && files.length > room)
        setUploadError(
          `Only ${MAX_PHOTOS} photos are allowed, so some weren't added.`,
        );
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    } finally {
      if (added.length) setImages((prev) => [...prev, ...added]);
      setUploading(false);
    }
  }

  const removePhoto = (i: number) =>
    setImages((prev) => prev.filter((_, n) => n !== i));
  const makeCover = (i: number) =>
    setImages((prev) => [prev[i], ...prev.filter((_, n) => n !== i)]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!images.length)
      return setError("Add at least one photo before submitting.");
    setPending(true);
    setError("");

    const body = {
      name,
      type,
      image: images[0],
      images,
      imageAlt,
      price: Number(price),
      discount: discount === "" ? undefined : Number(discount),
      bedrooms: Number(bedrooms),
      maxGuests: Number(maxGuests),
      location: { city, area, address },
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/listings" : `/api/listings/${id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Could not save this listing.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="listing-form" onSubmit={handleSubmit}>
      <div className="listing-form-grid">
        <label className="listing-form-field listing-form-field-wide">
          Name
          <input
            required
            minLength={3}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 3 bed apartment in Lekki"
          />
        </label>

        <label className="listing-form-field">
          Type
          <input
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g. apartment, house, hotel"
          />
        </label>

        <label className="listing-form-field">
          Price per night (NGN)
          <input
            required
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label className="listing-form-field">
          Discount % <span className="listing-form-optional">(optional)</span>
          <input
            type="number"
            min={0}
            max={90}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </label>

        {commissionPercent ? (
          <p className="owner-fee-notice listing-form-wide">
            Avenir keeps {commissionPercent}% of each booking's stay price.
            Guests pay the payment processing fee on top, so you receive{" "}
            {100 - commissionPercent}% of the price you set.
            {Number(price) > 0 &&
              (() => {
                const night = Math.round(
                  Number(price) * (1 - (Number(discount) || 0) / 100),
                );
                return ` For example, a night at NGN ${night.toLocaleString("en-NG")} pays you NGN ${(night - Math.round((night * commissionPercent) / 100)).toLocaleString("en-NG")}.`;
              })()}
          </p>
        ) : null}

        <label className="listing-form-field">
          City
          <select
            required
            value={city}
            onChange={(e) => setCity(e.target.value as typeof city)}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="listing-form-field">
          Area <span className="listing-form-optional">(optional)</span>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Lekki"
          />
        </label>

        <label className="listing-form-field">
          Bedrooms
          <input
            required
            type="number"
            min={1}
            max={20}
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </label>

        <label className="listing-form-field">
          Max guests
          <input
            required
            type="number"
            min={1}
            max={50}
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
          />
        </label>

        <label className="listing-form-field listing-form-field-wide">
          Address{" "}
          <span className="listing-form-optional">
            (optional, shown to guests who book)
          </span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        <label className="listing-form-field listing-form-field-wide">
          Image description{" "}
          <span className="listing-form-optional">
            (optional, for accessibility)
          </span>
          <input
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Defaults to the listing name"
          />
        </label>
      </div>

      <div className="listing-form-photo">
        <span className="listing-form-photo-label">Photos</span>

        {images.length > 0 && (
          <ul className="listing-form-thumbs">
            {images.map((src, i) => (
              <li key={src} className="listing-form-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element -- a plain preview of an already-uploaded file */}
                <img src={src} alt="" />
                {i === 0 && (
                  <span className="listing-form-thumb-cover">Cover</span>
                )}
                <div className="listing-form-thumb-actions">
                  {i > 0 && (
                    <button type="button" onClick={() => makeCover(i)}>
                      Make cover
                    </button>
                  )}
                  <button type="button" onClick={() => removePhoto(i)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="listing-form-upload-button"
          disabled={uploading || images.length >= MAX_PHOTOS}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading
            ? "Uploading…"
            : images.length
              ? "Add more photos"
              : "Upload photos"}
        </button>
        <span className="listing-form-hint">
          JPG, PNG, WEBP or GIF, up to 4MB each. You can add up to {MAX_PHOTOS},
          or just one.
        </span>
        <span className="listing-form-hint">
          Uploading more than one? The first photo is the one guests see first
          on the homes page and on your listing page. The rest can be flipped
          through with arrows on the listing page.
        </span>

        {uploadError && <p className="listing-form-error">{uploadError}</p>}
      </div>

      <p className="listing-form-note">
        {mode === "create"
          ? "New listings need admin approval before they're visible to guests."
          : "Saving changes sends this listing back for admin approval."}
      </p>

      {error && (
        <p className="listing-form-error" role="alert">
          {error}
        </p>
      )}

      <div className="listing-form-actions">
        <button type="submit" disabled={pending || uploading}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Submit for approval"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
