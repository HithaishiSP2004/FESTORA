import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetEngine } from '../engine/budgetEngine';
import { TimelineEngine } from '../engine/timelineEngine';
import { ChangeDiffEngine } from '../engine/changeDiffEngine';
import { EventStorage } from '../engine/eventStorage';
import { INDIAN_WEDDING_PRESET } from '../engine/culturalTemplates';
import { ConceptOutputSchema, AdaptOutputSchema } from '../server/geminiApiHandler';
import { EventPlan } from '../types/event';

// In-memory mock for localStorage in test environment
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
  length: 0,
  key: () => null,
};

describe('FESTORA Core Architecture Test Suite', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // TEST 1: Budget allocation reconciliation
  it('1. Budget allocation strictly equals target budget down to the exact rupee', () => {
    const totalBudget = 800000;
    const categories = BudgetEngine.calculateInitialBudget({
      totalBudget,
      guestCount: 200,
      occasion: 'wedding',
      priorities: {
        catering: 'high',
        venue: 'high',
        photography: 'medium',
        decor: 'medium',
        attire: 'low',
        entertainment: 'low',
      }
    });

    const sum = categories.reduce((acc, c) => acc + c.allocatedAmount, 0);
    expect(sum).toBe(totalBudget);

    // Verify 5% statutory buffer is present
    const bufferCat = categories.find(c => c.category === 'buffer');
    expect(bufferCat).toBeDefined();
    expect(bufferCat?.allocatedAmount).toBe(Math.round(totalBudget * 0.05));
  });

  // TEST 2: Guest increase scaling
  it('2. Guest headcount increase recalculates catering allocations', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    const initialCatering = basePlan.budgetCategories.find(c => c.category === 'catering')!.allocatedAmount;

    const { categories: adapted } = BudgetEngine.adaptBudget(
      basePlan.budgetCategories,
      basePlan.totalBudget,
      250, // +50 guests
      200
    );

    const updatedCatering = adapted.find(c => c.category === 'catering')!.allocatedAmount;
    expect(updatedCatering).toBeGreaterThanOrEqual(initialCatering);

    // Total must still reconcile to 100% of budget
    const total = adapted.reduce((s, c) => s + c.allocatedAmount, 0);
    expect(total).toBe(basePlan.totalBudget);
  });

  // TEST 3: Budget decrease with trade-offs identified
  it('3. Budget reduction triggers compromises in flexible categories', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    const lowerBudget = 700000; // -₹1,00,000

    const { categories: adapted, compromises } = BudgetEngine.adaptBudget(
      basePlan.budgetCategories,
      lowerBudget,
      200,
      200
    );

    const sum = adapted.reduce((s, c) => s + c.allocatedAmount, 0);
    expect(sum).toBe(lowerBudget);
    expect(compromises.length).toBeGreaterThan(0);
  });

  // TEST 4: Event date change updates milestone timeline
  it('4. Event target date shift recalculates all milestone calendar dates', () => {
    const milestones = TimelineEngine.generateMilestones('wedding', '2026-12-20');
    const firstDate = milestones[0].calculatedDate;

    // Shift event date by 30 days earlier
    const recalculated = TimelineEngine.calculateMilestoneDates(milestones, '2026-11-20');
    const updatedDate = recalculated[0].calculatedDate;

    expect(firstDate).not.toBe(updatedDate);
    // Calculated date should be earlier
    expect(new Date(updatedDate!).getTime()).toBeLessThan(new Date(firstDate!).getTime());
  });

  // TEST 5: Priority locking protects shielded categories
  it('5. Priority locking prevents shielded categories from being cannibalized', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    
    // Explicitly lock Venue category
    const venueCat = basePlan.budgetCategories.find(c => c.category === 'venue')!;
    venueCat.isLocked = true;
    const originalVenueAmount = venueCat.allocatedAmount;

    // Cut total budget from 8L to 7L and increase guests
    const { categories: adapted } = BudgetEngine.adaptBudget(
      basePlan.budgetCategories,
      700000,
      250,
      200
    );

    const adaptedVenue = adapted.find(c => c.category === 'venue')!;
    // Locked category must remain invariant
    expect(adaptedVenue.allocatedAmount).toBe(originalVenueAmount);
  });

  // TEST 6: Zod validation of AI schemas
  it('6. Invalid AI responses fail validation while valid payloads pass Zod schema', () => {
    const validConcept = {
      title: 'Royal Heritage Splendor',
      tagline: 'Tradition meets warmth',
      editorialSummary: 'A glorious celebration plan for family and friends.',
      colorPalette: [
        { name: 'Emerald', hex: '#163323' },
        { name: 'Gold', hex: '#C5A059' },
      ],
      culturalElements: ['Shehnai performance', 'Jasmine garlands'],
      suggestedActivities: ['Sangeet dance', 'Mehendi lounge'],
    };

    expect(() => ConceptOutputSchema.parse(validConcept)).not.toThrow();

    const validAdaptation = {
      strategicAdvice: 'Shielded high priority food items while adjusting decor.',
      compromiseSuggestions: [
        { category: 'Decor', description: 'Local seasonal flowers', suggestedSavings: 20000 }
      ],
      culinaryAdjustments: 'Focus on live counters.',
      decorOptimizations: 'Focus flowers on stage.'
    };
    expect(() => AdaptOutputSchema.parse(validAdaptation)).not.toThrow();

    const invalidConcept = {
      title: 'Missing required fields',
    };
    expect(() => ConceptOutputSchema.parse(invalidConcept)).toThrow();
  });

  // TEST 7: ChangeDiffEngine detects impact severity
  it('7. ChangeDiffEngine correctly marks +guests and -budget as critical impact', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    const proposedPlan: EventPlan = {
      ...basePlan,
      totalBudget: 700000, // lower
      guestCount: 250,     // higher
      version: 2,
    };

    const diff = ChangeDiffEngine.comparePlans(basePlan, proposedPlan);
    expect(diff.impactSeverity).toBe('critical');
    expect(diff.budgetDifference).toBe(-100000);
    expect(diff.guestDifference).toBe(50);
  });

  // TEST 8: LocalStorage persistence
  it('8. LocalStorage persistence accurately stores and retrieves active plan', () => {
    const customPlan: EventPlan = {
      ...INDIAN_WEDDING_PRESET,
      title: 'Custom Test Celebration',
    };

    EventStorage.savePlan(customPlan, 'Test snapshot creation');
    const loaded = EventStorage.loadActivePlan();

    expect(loaded.title).toBe('Custom TestCelebration'.replace('TestCelebration', 'Test Celebration'));
    const snapshots = EventStorage.getSnapshots(customPlan.id);
    expect(snapshots.length).toBeGreaterThan(0);
  });

  // TEST 9: Snapshot rollback
  it('9. Restoring a historical snapshot resets plan state to that version', () => {
    const initialPlan: EventPlan = {
      ...INDIAN_WEDDING_PRESET,
      version: 1,
      totalBudget: 800000,
    };

    EventStorage.savePlan(initialPlan, 'Version 1 baseline');
    const snapshots = EventStorage.getSnapshots(initialPlan.id);
    const snapId = snapshots[0].snapshotId;

    // Mutate plan to version 2
    const mutatedPlan: EventPlan = {
      ...initialPlan,
      version: 2,
      totalBudget: 600000,
    };
    EventStorage.savePlan(mutatedPlan, 'Version 2 altered');

    // Rollback to version 1 snapshot
    const restored = EventStorage.rollbackToSnapshot(initialPlan.id, snapId);
    expect(restored).not.toBeNull();
    expect(restored!.totalBudget).toBe(800000);
    expect(restored!.version).toBe(2); // Incremented audit version
  });

});
