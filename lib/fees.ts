/**
 * Money rules shared by the server (checkout) and the browser (price summary), so the
 * numbers a guest sees are always the ones they are charged. No server-only imports here.
 *
 * Paystack charges 1.5% + NGN 100 on local payments (the NGN 100 is waived under NGN 2,500)
 * and never more than NGN 2,000. The guest pays that charge on top of the stay price, so the
 * owner and Avenir get their full shares. If Paystack changes its prices, update these four.
 */
export const PAYSTACK_PERCENT = 1.5;
export const PAYSTACK_FLAT = 100;
export const PAYSTACK_FLAT_WAIVED_BELOW = 2500;
export const PAYSTACK_CAP = 2000;

/** What Paystack takes from a payment of `total` NGN. */
export function paystackFee(total: number) {
  const fee = (total * PAYSTACK_PERCENT) / 100 + (total >= PAYSTACK_FLAT_WAIVED_BELOW ? PAYSTACK_FLAT : 0);
  return Math.min(fee, PAYSTACK_CAP);
}

/**
 * The fee to add to a stay price (`base`, NGN) so that after Paystack takes its charge from the
 * total, exactly `base` is left. Rounded up to a whole naira so we are never a few kobo short.
 */
export function guestServiceFee(base: number) {
  if (!(base > 0)) return 0;
  const rate = PAYSTACK_PERCENT / 100;
  let total = base / (1 - rate);
  if (total >= PAYSTACK_FLAT_WAIVED_BELOW) {
    total = (base + PAYSTACK_FLAT) / (1 - rate);
    if (total * rate + PAYSTACK_FLAT > PAYSTACK_CAP) total = base + PAYSTACK_CAP; // the cap applies
  }
  return Math.ceil(total) - base;
}

/** Avenir's cut of the stay price (NGN). */
export const commissionOf = (base: number, percent: number) => Math.round((base * percent) / 100);

/** What the owner receives for a stay priced at `base` NGN. */
export const ownerReceives = (base: number, percent: number) => base - commissionOf(base, percent);
