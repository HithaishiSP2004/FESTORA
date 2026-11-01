import { EventPlan, PlanDiffReport, CategoryDiff } from '../types/event';

export class ChangeDiffEngine {
  /**
   * Computes a structured BEFORE vs AFTER diff report between two plan versions.
   */
  public static comparePlans(
    previousPlan: EventPlan,
    newPlan: EventPlan,
    aiAdvice?: string
  ): PlanDiffReport {
    const budgetDiff = newPlan.totalBudget - previousPlan.totalBudget;
    const guestDiff = newPlan.guestCount - previousPlan.guestCount;
    const isDateChanged = previousPlan.targetDate !== newPlan.targetDate;

    const categoryDiffs: CategoryDiff[] = [];

    // Map each category
    newPlan.budgetCategories.forEach(newCat => {
      const prevCat = previousPlan.budgetCategories.find(c => c.category === newCat.category);
      const prevAmount = prevCat ? prevCat.allocatedAmount : 0;
      const difference = newCat.allocatedAmount - prevAmount;
      const percentChange = prevAmount > 0 ? +((difference / prevAmount) * 100).toFixed(1) : 0;
      const isProtected = newCat.priority === 'high' || newCat.isLocked;

      let explanation = 'Maintained proportional share.';
      if (difference > 0) {
        if (newCat.category === 'catering' && guestDiff > 0) {
          explanation = `Increased by ₹${Math.abs(difference).toLocaleString('en-IN')} to comfortably cater to ${guestDiff} additional guests.`;
        } else {
          explanation = `Increased by ₹${Math.abs(difference).toLocaleString('en-IN')} to meet elevated priorities.`;
        }
      } else if (difference < 0) {
        explanation = `Reduced by ₹${Math.abs(difference).toLocaleString('en-IN')} to absorb changes in higher-priority categories.`;
      } else {
        explanation = isProtected ? 'Shielded from reductions due to high-priority lock.' : 'Unchanged.';
      }

      categoryDiffs.push({
        categoryId: newCat.id,
        categoryName: newCat.name,
        previousAmount: prevAmount,
        newAmount: newCat.allocatedAmount,
        difference,
        percentChange,
        isProtected,
        explanation
      });
    });

    // Determine impact severity
    let impactSeverity: 'low' | 'moderate' | 'critical' = 'low';
    if (guestDiff > 0 && budgetDiff < 0) {
      impactSeverity = 'critical'; // Classic double-bind: more people, less money
    } else if (Math.abs(budgetDiff) > previousPlan.totalBudget * 0.1 || Math.abs(guestDiff) > 50) {
      impactSeverity = 'moderate';
    }

    // Generate humanized summary
    const summaryParts: string[] = [];
    if (guestDiff !== 0) {
      summaryParts.push(`Guest headcount changed from ${previousPlan.guestCount} to ${newPlan.guestCount} (${guestDiff > 0 ? '+' : ''}${guestDiff})`);
    }
    if (budgetDiff !== 0) {
      summaryParts.push(`Budget adjusted from ₹${previousPlan.totalBudget.toLocaleString('en-IN')} to ₹${newPlan.totalBudget.toLocaleString('en-IN')} (${budgetDiff > 0 ? '+' : ''}₹${budgetDiff.toLocaleString('en-IN')})`);
    }
    if (isDateChanged) {
      summaryParts.push(`Event date shifted from ${previousPlan.targetDate} to ${newPlan.targetDate}`);
    }
    const changeSummary = summaryParts.length > 0 ? summaryParts.join('; ') : 'Parameters updated with revised allocations.';

    // Compile compromise actions taken
    const compromises = categoryDiffs
      .filter(cd => cd.difference < 0)
      .map(cd => ({
        category: cd.categoryName,
        description: `Scaled down to free up ₹${Math.abs(cd.difference).toLocaleString('en-IN')} for higher-priority requirements.`,
        suggestedSavings: Math.abs(cd.difference)
      }));

    // Strategic advice: use passed AI advice or deterministic guidance
    const strategicAdvice = aiAdvice || this.generateDeterministicAdvice(budgetDiff, guestDiff, previousPlan, newPlan);

    return {
      changeSummary,
      previousBudget: previousPlan.totalBudget,
      newBudget: newPlan.totalBudget,
      budgetDifference: budgetDiff,
      previousGuests: previousPlan.guestCount,
      newGuests: newPlan.guestCount,
      guestDifference: guestDiff,
      previousDate: previousPlan.targetDate,
      newDate: newPlan.targetDate,
      categoryDiffs,
      impactSeverity,
      compromises,
      strategicAdvice
    };
  }

  private static generateDeterministicAdvice(
    budgetDiff: number,
    guestDiff: number,
    prev: EventPlan,
    _next: EventPlan
  ): string {
    if (guestDiff > 0 && budgetDiff < 0) {
      return `You are accommodating ${guestDiff} additional guests while lowering total spend by ₹${Math.abs(budgetDiff).toLocaleString('en-IN')}. FESTORA has automatically preserved your '${prev.priorities.catering}' priority for Catering & Food by scaling back flexible items (such as Decor and Entertainment). We recommend opting for a smart dessert bar rather than multiple live stations to comfortably stay within your new targets.`;
    }
    if (guestDiff > 0) {
      return `Increasing guest count by ${guestDiff} directly impacts catering and seating layout. The catering allocation was expanded proportionally while keeping your contingency buffer intact.`;
    }
    if (budgetDiff < 0) {
      return `Your budget decreased by ₹${Math.abs(budgetDiff).toLocaleString('en-IN')}. Non-critical allocations were trimmed first to protect your booked venue and top-priority services.`;
    }
    return `Plan recalculated successfully. All category totals reconcile exactly with your target budget.`;
  }
}

