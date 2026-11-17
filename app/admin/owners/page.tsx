import OwnerRateForm from "@/components/admin/OwnerRateForm";
import { getOwnersForAdmin } from "@/lib/commission";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/paystack";

export const metadata = { title: "Owners | Avenir" };
export const dynamic = "force-dynamic";

export default async function AdminOwnersPage() {
  const owners = await getOwnersForAdmin();

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-head">
        <h1>Owners</h1>
        <span className="review-count">
          {owners.length} {owners.length === 1 ? "owner" : "owners"}
        </span>
      </div>

      <p className="owner-fee-notice">
        Everyone pays the normal commission of {PLATFORM_COMMISSION_PERCENT}%
        unless you type a different percentage next to their name. Leave the box
        empty to use the normal rate. A new rate applies to bookings made after
        you save it; bookings already made keep the rate they were made at.
      </p>

      {owners.length === 0 ? (
        <div className="dashboard-empty">
          <p>No owners yet.</p>
        </div>
      ) : (
        <ul className="admin-owner-list">
          {owners.map((o) => (
            <li className="admin-owner-row" key={o.id}>
              <div className="admin-owner-info">
                <strong>{o.email}</strong>
                <span>
                  {o.listings} {o.listings === 1 ? "listing" : "listings"}
                </span>
              </div>
              <div className="admin-owner-rate">
                <span
                  className={
                    o.commissionPercent === null
                      ? "owner-booking-pill owner-booking-pill-wait"
                      : "owner-booking-pill owner-booking-pill-ok"
                  }
                >
                  {o.commissionPercent === null
                    ? `Normal rate (${PLATFORM_COMMISSION_PERCENT}%)`
                    : `Special rate: ${o.commissionPercent}%`}
                </span>
                <OwnerRateForm
                  id={o.id}
                  current={o.commissionPercent}
                  defaultRate={PLATFORM_COMMISSION_PERCENT}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
