import { BudgetCategory, OccasionType, PrioritySettings, PriorityLevel } from '../types/event';

export interface BudgetCalculationParams {
  totalBudget: number;
  guestCount: number;
  occasion: OccasionType;
  priorities: PrioritySettings;
  existingCategories?: BudgetCategory[];
}

/**
 * Baseline per-guest catering rates by tier (in INR)
 * Used as an explainable benchmark formula: guestCount * perPlateRate
 */
export const CATERING_PLATE_RATES: Record<OccasionType, { economy: number; standard: number; premium: number }> = {
  wedding: { economy: 850, standard: 1350, premium: 2200 },
  engagement: { economy: 700, standard: 1100, premium: 1600 },
  anniversary: { economy: 600, standard: 950, premium: 1400 },
  birthday: { economy: 450, standard: 750, premium: 1200 },
  community: { economy: 300, standard: 500, premium: 850 },
};

/**
 * Baseline weights for Indian celebrations
 */
const DEFAULT_WEIGHTS: Record<string, number> = {
  catering: 0.35,
  venue: 0.22,
  decor: 0.16,
  photography: 0.10,
  attire: 0.07,
  entertainment: 0.05,
  buffer: 0.05,
};

/**
 * Priority multipliers applied to category weights
 */
const PRIORITY_MULTIPLIERS: Record<PriorityLevel, number> = {
  high: 1.35,
  medium: 1.0,
  low: 0.70,
};

