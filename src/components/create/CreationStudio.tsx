import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Lock, 
  Loader2
} from 'lucide-react';
import { EventPlan, OccasionType, PriorityLevel, PrioritySettings } from '../../types/event';
import { BudgetEngine } from '../../engine/budgetEngine';
import { TimelineEngine } from '../../engine/timelineEngine';
import { AiService } from '../../services/aiService';

interface CreationStudioProps {
  onPlanCreated: (plan: EventPlan) => void;
  onCancel: () => void;
}

export const CreationStudio: React.FC<CreationStudioProps> = ({
  onPlanCreated,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [occasion, setOccasion] = useState<OccasionType>('wedding');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [targetDate, setTargetDate] = useState('2026-12-15');
  const [totalBudget, setTotalBudget] = useState<number>(750000); // 7.5L
  const [guestCount, setGuestCount] = useState<number>(200);

  const [priorities, setPriorities] = useState<PrioritySettings>({
    catering: 'high',
    venue: 'high',
    photography: 'high',
    decor: 'medium',
    attire: 'medium',
    entertainment: 'low',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const occasionOptions: { id: OccasionType; label: string; icon: string; desc: string }[] = [
    { id: 'wedding', label: 'Indian Wedding', icon: '💍', desc: 'Multi-day grand ceremony & reception' },
    { id: 'engagement', label: 'Engagement / Roka', icon: '✨', desc: 'Ring exchange and family gathering' },
    { id: 'anniversary', label: 'Milestone Anniversary', icon: '🥂', desc: 'Silver, Golden or family jubilee' },
    { id: 'birthday', label: 'Grand Birthday', icon: '🎂', desc: '1st, 18th, 50th or milestone bash' },
    { id: 'community', label: 'Community Festival', icon: '🪔', desc: 'Diwali, Sangeet or cultural Utsav' },
  ];

  const togglePriority = (key: keyof PrioritySettings) => {
    const current = priorities[key];
    const next: PriorityLevel = current === 'high' ? 'medium' : current === 'medium' ? 'low' : 'high';
    setPriorities(prev => ({ ...prev, [key]: next }));
  };

  const handleFinalize = async () => {
    setIsGenerating(true);
    try {
      const generatedConcept = await AiService.generateConcept({
        occasion,
        city,
        totalBudget,
        guestCount,
        priorities: priorities as unknown as Record<string, string>,
      });

      const budgetCategories = BudgetEngine.calculateInitialBudget({
        totalBudget,
        guestCount,
        occasion,
        priorities,
      });

      const milestones = TimelineEngine.generateMilestones(occasion, targetDate);

      const newPlan: EventPlan = {
        id: `festora-${Date.now()}`,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: title.trim() || `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Celebration in ${city}`,
        occasion,
        targetDate,
        city,
        totalBudget,
        guestCount,
        priorities,
        themeConcept: generatedConcept.concept,
        budgetCategories,
        milestones,
        vendorWorksheets: [
          {
            id: 'vw-cat',
            category: 'catering',
            title: 'Catering & Dining Worksheet',
            estimatedBudget: budgetCategories.find(c => c.category === 'catering')?.allocatedAmount || 250000,
            status: 'pending',
            keyRequirements: ['Live food counters', 'Regional traditional delicacies', 'Welcome beverage service'],
            screeningQuestions: ['Is waitstaff included in per plate rate?', 'What is the refund cutoff for headcount drops?'],
            quotes: []
          }
        ]
      };

      onPlanCreated(newPlan);
    } catch (err) {
      console.error('Plan creation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Studio Header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Creation Studio</span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest-950 mt-1">
          Design Your Celebration
        </h2>
        <p className="text-sm text-charcoal-600 mt-2">
          Step {step} of 4: {step === 1 && 'Occasion & Dates'}
          {step === 2 && 'Budget & Scale'}
          {step === 3 && 'Sacred Priorities'}
          {step === 4 && 'AI Synthesis Preview'}
        </p>

        {/* Progress Bar */}
        <div className="flex justify-center items-center space-x-2 mt-4 max-w-xs mx-auto">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gold-500' : 'bg-ivory-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-ivory-50 rounded-3xl p-6 sm:p-10 border border-ivory-300 shadow-elevated-editorial">
        
        {/* STEP 1: Occasion & Location */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-forest-950 mb-3">
                Select Your Celebration Occasion
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {occasionOptions.map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setOccasion(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      occasion === opt.id
                        ? 'border-gold-500 bg-gold-50 shadow-sm'
                        : 'border-ivory-300 hover:border-gold-300 hover:bg-ivory-100'
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div className="font-bold text-forest-950 text-sm">{opt.label}</div>
                    <div className="text-xs text-charcoal-500 mt-1">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-2">
                  Celebration Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diya & Kabir's Heritage Wedding"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ivory-300 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-2">
                  Host City / Region
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-300 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-2">
                Target Celebration Date
              </label>
              <div className="relative max-w-sm">
                <Calendar className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ivory-300 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Scale & Budget */}
        {step === 2 && (
          <div className="space-y-8">
            
            {/* Total Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-forest-950">
                  Target Expenditure Budget
                </label>
                <span className="text-xl font-serif font-bold text-gold-700">
                  ₹{(totalBudget / 100000).toFixed(1)} Lakhs (₹{totalBudget.toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={5000000}
                step={25000}
                value={totalBudget}
                onChange={e => setTotalBudget(Number(e.target.value))}
                className="w-full accent-forest-900 cursor-pointer h-2 bg-ivory-300 rounded-lg"
              />
              <div className="flex justify-between text-xs text-charcoal-400 mt-1">
                <span>₹1 Lakh</span>
                <span>₹25 Lakhs</span>
                <span>₹50 Lakhs</span>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-forest-950">
                  Expected Guest Headcount
                </label>
                <span className="text-xl font-serif font-bold text-forest-900">
                  {guestCount} Guests
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={1000}
                step={10}
                value={guestCount}
                onChange={e => setGuestCount(Number(e.target.value))}
                className="w-full accent-forest-900 cursor-pointer h-2 bg-ivory-300 rounded-lg"
              />
              <div className="flex justify-between text-xs text-charcoal-400 mt-1">
                <span>20 (Intimate)</span>
                <span>250 (Traditional)</span>
                <span>1000 (Grand)</span>
              </div>
            </div>

            {/* Quick Metrics preview card */}
            <div className="p-5 rounded-2xl bg-forest-950 text-ivory-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold">Spend Intensity</span>
                <div className="text-lg font-serif font-bold mt-0.5">
                  ₹{Math.round(totalBudget / Math.max(guestCount, 1)).toLocaleString('en-IN')} <span className="text-xs font-sans font-normal text-ivory-300">/ attendee</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-gold-400 font-semibold">Contingency Safety Buffer</span>
                <div className="text-lg font-serif font-bold mt-0.5 text-gold-300">
                  ₹{Math.round(totalBudget * 0.05).toLocaleString('en-IN')} (5%)
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: Priority Ranking & Locks */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-forest-950">
                Sacred Priority Protection
              </h3>
              <p className="text-xs text-charcoal-600 mt-1">
                Click each category to toggle priority: <strong className="text-emerald-700">HIGH</strong> categories are shielded with protected allocation locks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(priorities) as (keyof PrioritySettings)[]).map(key => {
                const level = priorities[key];
                return (
                  <div
                    key={key}
                    onClick={() => togglePriority(key)}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                      level === 'high'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : level === 'medium'
                        ? 'border-gold-400 bg-gold-50/30'
                        : 'border-ivory-300 bg-white opacity-70'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-forest-950 capitalize">
                        {key === 'catering' ? 'Catering & Dining' : key === 'decor' ? 'Decor & Florals' : key}
                      </div>
                      <div className="text-xs text-charcoal-500 capitalize">
                        Priority: <span className="font-semibold">{level}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {level === 'high' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Shielded</span>
                        </span>
                      ) : level === 'medium' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gold-200 text-gold-900 border border-gold-300">
                          Standard
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-ivory-200 text-charcoal-600">
                          Flexible
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Review & Synthesis */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-700 mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-forest-950">
                Ready to Synthesize Celebration Plan
              </h3>
              <p className="text-xs text-charcoal-600 max-w-md mx-auto mt-1">
                FESTORA will compute transparent deterministic budget allocations, cultural milestones, and call Gemini for tailored theme styling.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-ivory-300 divide-y divide-ivory-200 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-500">Occasion & City</span>
                <span className="font-bold text-forest-950 capitalize">{occasion} in {city}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-500">Date</span>
                <span className="font-bold text-forest-950">{targetDate}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-500">Total Budget</span>
                <span className="font-bold text-gold-800">₹{totalBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-500">Guest Count</span>
                <span className="font-bold text-forest-950">{guestCount} Guests</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-charcoal-500">Shielded Priorities</span>
                <span className="font-bold text-emerald-800">
                  {Object.entries(priorities).filter(([_, lvl]) => lvl === 'high').map(([k]) => k).join(', ') || 'Standard balanced'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-ivory-300 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => (s - 1) as any)}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-200 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-charcoal-500 hover:text-charcoal-800 text-xs sm:text-sm font-medium"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(s => (s + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-sm flex items-center space-x-2 transition-all shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-forest-950" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-forest-950" />
                  <span>Generate Complete Plan</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
