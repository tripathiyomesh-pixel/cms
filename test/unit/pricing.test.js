const { calculateFinalPrice, applyPromoCode, applyTax, buildCountryPricing } = require('../../src/common/pricing.service');

describe('Pricing Service', () => {

  describe('calculateFinalPrice', () => {
    it('calculates with fixed making charges and fixed discount', () => {
      const result = calculateFinalPrice({ base_price: 1000, making_charges: 200, discount: 100 });
      expect(result.final_price).toBe(1100);
      expect(result.making_charges).toBe(200);
      expect(result.discount).toBe(100);
    });

    it('calculates with percentage making charges', () => {
      const result = calculateFinalPrice({ base_price: 1000, making_charge_pct: 10 });
      expect(result.making_charges).toBe(100);
      expect(result.final_price).toBe(1100);
    });

    it('calculates with percentage discount', () => {
      const result = calculateFinalPrice({ base_price: 1000, making_charges: 200, discount_pct: 10 });
      expect(result.discount).toBe(120);
      expect(result.final_price).toBe(1080);
    });

    it('never returns negative final price', () => {
      const result = calculateFinalPrice({ base_price: 100, discount: 500 });
      expect(result.final_price).toBe(0);
    });

    it('handles zero values correctly', () => {
      const result = calculateFinalPrice({ base_price: 2500 });
      expect(result.final_price).toBe(2500);
      expect(result.making_charges).toBe(0);
      expect(result.discount).toBe(0);
    });

    it('returns all fields with 2 decimal precision', () => {
      const result = calculateFinalPrice({ base_price: 999.999, making_charges: 100.001 });
      expect(result.base_price).toBe(1000.00);
      expect(Number.isInteger(result.final_price * 100)).toBe(true);
    });
  });

  describe('applyPromoCode', () => {
    const basePromo = { is_active: true, type: 'percent', value: 10, min_order: 500 };

    it('applies percentage discount correctly', () => {
      const result = applyPromoCode(basePromo, 1000);
      expect(result.discount).toBe(100);
      expect(result.final).toBe(900);
    });

    it('applies fixed discount correctly', () => {
      const promo = { ...basePromo, type: 'fixed', value: 150 };
      const result = applyPromoCode(promo, 1000);
      expect(result.discount).toBe(150);
      expect(result.final).toBe(850);
    });

    it('returns error when order is below minimum', () => {
      const result = applyPromoCode(basePromo, 300);
      expect(result.error).toBeDefined();
      expect(result.discount).toBe(0);
    });

    it('respects max_discount cap', () => {
      const promo = { ...basePromo, type: 'percent', value: 50, max_discount: 200 };
      const result = applyPromoCode(promo, 2000);
      expect(result.discount).toBe(200);
    });

    it('returns zero discount for inactive promo', () => {
      const result = applyPromoCode({ ...basePromo, is_active: false }, 1000);
      expect(result.discount).toBe(0);
    });

    it('returns zero discount for null promo', () => {
      const result = applyPromoCode(null, 1000);
      expect(result.discount).toBe(0);
    });
  });

  describe('applyTax', () => {
    it('applies 5% VAT correctly', () => {
      const result = applyTax(1000, 5, 'standard');
      expect(result.tax).toBe(50);
      expect(result.total).toBe(1050);
    });

    it('skips tax for exempt class', () => {
      const result = applyTax(1000, 5, 'exempt');
      expect(result.tax).toBe(0);
      expect(result.total).toBe(1000);
    });

    it('halves rate for reduced class', () => {
      const result = applyTax(1000, 5, 'reduced');
      expect(result.tax).toBe(25);
    });
  });

  describe('buildCountryPricing', () => {
    it('converts AED to multiple currencies', () => {
      const rates = { USD: 0.272, INR: 22.6, QAR: 0.99 };
      const result = buildCountryPricing(1000, rates);
      expect(result.AED).toBe(1000);
      expect(result.USD).toBe(272);
      expect(result.INR).toBe(22600);
    });

    it('returns only AED when no rates given', () => {
      const result = buildCountryPricing(500);
      expect(Object.keys(result)).toEqual(['AED']);
    });
  });
});