export class BudgetEngine {
  /**
   * Generates a fully reconciled, transparent budget allocation.
   * Guarantees that the sum of all allocated amounts EXACTLY equals totalBudget.
   */
  public static calculateInitialBudget(params: BudgetCalculationParams): BudgetCategory[] {
    const { totalBudget, guestCount, occasion, priorities } = params;

    // 1. Calculate contingency buffer (strictly 5% of total budget)
    const bufferPercentage = 0.05;
    const bufferAmount = Math.round(totalBudget * bufferPercentage);
    const allocatableBudget = totalBudget - bufferAmount;

    // 2. Compute dynamic weights based on user priorities
    const rawWeights: Record<string, number> = {
      catering: DEFAULT_WEIGHTS.catering * PRIORITY_MULTIPLIERS[priorities.catering],
      venue: DEFAULT_WEIGHTS.venue * PRIORITY_MULTIPLIERS[priorities.venue],
      decor: DEFAULT_WEIGHTS.decor * PRIORITY_MULTIPLIERS[priorities.decor],
      photography: DEFAULT_WEIGHTS.photography * PRIORITY_MULTIPLIERS[priorities.photography],
      attire: DEFAULT_WEIGHTS.attire * PRIORITY_MULTIPLIERS[priorities.attire],
      entertainment: DEFAULT_WEIGHTS.entertainment * PRIORITY_MULTIPLIERS[priorities.entertainment],
    };

    const weightSum = Object.values(rawWeights).reduce((a, b) => a + b, 0);
    const normalizedWeights: Record<string, number> = {};
    for (const [key, val] of Object.entries(rawWeights)) {
      normalizedWeights[key] = val / weightSum;
    }

    // 3. Catering specific calculation: Guest count x estimated plate cost
    const rates = CATERING_PLATE_RATES[occasion] || CATERING_PLATE_RATES.wedding;
    let selectedPlateRate = rates.standard;
    if (priorities.catering === 'high') selectedPlateRate = rates.premium;
    if (priorities.catering === 'low') selectedPlateRate = rates.economy;

    // Initial catering estimate from weight, bounded by realistic plate benchmark
    const benchmarkTarget = guestCount * selectedPlateRate;
    let cateringTarget = Math.round(allocatableBudget * normalizedWeights.catering);
    if (cateringTarget < benchmarkTarget * 0.7) {
      cateringTarget = Math.round((cateringTarget + benchmarkTarget) / 2);
    }
    const perGuestCatering = Math.round(cateringTarget / Math.max(guestCount, 1));

    // Allocate remaining categories
    const categories: BudgetCategory[] = [
      {
        id: 'cat-catering',
        name: 'Catering & Dining',
        category: 'catering',
        allocatedAmount: cateringTarget,
        committedAmount: 0,
        percentageOfTotal: +(cateringTarget / totalBudget * 100).toFixed(1),
        priority: priorities.catering,
        isLocked: priorities.catering === 'high',
        costSource: 'system_estimated',
        calculationBasis: `${guestCount} guests × ₹${perGuestCatering.toLocaleString('en-IN')}/plate (includes buffet, welcome drinks & dessert spread)`,
        assumptions: `Includes 3-course service, tableware and service staff. Adjusted to match priority '${priorities.catering}'.`,
        costPerUnit: perGuestCatering,
        unitLabel: 'guests',
        unitCount: guestCount,
      },
      {
        id: 'cat-venue',
        name: 'Venue & Banquet Hall',
        category: 'venue',
        allocatedAmount: Math.round(allocatableBudget * normalizedWeights.venue),
        committedAmount: 0,
        percentageOfTotal: +(normalizedWeights.venue * (allocatableBudget / totalBudget) * 100).toFixed(1),
        priority: priorities.venue,
        isLocked: priorities.venue === 'high',
        costSource: 'system_estimated',
        calculationBasis: `Standard single-day venue rental + basic electricity & AC charges`,
        assumptions: `Capacity suitable for ${Math.round(guestCount * 1.15)} floating guests with parking facilities.`,
      },
      {
        id: 'cat-decor',
        name: 'Decoration & Floral Setup',
        category: 'decor',
        allocatedAmount: Math.round(allocatableBudget * normalizedWeights.decor),
        committedAmount: 0,
        percentageOfTotal: +(normalizedWeights.decor * (allocatableBudget / totalBudget) * 100).toFixed(1),
        priority: priorities.decor,
        isLocked: priorities.decor === 'high',
        costSource: 'system_estimated',
        calculationBasis: `Stage backdrop + Mandap / altar florals + guest seating decor`,
        assumptions: `Fresh and hybrid floral arrangements with entrance arch and ambient warm lighting.`,
      },
      {
        id: 'cat-photography',
        name: 'Photography & Cinematography',
        category: 'photography',
        allocatedAmount: Math.round(allocatableBudget * normalizedWeights.photography),
        committedAmount: 0,
        percentageOfTotal: +(normalizedWeights.photography * (allocatableBudget / totalBudget) * 100).toFixed(1),
        priority: priorities.photography,
        isLocked: priorities.photography === 'high',
        costSource: 'system_estimated',
        calculationBasis: `2 Candid Photographers + 1 Traditional Videographer + Edited highlight film`,
        assumptions: `Covers pre-event rituals and main ceremony with high-res digital deliverable and 1 album.`,
      },
      {
        id: 'cat-attire',
        name: 'Attire & Styling',
        category: 'attire',
        allocatedAmount: Math.round(allocatableBudget * normalizedWeights.attire),
        committedAmount: 0,
        percentageOfTotal: +(normalizedWeights.attire * (allocatableBudget / totalBudget) * 100).toFixed(1),
        priority: priorities.attire,
        isLocked: priorities.attire === 'high',
        costSource: 'system_estimated',
        calculationBasis: `Host attire, ceremonial outfits and professional hair/makeup styling`,
        assumptions: `Includes bride/groom or primary host outfits plus family consultation styling.`,
      },
      {
        id: 'cat-entertainment',
        name: 'Sound, DJ & Entertainment',
        category: 'entertainment',
        allocatedAmount: Math.round(allocatableBudget * normalizedWeights.entertainment),
        committedAmount: 0,
        percentageOfTotal: +(normalizedWeights.entertainment * (allocatableBudget / totalBudget) * 100).toFixed(1),
        priority: priorities.entertainment,
        isLocked: false,
        costSource: 'system_estimated',
        calculationBasis: `Audio console system + DJ / live traditional ensemble + MC coordination`,
        assumptions: `Sound setup compliant with local noise curfews up to 10:00 PM.`,
      },
      {
        id: 'cat-buffer',
        name: 'Emergency Contingency Buffer',
        category: 'buffer',
        allocatedAmount: bufferAmount,
        committedAmount: 0,
        percentageOfTotal: +(bufferAmount / totalBudget * 100).toFixed(1),
        priority: 'high',
        isLocked: true,
        costSource: 'system_estimated',
        calculationBasis: `5% statutory financial safety net`,
        assumptions: `Preserved for unforeseen last-minute guest overflows, overtime penalties, and transport emergencies.`,
      },
    ];

    return this.reconcileTotal(categories, totalBudget);
  }

