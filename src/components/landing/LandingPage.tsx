import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  Scale, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import { EventPlan } from '../../types/event';
import { INDIAN_WEDDING_PRESET, GOLDEN_ANNIVERSARY_PRESET } from '../../engine/culturalTemplates';

interface LandingPageProps {
  onStartPlanning: () => void;
  onSelectPreset: (plan: EventPlan) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-24 pb-24">
      
      {/* Refined 2-Column Editorial Hero Section */}
      <section className="relative pt-8 sm:pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Product Positioning & Headlines */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold-100/90 border border-gold-300 text-gold-900 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold-700" />
                <span>Intelligent Celebration Companion</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-forest-950 tracking-tight leading-[1.08]">
                Every celebration deserves a plan <span className="italic font-normal text-gold-700">that works.</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-600 font-light leading-relaxed max-w-xl">
                FESTORA is the intelligent planning companion for budget-conscious families. It transforms celebration dreams into an executable, priority-protected reality—continuously adapting budget allocations, vendor briefs, and timelines whenever circumstances change.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onStartPlanning}
                  className="px-7 py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center space-x-2.5 group"
                >
                  <span>Design Your Celebration</span>
                  <ArrowRight className="w-4 h-4 text-gold-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onSelectPreset(INDIAN_WEDDING_PRESET)}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-ivory-200 text-forest-950 font-semibold text-sm border border-gold-300 transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span>Explore Flagship Plan</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-ivory-300/80 max-w-lg">
                <div>
                  <div className="text-lg font-serif font-bold text-forest-950">100%</div>
                  <div className="text-xs text-charcoal-500">Deterministic Balance</div>
                </div>
                <div>
                  <div className="text-lg font-serif font-bold text-forest-950">Adaptive</div>
                  <div className="text-xs text-charcoal-500">Decision Intelligence</div>
                </div>
                <div>
                  <div className="text-lg font-serif font-bold text-forest-950">Shielded</div>
                  <div className="text-xs text-charcoal-500">Family Priorities</div>
                </div>
              </div>

            </div>

            {/* Right Column: High-Quality Celebration Visual Composition */}
            <div className="lg:col-span-5 relative">
              
              {/* Decorative background glow */}
              <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" />
              
              <div className="relative rounded-3xl overflow-hidden shadow-elevated-editorial border border-ivory-300 bg-white group">
                
                {/* Hero Editorial Photography */}
                <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-forest-900">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                    alt="Indian Heritage Celebration Ambience"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback in case of network issue
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/20 to-transparent" />
                  
                  {/* Floating Live Badge */}
                  <div className="absolute top-4 left-4 bg-forest-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gold-400/30 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-300">
                      Adaptive Intelligence Active
                    </span>
                  </div>
                </div>

                {/* Overlaid Editorial Card Info */}
                <div className="p-6 bg-ivory-50 border-t border-ivory-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gold-800">
                        Heritage Wedding Showcase
                      </span>
                      <h4 className="text-lg font-serif font-bold text-forest-950">
                        Aarav & Diya’s Heritage Celebration
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-900 text-gold-300">
                      Jaipur
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-ivory-200">
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Planned Scale</span>
                      <strong className="text-forest-950 font-serif text-sm">₹8,00,000 • 200 Guests</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-ivory-200">
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Protected Priorities</span>
                      <strong className="text-emerald-800 font-semibold text-xs flex items-center space-x-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Catering & Venue</span>
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* The Core Differentiator: Live Interactive Comparison Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-950 text-ivory-100 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-forest-800">
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold">The Competitive Differentiator</span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold mt-2">
              Adaptive Event Intelligence: What Changed?
            </h2>
            <p className="text-ivory-300 text-sm sm:text-base mt-2">
              Whenever circumstances shift, FESTORA recalculates expenses deterministically while Gemini formulates strategic compromises that protect your priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Initial Plan */}
            <div className="bg-forest-900/80 p-6 rounded-2xl border border-forest-700">
              <div className="text-xs text-gold-400 font-bold uppercase tracking-wider mb-2">1. Initial Plan</div>
              <div className="text-xl font-bold font-serif mb-4">₹8,00,000 • 200 Guests</div>
              <ul className="space-y-2 text-xs text-ivory-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>Catering: ₹2,80,000 (₹1,400/guest)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>Venue: ₹1,76,000</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>Decor & Entertainment: ₹2,16,000</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>Contingency Buffer: ₹40,000 (5%)</span>
                </li>
              </ul>
            </div>

            {/* Step 2: Real-World Shift */}
            <div className="bg-gold-500/10 p-6 rounded-2xl border border-gold-500/30 flex flex-col justify-between">
              <div>
                <div className="text-xs text-gold-400 font-bold uppercase tracking-wider mb-2">2. Circumstance Shift</div>
                <div className="text-lg font-serif italic text-gold-200 mb-3">
                  "Accommodate 50 extra guests, but total budget decreased to ₹7,00,000."
                </div>
                <p className="text-xs text-ivory-300 leading-relaxed">
                  A classic double-bind: +25% guest headcount combined with a -₹1,00,000 spending reduction.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gold-500/20 text-xs text-gold-300 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-gold-400" />
                <span>Deterministic Calculation Triggered</span>
              </div>
            </div>

            {/* Step 3: FESTORA Solution */}
            <div className="bg-forest-900/80 p-6 rounded-2xl border border-gold-400/40 shadow-gold-glow">
              <div className="text-xs text-gold-400 font-bold uppercase tracking-wider mb-2">3. FESTORA Adaptation</div>
              <div className="text-xl font-bold font-serif mb-4 text-gold-300">Protected & Rebalanced</div>
              <ul className="space-y-2 text-xs text-ivory-200">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Food Priority Protected</span>
                </li>
                <li className="text-[11px] text-ivory-400 pl-6">
                  Adjusted plate tier to ₹1,150/guest to absorb +50 guests comfortably.
                </li>
                <li className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Decor shifted to vibrant local blooms (-₹32,000)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>5% Contingency Buffer Preserved (₹35,000)</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onSelectPreset(INDIAN_WEDDING_PRESET)}
              className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-sm transition-all flex items-center space-x-2 shadow-md"
            >
              <span>Explore Live What Changed Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Curated Celebrations Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold">Flagship Celebrations</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-2">
            Curated Event Experiences
          </h2>
          <p className="text-charcoal-600 text-sm sm:text-base mt-2">
            Experience complete end-to-end event plans crafted with authentic Indian traditions and transparent financial models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Indian Wedding */}
          <div className="bg-ivory-50 rounded-3xl p-8 border border-ivory-300 shadow-soft-editorial hover:shadow-elevated-editorial transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-forest-900 text-gold-400">
                  Flagship Celebration
                </span>
                <span className="text-xs text-charcoal-500 font-medium">Jaipur, Rajasthan</span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-forest-950 group-hover:text-gold-700 transition-colors">
                {INDIAN_WEDDING_PRESET.title}
              </h3>
              <p className="text-xs text-gold-800 font-medium mt-1">{INDIAN_WEDDING_PRESET.themeConcept.tagline}</p>
              
              <p className="text-sm text-charcoal-600 mt-4 leading-relaxed">
                {INDIAN_WEDDING_PRESET.themeConcept.editorialSummary}
              </p>

              <div className="grid grid-cols-3 gap-3 my-6 py-4 border-y border-ivory-300 text-center">
                <div>
                  <div className="text-xs text-charcoal-500">Budget</div>
                  <div className="text-base font-bold text-forest-950">₹8.0 Lakhs</div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Guests</div>
                  <div className="text-base font-bold text-forest-950">200</div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Milestones</div>
                  <div className="text-base font-bold text-forest-950">9 Prioritized</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPreset(INDIAN_WEDDING_PRESET)}
              className="w-full py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Open in Command Centre</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </div>

          {/* Card 2: Golden Anniversary */}
          <div className="bg-ivory-50 rounded-3xl p-8 border border-ivory-300 shadow-soft-editorial hover:shadow-elevated-editorial transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gold-200 text-gold-900 border border-gold-300">
                  Family Milestone
                </span>
                <span className="text-xs text-charcoal-500 font-medium">Bengaluru, Karnataka</span>
              </div>

              <h3 className="text-2xl font-serif font-bold text-forest-950 group-hover:text-gold-700 transition-colors">
                {GOLDEN_ANNIVERSARY_PRESET.title}
              </h3>
              <p className="text-xs text-gold-800 font-medium mt-1">{GOLDEN_ANNIVERSARY_PRESET.themeConcept.tagline}</p>
              
              <p className="text-sm text-charcoal-600 mt-4 leading-relaxed">
                {GOLDEN_ANNIVERSARY_PRESET.themeConcept.editorialSummary}
              </p>

              <div className="grid grid-cols-3 gap-3 my-6 py-4 border-y border-ivory-300 text-center">
                <div>
                  <div className="text-xs text-charcoal-500">Budget</div>
                  <div className="text-base font-bold text-forest-950">₹4.0 Lakhs</div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Guests</div>
                  <div className="text-base font-bold text-forest-950">100</div>
                </div>
                <div>
                  <div className="text-xs text-charcoal-500">Milestones</div>
                  <div className="text-base font-bold text-forest-950">6 Prioritized</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPreset(GOLDEN_ANNIVERSARY_PRESET)}
              className="w-full py-3.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Open in Command Centre</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </div>

        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-ivory-300 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center text-forest-900">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-forest-950">Deterministic Math</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Calculations are strictly rule-based in TypeScript. Budgets always reconcile down to the rupee. No AI hallucinated math.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-forest-950">Google Gemini</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Natural language understanding, culturally nuanced celebration themes, and realistic trade-off explanations via official GenAI SDK.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center text-forest-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-forest-950">Priority Locking</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Mark your sacred priorities (e.g. Catering, Venue) and FESTORA guarantees they remain protected when budgets fluctuate.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-800">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-forest-950">Snapshot Rollback</h4>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Every modification creates an immutable snapshot. Inspect differences or instantly rollback to any prior plan version.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
