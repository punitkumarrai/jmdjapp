/**
 * JMDJ App - Core Money Math
 *
 * ALL currency and weight math lives here.
 * We use integer BigInt arithmetic exclusively to prevent floating point errors.
 * 
 * Money: integer paise (₹1 = 100 paise)
 * Weight: integer milligrams (1g = 1000 mg)
 * 
 * Rounding rule: Round half up, applied ONCE at the very end of calculations.
 */

/** Converts rupees (number) to paise (BigInt) */
export function rupeesToPaise(rupees: number): bigint {
  if (rupees < 0) throw new Error("Rupees cannot be negative");
  return BigInt(Math.round(rupees * 100));
}

/** Converts paise (BigInt) to rupees (number) */
export function paiseToRupees(paise: bigint): number {
  return Number(paise) / 100;
}

/** Converts grams (number) to milligrams (BigInt) */
export function gramsToMg(grams: number): bigint {
  if (grams < 0) throw new Error("Grams cannot be negative");
  return BigInt(Math.round(grams * 1000));
}

/** Converts milligrams (BigInt) to grams (number) */
export function mgToGrams(mg: bigint): number {
  return Number(mg) / 1000;
}

/** 
 * Formats paise into an Indian Rupee string (e.g. ₹7,750.00 or ₹7,750).
 * Defaults to avoiding decimal places if it's a clean whole rupee, 
 * but standard Indian grouping (10,00,000) is applied.
 */
export function formatCurrency(paise: bigint | number): string {
  const p = typeof paise === 'number' ? BigInt(Math.round(paise)) : paise;
  const rupees = Number(p) / 100;
  
  // Using 'en-IN' for Indian comma grouping (lakhs/crores)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number(p % 100n) === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export interface EstimateInput {
  ratePaisePerGram: bigint;
  weightMg: bigint;
  makingPercent: bigint;
}

export interface EstimateResult {
  metalValuePaise: bigint;
  makingPaise: bigint;
  subtotalPaise: bigint;
  gstPaise: bigint;
  displayRupees: bigint;
}

/**
 * Calculates the exact standard Indian jewellery estimate.
 * 
 * WHY IS THE MATH DONE THIS WAY?
 * --------------------------------
 * Step-by-step logic:
 *   metal_value = (Rate / 1000) * Weight
 *   making      = metal_value * (Making% / 100)
 *   subtotal    = metal_value + making
 *   gst         = subtotal * (3 / 100)
 *   total_paise = subtotal + gst = subtotal * 1.03
 * 
 * If we substitute everything into one equation for the final total in Paise:
 *   Total Paise = [Rate * Weight / 1000] * [(100 + Making%) / 100] * [103 / 100]
 *               = (Rate * Weight * (100 + Making) * 103) / 10,000,000
 * 
 * To get the display value in Rupees, we divide by 100:
 *   Total Rupees = (Rate * Weight * (100 + Making) * 103) / 1,000,000,000
 * 
 * We do all multiplication first, then divide by 1,000,000,000 exactly once 
 * at the very end to avoid intermediate truncation loss.
 */
export function estimatePrice(input: EstimateInput): EstimateResult {
  const P = input.ratePaisePerGram;
  const W = input.weightMg;
  const m = input.makingPercent;

  // Validation
  if (P < 0n) throw new Error("Rate cannot be negative");
  if (W < 0n) throw new Error("Weight cannot be negative");
  if (m < 0n || m > 25n) throw new Error("Making percent must be between 0 and 25");

  // Exact Breakdown (rounded to nearest paise for display/logging)
  // + (divisor / 2) is the integer way to "round half up"
  const metalValuePaise = (P * W + 500n) / 1000n;
  const makingPaise = (P * W * m + 50_000n) / 100_000n;
  const subtotalPaise = (P * W * (100n + m) + 50_000n) / 100_000n;
  const gstPaise = (P * W * (100n + m) * 3n + 5_000_000n) / 10_000_000n;

  // Final Total (done in one chained step, rounded to nearest Rupee)
  const numerator = P * W * (100n + m) * 103n;
  const denominator = 1_000_000_000n;
  const halfDenominator = 500_000_000n; // for rounding half up

  const displayRupees = (numerator + halfDenominator) / denominator;

  return {
    metalValuePaise,
    makingPaise,
    subtotalPaise,
    gstPaise,
    displayRupees
  };
}