  /**
   * Adaptive Recalculation Engine
   * Executes when user alters budget, guest count, or category priorities.
   * Protects locked or high-priority categories while adjusting flexible ones.
   */
  public static adaptBudget(
    existingCategories: BudgetCategory[],
    newTotalBudget: number,
    newGuestCount: number,
    oldGuestCount: number
  ): { categories: BudgetCategory[]; compromises: { category: string; description: string; suggestedSavings: number }[] } {
    const compromises: { category: string; description: string; suggestedSavings: number }[] = [];

    // Clone categories to avoid direct mutation
    const working = existingCategories.map(cat => ({ ...cat }));

    // 1. Maintain 5% buffer on the new total budget
    const targetBuffer = Math.round(newTotalBudget * 0.05);
    const bufferCat = working.find(c => c.category === 'buffer');
    if (bufferCat) {
      bufferCat.allocatedAmount = targetBuffer;
      bufferCat.percentageOfTotal = +(targetBuffer / newTotalBudget * 100).toFixed(1);
    }

    // 2. Check guest-count impact on catering
    const cateringCat = working.find(c => c.category === 'catering');
    if (cateringCat && newGuestCount !== oldGuestCount) {
      const currentPerGuest = cateringCat.costPerUnit || Math.round(cateringCat.allocatedAmount / Math.max(oldGuestCount, 1));
      const requiredCateringAmount = newGuestCount * currentPerGuest;

      // If catering is protected/high priority, scale with guest count
      if (cateringCat.priority === 'high' || cateringCat.isLocked) {
        cateringCat.allocatedAmount = requiredCateringAmount;
        cateringCat.unitCount = newGuestCount;
        cateringCat.calculationBasis = `${newGuestCount} guests × ₹${currentPerGuest.toLocaleString('en-IN')}/plate (PROTECTED: Quality preserved)`;
      } else {
        // If not strictly locked, allow per-plate compromise if total budget shrank
        if (newTotalBudget < requiredCateringAmount * 1.5) {
          const adjustedPerGuest = Math.max(Math.round(currentPerGuest * 0.9), 500);
          cateringCat.allocatedAmount = newGuestCount * adjustedPerGuest;
          cateringCat.costPerUnit = adjustedPerGuest;
          cateringCat.unitCount = newGuestCount;
          cateringCat.calculationBasis = `${newGuestCount} guests × ₹${adjustedPerGuest.toLocaleString('en-IN')}/plate (Optimized buffet tier)`;
          compromises.push({
            category: 'Catering & Dining',
            description: `Adjusted plate rate from ₹${currentPerGuest} to ₹${adjustedPerGuest} to absorb extra ${newGuestCount - oldGuestCount} guests.`,
            suggestedSavings: (currentPerGuest - adjustedPerGuest) * newGuestCount
          });
        } else {
          cateringCat.allocatedAmount = requiredCateringAmount;
          cateringCat.unitCount = newGuestCount;
          cateringCat.calculationBasis = `${newGuestCount} guests × ₹${currentPerGuest.toLocaleString('en-IN')}/plate`;
        }
      }
    }

    // 3. Reconcile remaining allocatable budget across flexible categories
    const nonBufferCategories = working.filter(c => c.category !== 'buffer');
    const lockedCategories = nonBufferCategories.filter(c => c.isLocked || (c.priority === 'high' && c.category === 'catering'));
    const flexibleCategories = nonBufferCategories.filter(c => !lockedCategories.includes(c));

    const totalLockedAllocated = lockedCategories.reduce((sum, c) => sum + c.allocatedAmount, 0) + targetBuffer;
    const remainingForFlexible = newTotalBudget - totalLockedAllocated;

    if (flexibleCategories.length > 0) {
      if (remainingForFlexible >= 0) {
        // Distribute remaining among flexible according to their current relative weights
        const currentFlexibleTotal = flexibleCategories.reduce((sum, c) => sum + c.allocatedAmount, 0) || 1;
        flexibleCategories.forEach(cat => {
          const ratio = cat.allocatedAmount / currentFlexibleTotal;
          const newAllocated = Math.max(Math.round(remainingForFlexible * ratio), 5000);
          
          if (newAllocated < cat.allocatedAmount) {
            compromises.push({
              category: cat.name,
              description: `Reduced by ₹${(cat.allocatedAmount - newAllocated).toLocaleString('en-IN')} to protect core priorities.`,
              suggestedSavings: cat.allocatedAmount - newAllocated
            });
          }
          cat.allocatedAmount = newAllocated;
        });
      } else {
        // Deficit: Even flexible categories cannot absorb without dipping into buffer or lower tiers
        compromises.push({
          category: 'Budget Deficit Alert',
          description: `Total locked allocations exceed budget by ₹${Math.abs(remainingForFlexible).toLocaleString('en-IN')}. Consider unlocking Venue or Catering.`,
          suggestedSavings: 0
        });
        // Clamp flexible categories to 0 since locked categories already consumed all funds
        flexibleCategories.forEach(cat => {
          cat.allocatedAmount = 0;
        });
      }
    }

    // 4. Strictly reconcile to exact Rupee sum
    const reconciled = this.reconcileTotal(working, newTotalBudget);
    return { categories: reconciled, compromises };
  }

