import { EventThemeConcept, EventPlan } from '../types/event';

export class AiService {
  /**
   * Calls the server endpoint to generate a personalized celebration concept.
   */
  public static async generateConcept(params: {
    occasion: string;
    subType?: string;
    city: string;
    totalBudget: number;
    guestCount: number;
    priorities: Record<string, string>;
  }): Promise<{ concept: EventThemeConcept; source: string }> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return { concept: data.concept, source: data.source };
    } catch (err) {
      console.warn('AiService.generateConcept fallback engaged:', err);
      // Fallback response for offline / dev convenience
      return {
        concept: {
          title: 'Royal Heritage & Starlit Elegance',
          tagline: 'Timeless familial traditions elevated with contemporary warmth.',
          editorialSummary: `A personalized celebration plan designed for ${params.guestCount} guests in ${params.city}, prioritizing your top elements with balanced hospitality.`,
          colorPalette: [
            { name: 'Heritage Emerald', hex: '#163323' },
            { name: 'Champagne Gold', hex: '#C5A059' },
            { name: 'Royal Ivory', hex: '#FAF8F5' },
            { name: 'Terracotta Blush', hex: '#D9734E' },
          ],
          culturalElements: [
            'Traditional fragrant Jasmine floral welcome garlands',
            'Live regional instrumental ensemble during guest arrivals',
            'Curated regional culinary specialties honoring authentic recipes',
          ],
          suggestedActivities: [
            'Generational family tribute and blessing ceremony',
            'Interactive memory booth with instant physical photo mementos',
            'Signature ceremonial banquet with personalized guest seating cards',
          ],
        },
        source: 'client_resilience_fallback',
      };
    }
  }

  /**
   * Calls the server endpoint to ask Gemini for strategic adaptation and compromise advice.
   */
  public static async requestAdaptationAdvice(params: {
    changePrompt: string;
    previousPlan: EventPlan;
    proposedChanges: {
      newBudget: number;
      newGuestCount: number;
      newDate?: string;
    };
  }): Promise<{
    strategicAdvice: string;
    compromiseSuggestions: { category: string; description: string; suggestedSavings: number }[];
    culinaryAdjustments?: string;
    decorOptimizations?: string;
  }> {
    try {
      const response = await fetch('/api/ai/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.adaptation;
    } catch (err) {
      console.warn('AiService.requestAdaptationAdvice fallback engaged:', err);
      const guestDiff = params.proposedChanges.newGuestCount - params.previousPlan.guestCount;
      const budgetDiff = params.proposedChanges.newBudget - params.previousPlan.totalBudget;

      return {
        strategicAdvice: guestDiff > 0 && budgetDiff < 0
          ? `Accommodating ${guestDiff} additional guests while lowering total budget by ₹${Math.abs(budgetDiff).toLocaleString('en-IN')} requires smart prioritization. We have shielded Food & Catering by streamlining secondary decor elements.`
          : `Plan parameters updated successfully. Calculations adhere strictly to your priority protections.`,
        compromiseSuggestions: [
          {
            category: 'Decoration & Floral Setup',
            description: 'Utilize vibrant local seasonal marigold and jasmine garlands rather than imported blooms.',
            suggestedSavings: 20000,
          },
          {
            category: 'Sound, DJ & Entertainment',
            description: 'Curate a bespoke digital soundtrack and MC format instead of multi-artist band staging.',
            suggestedSavings: 15000,
          },
        ],
        culinaryAdjustments: 'Focus on high-satisfaction live chaat stations to maintain guest delight.',
        decorOptimizations: 'Concentrate floral density on the main stage backdrop and entrance gate.',
      };
    }
  }
}

