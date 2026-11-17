"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

/** One owner's commission box on the admin Owners page. Empty = the normal site-wide rate. */
export default function OwnerRateForm({
  id,
  current,
  defaultRate,
}: {
  id: string;
  current: number | null;
  defaultRate: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current === null ? "" : String(current));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/owners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionPercent: value.trim() === "" ? null : Number(value),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage({ text: data?.error ?? "Could not save.", ok: false });
        return;
      }
      setMessage({
        text:
          value.trim() === ""
            ? `Back to the normal ${defaultRate}%.`
            : "Saved.",
        ok: true,
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="owner-rate-form" onSubmit={save}>
      <label>
        <span className="sr-only">Commission percent</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={50}
          step="0.01"
          value={value}
          placeholder={String(defaultRate)}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Commission percent"
        />
        <span aria-hidden="true">%</span>
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
      {message && (
        <p
          className={message.ok ? "owner-block-ok" : "owner-block-error"}
          role="status"
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