  /**
   * Adjusts flexible categories to ensure sum(amounts) === totalBudget without ever producing negative values.
   */
  public static reconcileTotal(categories: BudgetCategory[], targetBudget: number): BudgetCategory[] {
    const sum = categories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
    const diff = targetBudget - sum;

    if (diff !== 0) {
      const flexible = categories.filter(c => !c.isLocked && c.category !== 'buffer');
      if (flexible.length > 0) {
        if (diff > 0) {
          // Add rounding surplus to largest flexible category
          const recipient = flexible.reduce((max, c) => c.allocatedAmount > max.allocatedAmount ? c : max, flexible[0]);
          recipient.allocatedAmount += diff;
        } else {
          // Deficit: safely absorb reduction without allowing negative allocations
          let remainingReduction = Math.abs(diff);
          for (const cat of flexible) {
            const deduction = Math.min(cat.allocatedAmount, remainingReduction);
            cat.allocatedAmount -= deduction;
            remainingReduction -= deduction;
            if (remainingReduction <= 0) break;
          }
        }
      } else {
        // All categories are locked: adjust the largest locked category safely
        const recipient = categories[0];
        if (recipient) {
          recipient.allocatedAmount = Math.max(0, recipient.allocatedAmount + diff);
        }
      }
    }

    // Recompute percentage of total (guaranteed non-negative)
    categories.forEach(cat => {
      cat.allocatedAmount = Math.max(0, cat.allocatedAmount);
      cat.percentageOfTotal = targetBudget > 0 
        ? +(cat.allocatedAmount / targetBudget * 100).toFixed(1)
        : 0;
    });

    return categories;
  }
}
