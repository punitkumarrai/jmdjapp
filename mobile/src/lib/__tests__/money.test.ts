import { 
  rupeesToPaise, 
  paiseToRupees, 
  gramsToMg, 
  mgToGrams, 
  formatCurrency, 
  estimatePrice 
} from '../money';

describe('money.ts - Indian Jewellery Calculation Engine', () => {
  describe('Conversion Helpers', () => {
    it('converts rupees to paise', () => {
      expect(rupeesToPaise(1)).toBe(100n);
      expect(rupeesToPaise(7750)).toBe(775000n);
      expect(rupeesToPaise(12.34)).toBe(1234n);
    });

    it('converts paise to rupees', () => {
      expect(paiseToRupees(100n)).toBe(1);
      expect(paiseToRupees(775000n)).toBe(7750);
    });

    it('converts grams to mg', () => {
      expect(gramsToMg(1)).toBe(1000n);
      expect(gramsToMg(12.345)).toBe(12345n);
    });

    it('converts mg to grams', () => {
      expect(mgToGrams(1000n)).toBe(1);
      expect(mgToGrams(12345n)).toBe(12.345);
    });
  });

  describe('formatCurrency', () => {
    it('formats clean rupees without decimals', () => {
      expect(formatCurrency(775000n)).toBe('₹7,750');
    });

    it('formats fractional rupees with decimals', () => {
      expect(formatCurrency(775050n)).toBe('₹7,750.50');
    });
  });

  describe('estimatePrice', () => {
    it('Test 1: rate ₹7,750/g, weight 10.000 g, making 10%', () => {
      const result = estimatePrice({
        ratePaisePerGram: rupeesToPaise(7750),
        weightMg: gramsToMg(10.000),
        makingPercent: 10n
      });

      expect(result.displayRupees).toBe(87808n);
      expect(result.subtotalPaise).toBe(8525000n); // ₹85,250
      expect(result.gstPaise).toBe(255750n); // ₹2,557.50
    });

    it('Test 2: rate ₹7,750/g, weight 10.000 g, making 0%', () => {
      const result = estimatePrice({
        ratePaisePerGram: rupeesToPaise(7750),
        weightMg: gramsToMg(10.000),
        makingPercent: 0n
      });

      expect(result.displayRupees).toBe(79825n);
    });

    it('Test 3: rate ₹92/g, weight 10.000 g, making 5%', () => {
      const result = estimatePrice({
        ratePaisePerGram: rupeesToPaise(92),
        weightMg: gramsToMg(10.000),
        makingPercent: 5n
      });

      expect(result.displayRupees).toBe(995n);
      expect(result.subtotalPaise).toBe(96600n); // ₹966
      expect(result.gstPaise).toBe(2898n); // ₹28.98
    });

    it('Edge Case: weight 0, making 0', () => {
      const result = estimatePrice({
        ratePaisePerGram: rupeesToPaise(7750),
        weightMg: 0n,
        makingPercent: 0n
      });

      expect(result.displayRupees).toBe(0n);
      expect(result.subtotalPaise).toBe(0n);
      expect(result.gstPaise).toBe(0n);
    });

    it('Edge Case: fractional weight 12.345 g, making 15%', () => {
      const result = estimatePrice({
        ratePaisePerGram: rupeesToPaise(7750),
        weightMg: gramsToMg(12.345),
        makingPercent: 15n
      });
      // P = 775,000; W = 12,345; m = 15
      // Numerator = 775,000 * 12,345 * 115 * 103 = 113,325,556,875,000
      // displayRupees = 113,325,556,875,000 / 1,000,000,000 rounded = 113,326
      expect(result.displayRupees).toBe(113326n);
    });

    it('Edge Case: large weight without precision loss (1000kg)', () => {
      const result = estimatePrice({
        ratePaisePerGram: rupeesToPaise(8000),
        weightMg: gramsToMg(1000000), // 1000 kg
        makingPercent: 20n
      });
      // P = 800,000; W = 1,000,000,000; m = 20
      // Numerator = 800,000 * 1,000,000,000 * 120 * 103 = 9,888,000,000,000,000,000
      // displayRupees = 9,888,000,000
      expect(result.displayRupees).toBe(9888000000n);
    });

    it('rejects invalid inputs', () => {
      expect(() => estimatePrice({
        ratePaisePerGram: -1n,
        weightMg: 1000n,
        makingPercent: 5n
      })).toThrow("Rate cannot be negative");

      expect(() => estimatePrice({
        ratePaisePerGram: 100n,
        weightMg: -1n,
        makingPercent: 5n
      })).toThrow("Weight cannot be negative");

      expect(() => estimatePrice({
        ratePaisePerGram: 100n,
        weightMg: 1000n,
        makingPercent: 26n
      })).toThrow("Making percent must be between 0 and 25");
    });
  });
});
