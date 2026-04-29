/**
 * Jewellery Pricing Service
 * Central place for all pricing calculations
 */

/**
 * Calculate final price
 * Formula: final_price = base_price + making_charges - discount
 *
 * making_charges can be:
 *   - fixed amount (making_charges field)
 *   - OR percentage of base_price (making_charge_pct field)
 *
 * discount can be:
 *   - fixed amount (discount field)
 *   - OR percentage of (base_price + making_charges) (discount_pct field)
 */
const calculateFinalPrice = ({
  base_price,
  making_charges = 0,
  making_charge_pct = 0,
  discount = 0,
  discount_pct = 0,
}) => {
  const bp = parseFloat(base_price) || 0;

  // Resolve making charges
  let mc = 0;
  if (making_charge_pct > 0) {
    mc = (bp * parseFloat(making_charge_pct)) / 100;
  } else {
    mc = parseFloat(making_charges) || 0;
  }

  const subtotal = bp + mc;

  // Resolve discount
  let disc = 0;
  if (discount_pct > 0) {
    disc = (subtotal * parseFloat(discount_pct)) / 100;
  } else {
    disc = parseFloat(discount) || 0;
  }

  const final = Math.max(subtotal - disc, 0);

  return {
    base_price:        parseFloat(bp.toFixed(2)),
    making_charges:    parseFloat(mc.toFixed(2)),
    making_charge_pct: parseFloat(making_charge_pct),
    discount:          parseFloat(disc.toFixed(2)),
    discount_pct:      parseFloat(discount_pct),
    final_price:       parseFloat(final.toFixed(2)),
  };
};

/**
 * Apply country pricing — convert base AED price to other currencies
 * Pass exchangeRates: { USD: 0.272, INR: 22.6, QAR: 0.99 }
 */
const buildCountryPricing = (finalPriceAED, exchangeRates = {}) => {
  const result = { AED: parseFloat(finalPriceAED.toFixed(2)) };
  for (const [currency, rate] of Object.entries(exchangeRates)) {
    result[currency] = parseFloat((finalPriceAED * rate).toFixed(2));
  }
  return result;
};

/**
 * Apply promo code to a cart total
 */
const applyPromoCode = (promo, orderTotal) => {
  if (!promo || !promo.is_active) return { discount: 0, final: orderTotal };
  if (promo.min_order && orderTotal < promo.min_order) {
    return { discount: 0, final: orderTotal, error: `Minimum order amount is ${promo.min_order}` };
  }
  let discount = 0;
  if (promo.type === 'percent') {
    discount = (orderTotal * parseFloat(promo.value)) / 100;
    if (promo.max_discount) discount = Math.min(discount, parseFloat(promo.max_discount));
  } else {
    discount = parseFloat(promo.value);
  }
  return {
    discount: parseFloat(discount.toFixed(2)),
    final: parseFloat(Math.max(orderTotal - discount, 0).toFixed(2)),
  };
};

/**
 * Apply VAT
 */
const applyTax = (amount, taxPercent = 0, taxClass = 'standard') => {
  if (taxClass === 'exempt') return { tax: 0, total: parseFloat(amount.toFixed(2)) };
  const rate = taxClass === 'reduced' ? taxPercent / 2 : taxPercent;
  const tax = (parseFloat(amount) * rate) / 100;
  return {
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat((parseFloat(amount) + tax).toFixed(2)),
  };
};

module.exports = { calculateFinalPrice, buildCountryPricing, applyPromoCode, applyTax };
