import React from 'react';
import { 
  Palette, 
  Clock, 
  Compass, 
  Heart,
  ShieldCheck
} from 'lucide-react';
import { EventPlan } from '../../types/event';

interface OverviewTabProps {
  plan: EventPlan;
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  plan,
  onNavigateTab,
}) => {
  // Compute readiness score
  const totalMilestones = plan.milestones.length || 1;
  const completedMilestones = plan.milestones.filter(m => m.isCompleted).length;
  const milestoneProgress = Math.round((completedMilestones / totalMilestones) * 60);

  const totalVendors = plan.vendorWorksheets.length || 1;
  const bookedVendors = plan.vendorWorksheets.filter(v => v.status === 'booked').length;
  const vendorProgress = Math.round((bookedVendors / totalVendors) * 40);

  const readinessScore = Math.min(100, milestoneProgress + vendorProgress);

  // Upcoming critical tasks (due next)
  const pendingMilestones = plan.milestones
    .filter(m => !m.isCompleted)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      
      {/* Top Grid: Concept & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Creative Theme Concept */}
        <div className="lg:col-span-2 bg-ivory-50 rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-editorial space-y-6">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-gold-800">
                Editorial Concept Board
              </span>
            </div>
            <span className="text-xs text-charcoal-400 font-medium">Synthesized via Gemini AI</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950">
              {plan.themeConcept.title}
            </h2>
            <p className="text-xs sm:text-sm text-gold-800 font-semibold mt-1">
              "{plan.themeConcept.tagline}"
            </p>
            <p className="text-sm text-charcoal-600 mt-3 leading-relaxed">
              {plan.themeConcept.editorialSummary}
            </p>
          </div>

          {/* Color Palette */}
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-500 block mb-3">
              Curated Celebration Palette
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {plan.themeConcept.colorPalette.map(c => (
                <div key={c.name} className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-ivory-200">
                  <div
                    className="w-7 h-7 rounded-lg shadow-sm border border-black/10 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-forest-950 truncate">{c.name}</div>
                    <div className="text-[10px] text-charcoal-400 uppercase font-mono">{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Elements & Guest Activities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-ivory-200">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-2 flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-gold-600" />
                <span>Authentic Cultural Touches</span>
              </span>
              <ul className="space-y-2 text-xs text-charcoal-600">
                {plan.themeConcept.culturalElements.map((el, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-gold-600 font-bold">•</span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-2 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-gold-600" />
                <span>Signature Experiences</span>
              </span>
              <ul className="space-y-2 text-xs text-charcoal-600">
                {plan.themeConcept.suggestedActivities.map((act, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-gold-600 font-bold">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Right Col: Readiness & Upcoming Decisions */}
        <div className="space-y-6">
          
          {/* Readiness Score Card */}
          <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial">
            <span className="text-xs uppercase font-bold tracking-wider text-gold-800 block mb-2">
              Execution Readiness
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-serif font-bold text-forest-950">{readinessScore}%</span>
              <span className="text-xs text-charcoal-500">Overall Preparedness</span>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-ivory-200 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-forest-800 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-ivory-200 text-xs">
              <div>
                <span className="text-charcoal-500">Milestones</span>
                <div className="font-bold text-forest-950">{completedMilestones}/{totalMilestones} done</div>
              </div>
              <div>
                <span className="text-charcoal-500">Key Vendors</span>
                <div className="font-bold text-forest-950">{bookedVendors}/{totalVendors} locked</div>
              </div>
            </div>
          </div>

          {/* Upcoming Actions */}
          <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-gold-600" />
                <span>Next On Critical Path</span>
              </span>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-gold-700 hover:text-gold-800"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {pendingMilestones.map(m => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-white border border-ivory-200 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-forest-950">{m.title}</div>
                    <div className="text-[11px] text-charcoal-400 mt-0.5">
                      Target: {m.calculatedDate} ({m.dueDateDaysBefore} days before)
                    </div>
                  </div>
                  {m.priority === 'high' && (
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                      High
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Priority Shield Protection Summary */}
      <div className="bg-forest-900 text-ivory-100 rounded-3xl p-6 sm:p-8 border border-forest-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-forest-800 text-gold-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-ivory-50">Active Priority Shields</h3>
            <p className="text-xs text-ivory-300">These categories are guaranteed to remain shielded during budget fluctuations.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {plan.budgetCategories.map(cat => {
            const isShielded = cat.isLocked || cat.priority === 'high';
            return (
              <div
                key={cat.id}
                className={`p-3 rounded-xl border text-center ${
                  isShielded
                    ? 'bg-forest-800/80 border-gold-500/50 shadow-sm'
                    : 'bg-forest-950/40 border-forest-800 opacity-60'
                }`}
              >
                <div className="text-xs font-bold truncate">{cat.name}</div>
                <div className="text-xs font-serif font-bold text-gold-300 mt-1">
                  ₹{(cat.allocatedAmount / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] uppercase tracking-wider font-semibold mt-1">
                  {isShielded ? (
                    <span className="text-emerald-400">● Protected</span>
                  ) : (
                    <span className="text-ivory-400">Flexible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
