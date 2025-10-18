/**
 * Tuition calculation utilities
 * Migrated from the Vue application's tuitioncalc.js
 */

export const MaxYearOverYearChange = 0.1;
export const InflationIncrease = 250;
export const Steepness = 1.56;
export const SiblingDiscountFactor = 0.5;
export const PartTimeDiscountFactor = 0.625;

export const DefaultMinimumIncome = 28000;
export const DefaultMaximumIncome = 120000;

export const DefaultMinimumTuition = 1000;
export const DefaultMaximumTuition = 12500;

export const FullTime = "Full Time";
export const PartTime = "Part Time";
export const NotAttending = "Not Attending";

interface Year {
  minimumTuition?: number;
  maximumTuition?: number;
  minimumIncome?: number;
  maximumIncome?: number;
}

interface TuitionOptions {
  year?: Year;
  fullTime?: number;
  partTime?: number;
  siblings?: number;
  inflationPeriods?: number;
}

/**
 * Calculates the total tuition amount for the provided income.
 * @param income The family's gross income
 * @param opts Configuration options for the calculation
 * @returns The calculated tuition amount
 */
export function tuitionForIncome(
  income: number | null | undefined,
  opts: TuitionOptions = {},
): number {
  // Collect most basic algorithmic options
  const year = opts.year || {};
  const inflationPeriods = Number.parseInt(String(opts.inflationPeriods || 0), 10);
  const minTuition = Number.parseFloat(String(year.minimumTuition || DefaultMinimumTuition));
  const maxTuition = Number.parseFloat(String(year.maximumTuition || DefaultMaximumTuition));
  const minIncome = Number.parseFloat(String(year.minimumIncome || DefaultMinimumIncome));
  const maxIncome = Number.parseFloat(String(year.maximumIncome || DefaultMaximumIncome));
  const fullTimeCount = Number.parseInt(String(opts.fullTime || 0), 10);
  const partTimeCount = Number.parseInt(String(opts.partTime || 0), 10);
  const siblingCount = Number.parseInt(String(opts.siblings || 0), 10);

  // If income wasn't entered, assume the maximum
  let incomeValue = income;
  if (incomeValue === null || incomeValue === undefined) {
    incomeValue = maxIncome;
  }

  // Calculate the base tuition
  let baseTuition: number;
  if (incomeValue <= minIncome) {
    baseTuition = minTuition;
    // Don't apply an inflation increase to minimum income
  } else if (incomeValue >= maxIncome) {
    baseTuition = (maxTuition / maxIncome) * incomeValue;
    baseTuition += inflationPeriods * InflationIncrease;
  } else {
    const incomeRange = maxIncome - minIncome;
    const tuitionRange = maxTuition - minTuition;
    const x = (incomeValue - minIncome) / incomeRange;
    const y = exponentTransform(x, Steepness);
    baseTuition = minTuition + tuitionRange * y;
    baseTuition += inflationPeriods * InflationIncrease;
  }

  // Determine multiples for the number of full time, part time and siblings
  const fullTimeFactor = fullTimeCount;
  const partTimeFactor = partTimeCount * PartTimeDiscountFactor;
  const siblingFactor = siblingCount * SiblingDiscountFactor;
  return Math.round(baseTuition * (fullTimeFactor + partTimeFactor + siblingFactor));
}

/**
 * Calculates the minimum acceptable tuition when the income number is
 * above the maximum income.
 * @param income The family's gross income
 * @param opts Configuration options for the calculation
 * @returns The calculated minimum tuition amount
 */
export function minimumTuitionForIncome(income: number, opts: TuitionOptions = {}): number {
  const year = opts.year || {};
  const maxIncome = Number.parseFloat(String(year.maximumIncome || DefaultMaximumIncome));
  if (income <= maxIncome) {
    return tuitionForIncome(income, opts);
  }
  return tuitionForIncome(maxIncome, opts);
}

/**
 * Returns 0 > y > 1, such that steepness of 1 is a 45-degree linear line
 * between 0,0 and 1,1, and higher steepnesses curve symmetrically towards
 * the 1,0 corner.
 * @param x The input value (0-1)
 * @param steepness The steepness factor
 * @returns The transformed value
 */
function exponentTransform(x: number, steepness: number): number {
  const adjustedSteepness = steepness + 0.01; // Needed to avoid exactly equalling 1.
  const numerator = adjustedSteepness ** x - 1;
  const denominator = adjustedSteepness - 1;
  return numerator / denominator;
}

/**
 * Calculate tuition options based on student decisions
 * @param studentDecisions The student attendance decisions object
 * @returns Object with fullTime, partTime, and siblings counts
 */
export function calculateTuitionOptions(studentDecisions: Record<string, string>): TuitionOptions {
  const opts: TuitionOptions = { fullTime: 0, partTime: 0, siblings: 0 };

  if (!studentDecisions || Object.keys(studentDecisions).length === 0) {
    return opts;
  }

  for (const studentID of Object.keys(studentDecisions)) {
    const enrollmentType = studentDecisions[studentID];
    switch (enrollmentType) {
      case FullTime: {
        if (opts.fullTime === 0) {
          opts.fullTime = 1;
        } else {
          opts.siblings = (opts.siblings || 0) + 1;
        }
        break;
      }
      case PartTime: {
        opts.partTime = (opts.partTime || 0) + 1;
        break;
      }
    }
  }

  return opts;
}

/**
 * Format a number as currency
 * @param value The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
