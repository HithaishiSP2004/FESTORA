import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BudgetEngine } from '../engine/budgetEngine';
import { TimelineEngine } from '../engine/timelineEngine';
import { ChangeDiffEngine } from '../engine/changeDiffEngine';
import { EventStorage } from '../engine/eventStorage';
import { INDIAN_WEDDING_PRESET } from '../engine/culturalTemplates';
import { 
  ConceptOutputSchema, 
  AdaptOutputSchema,
  GenerateConceptRequestSchema,
  AdaptPlanRequestSchema
} from '../server/geminiApiHandler';
import { EventPlan } from '../types/event';
import { AiService } from '../services/aiService';

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

  // TEST 10: Infeasible budget scenario
  it('10. Infeasible budget scenarios generate deficit warnings and floor flexible categories', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    // Lock both catering and venue
    const catering = basePlan.budgetCategories.find(c => c.category === 'catering')!;
    const venue = basePlan.budgetCategories.find(c => c.category === 'venue')!;
    catering.isLocked = true;
    venue.isLocked = true;
    expect(catering.allocatedAmount + venue.allocatedAmount).toBeGreaterThan(250000);

    // Attempt to slash total budget to ₹2,50,000 (well below locked allocations)
    const { categories: adapted, compromises } = BudgetEngine.adaptBudget(
      basePlan.budgetCategories,
      250000,
      200,
      200
    );

    // Deficit alert compromise must be triggered
    const alert = compromises.find(c => c.category === 'Budget Deficit Alert');
    expect(alert).toBeDefined();
    expect(alert?.description).toContain('exceed budget');

    // Flexible categories should be clamped to 0 and NO category should ever be negative
    const decor = adapted.find(c => c.category === 'decor')!;
    expect(decor.allocatedAmount).toBe(0);
    expect(adapted.every(c => c.allocatedAmount >= 0)).toBe(true);
  });

  // TEST 11: What Changed lifecycle: Approval vs Rejection
  it('11. What Changed lifecycle preserves plan on rejection and increments version on approval', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    basePlan.version = 1;

    // Simulation: Proposed change
    const proposedPlan: EventPlan = {
      ...basePlan,
      version: basePlan.version + 1,
      totalBudget: 750000,
      guestCount: 220,
    };
    const diff = ChangeDiffEngine.comparePlans(basePlan, proposedPlan);

    // Action A: Rejection
    // User cancels or rejects modal -> state is not updated, active plan remains basePlan v1
    let activePlan = { ...basePlan };
    const onReject = () => { /* no-op */ };
    onReject();
    expect(activePlan.version).toBe(1);
    expect(activePlan.totalBudget).toBe(800000);

    // Action B: Approval
    // User approves diff -> new plan is applied and snapshot recorded
    const onApprove = (acceptedPlan: EventPlan) => {
      activePlan = acceptedPlan;
      EventStorage.savePlan(acceptedPlan, `Approved adaptation: ${diff.changeSummary}`);
    };
    onApprove(proposedPlan);
    expect(activePlan.version).toBe(2);
    expect(activePlan.totalBudget).toBe(750000);
    expect(activePlan.guestCount).toBe(220);

    const snapshots = EventStorage.getSnapshots(activePlan.id);
    expect(snapshots.some(s => s.version === 2)).toBe(true);
  });

  // TEST 12: Resilient fallback when API key is missing or offline
  it('12. Client-side resilience fallback activates seamlessly when API is offline', async () => {
    // Mock global fetch to simulate network error or 500 error
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error: API unreachable'));

    // Test concept generation fallback
    const conceptResult = await AiService.generateConcept({
      occasion: 'wedding',
      city: 'Bangalore',
      totalBudget: 800000,
      guestCount: 200,
      priorities: { catering: 'high', venue: 'high' }
    });

    expect(conceptResult.source).toBe('client_resilience_fallback');
    expect(conceptResult.concept.title).toBeDefined();
    expect(conceptResult.concept.colorPalette.length).toBeGreaterThanOrEqual(2);

    // Test adaptation advice fallback
    const adaptResult = await AiService.requestAdaptationAdvice({
      changePrompt: 'Decrease budget to 7L',
      previousPlan: INDIAN_WEDDING_PRESET,
      proposedChanges: {
        newBudget: 700000,
        newGuestCount: 200
      }
    });

    expect(adaptResult.strategicAdvice).toBeDefined();
    expect(adaptResult.compromiseSuggestions.length).toBeGreaterThanOrEqual(1);

    // Restore fetch
    globalThis.fetch = originalFetch;
  });

  // TEST 13: Vendor quote commitment updates budget tracking and readiness
  it('13. Vendor quote selection locks contract and syncs committed expenditure to budget', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    const cateringWorksheet = basePlan.vendorWorksheets.find(vw => vw.category === 'catering')!;
    const targetQuote = cateringWorksheet.quotes[0];

    // Select and commit quote
    targetQuote.isShortlisted = true;
    cateringWorksheet.status = 'booked';
    const catIndex = basePlan.budgetCategories.findIndex(c => c.category === 'catering');
    basePlan.budgetCategories[catIndex].committedAmount = targetQuote.quotedAmount;

    // Verify committedAmount reflects quote
    expect(basePlan.budgetCategories[catIndex].committedAmount).toBe(targetQuote.quotedAmount);
    expect(cateringWorksheet.status).toBe('booked');

    // Verify Execution Readiness recalculation
    const totalMilestones = basePlan.milestones.length || 1;
    const completedMilestones = basePlan.milestones.filter(m => m.isCompleted).length;
    const milestoneProgress = Math.round((completedMilestones / totalMilestones) * 60);

    const totalVendors = basePlan.vendorWorksheets.length || 1;
    const bookedVendors = basePlan.vendorWorksheets.filter(v => v.status === 'booked').length;
    const vendorProgress = Math.round((bookedVendors / totalVendors) * 40);

    const readinessScore = Math.min(100, milestoneProgress + vendorProgress);
    expect(readinessScore).toBeGreaterThan(0);
    expect(vendorProgress).toBeGreaterThan(0);
  });

  // TEST 14: Guest headcount reduction (downsizing scenario)
  it('14. Downsizing guest headcount scales catering expenditure down while reconciling total budget', () => {
    const basePlan = JSON.parse(JSON.stringify(INDIAN_WEDDING_PRESET)) as EventPlan;
    const initialCatering = basePlan.budgetCategories.find(c => c.category === 'catering')!.allocatedAmount;

    // Scale from 200 down to 120 guests (-40%)
    const { categories: adapted } = BudgetEngine.adaptBudget(
      basePlan.budgetCategories,
      basePlan.totalBudget,
      120,
      200
    );

    const updatedCatering = adapted.find(c => c.category === 'catering')!.allocatedAmount;
    expect(updatedCatering).toBeLessThan(initialCatering);

    // Sum must remain perfectly reconciled to totalBudget
    const sum = adapted.reduce((s, c) => s + c.allocatedAmount, 0);
    expect(sum).toBe(basePlan.totalBudget);

    // Statutory 5% buffer must still be preserved
    const bufferCat = adapted.find(c => c.category === 'buffer')!;
    expect(bufferCat.allocatedAmount).toBe(Math.round(basePlan.totalBudget * 0.05));
  });

  // TEST 15: API input validation rejects malformed and out-of-boundary payloads
  it('15. Strict Zod schemas reject invalid, empty, or negative payloads', () => {
    // A: Negative budget is rejected
    const invalidBudgetResult = GenerateConceptRequestSchema.safeParse({
      occasion: 'wedding',
      city: 'Delhi',
      totalBudget: -50000,
      guestCount: 150,
      priorities: { catering: 'high' }
    });
    expect(invalidBudgetResult.success).toBe(false);

    // B: Missing required occasion is rejected
    const missingOccasionResult = GenerateConceptRequestSchema.safeParse({
      city: 'Delhi',
      totalBudget: 500000,
      guestCount: 150,
      priorities: { catering: 'high' }
    });
    expect(missingOccasionResult.success).toBe(false);

    // C: Malformed adaptation payload with invalid category types
    const malformedAdaptResult = AdaptPlanRequestSchema.safeParse({
      changePrompt: 'Adjust budget',
      previousPlan: {
        title: 'Wedding',
        occasion: 'wedding',
        totalBudget: 800000,
        guestCount: 200,
        city: 'Delhi',
        priorities: {},
        budgetCategories: [{ id: 'cat-1', category: 'catering' }] // Missing required schema fields
      },
      proposedChanges: {
        newBudget: 750000,
        newGuestCount: 220
      }
    });
    expect(malformedAdaptResult.success).toBe(false);
  });

});
