"use client";

import { useEffect, useState } from "react";

interface Bank {
  name: string;
  code: string;
}
interface CurrentPayout {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export default function PayoutForm() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [current, setCurrent] = useState<CurrentPayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [banksRes, payoutRes] = await Promise.all([
          fetch("/api/paystack/banks"),
          fetch("/api/account/payout"),
        ]);
        const banksData = await banksRes.json().catch(() => null);
        const payoutData = await payoutRes.json().catch(() => null);
        if (banksRes.ok) setBanks(banksData.banks ?? []);
        if (payoutRes.ok && payoutData.payoutBank)
          setCurrent(payoutData.payoutBank);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Re-check the account number + bank combination whenever either settles, before letting them save.
  useEffect(() => {
    setResolvedName("");
    setResolveError("");
    if (!/^\d{10}$/.test(accountNumber) || !bankCode) return;

    const timer = setTimeout(async () => {
      setResolving(true);
      try {
        const res = await fetch("/api/account/resolve-bank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber, bankCode }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setResolveError(data?.error ?? "Could not verify that account.");
          return;
        }
        setResolvedName(data.accountName);
      } finally {
        setResolving(false);
      }
    }, 500); // debounce while they finish typing the account number

    return () => clearTimeout(timer);
  }, [accountNumber, bankCode]);

  async function handleSave() {
    if (!resolvedName) return;
    setSaving(true);
    setSaveError("");
    try {
      const bankName = banks.find((b) => b.code === bankCode)?.name ?? "";
      const res = await fetch("/api/account/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber,
          bankCode,
          bankName,
          businessName: businessName || resolvedName,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSaveError(data?.error ?? "Could not save your payout details.");
        return;
      }
      setCurrent({ bankName, accountNumber, accountName: resolvedName });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="payout-form">
      {current && !saved && (
        <div className="payout-current">
          <p className="payout-current-label">Payouts currently go to</p>
          <p className="payout-current-detail">
            {current.accountName || "Unknown name"} ·{" "}
            {current.bankName || "Unknown bank"} · ****
            {current.accountNumber?.slice(-4) ?? "----"}
          </p>
          <p className="payout-current-note">
            Saving new details below replaces this.
          </p>
        </div>
      )}

      {saved ? (
        <p className="payout-saved">
          Payout account saved. New bookings on your listings will now pay out
          here.
        </p>
      ) : (
        <>
          <label className="listing-form-field">
            Bank
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
            >
              <option value="">Choose your bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="listing-form-field">
            Account number
            <input
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="10-digit NUBAN account number"
            />
          </label>

          <div className="payout-resolve-status">
            {resolving && <span>Checking account…</span>}
            {resolvedName && (
              <span className="payout-resolve-success">
                Account name: {resolvedName}
              </span>
            )}
            {resolveError && (
              <span className="payout-resolve-error">{resolveError}</span>
            )}
          </div>

          <label className="listing-form-field">
            Business / listing account name{" "}
            <span className="listing-form-optional">
              (shown on your Paystack subaccount)
            </span>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={resolvedName || "Defaults to the account name above"}
            />
          </label>

          {saveError && <p className="listing-form-error">{saveError}</p>}

          <button
            type="button"
            className="payout-save-button"
            disabled={!resolvedName || saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save payout details"}
          </button>
        </>
      )}
    </div>
  );
}
