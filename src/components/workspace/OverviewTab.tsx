import React from 'react';
import { 
  Palette, 
  Clock, 
  Compass, 
  Heart,
  ShieldCheck,
  Lock,
  Building,
  Utensils,
  Camera,
  Sparkles,
  Music,
  Shirt
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
  // Compute defensible readiness score:
  // 60% weight from chronological milestones completed + 40% weight from vendor contracts locked
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'catering': return <Utensils className="w-4 h-4" />;
      case 'venue': return <Building className="w-4 h-4" />;
      case 'photography': return <Camera className="w-4 h-4" />;
      case 'decor': return <Sparkles className="w-4 h-4" />;
      case 'entertainment': return <Music className="w-4 h-4" />;
      case 'attire': return <Shirt className="w-4 h-4" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

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
            <span className="text-xs text-charcoal-400 font-medium">Culturally Synthesized AI Concept</span>
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
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-2 flex items-center space-x-1.5">
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
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-2 flex items-center space-x-1.5">
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
          
          {/* Execution Readiness Card with Clear Mathematical Basis */}
          <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial space-y-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-gold-800 block">
                Execution Readiness
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-serif font-bold text-forest-950">{readinessScore}%</span>
                <span className="text-xs text-charcoal-500">Overall Preparedness</span>
              </div>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-ivory-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-forest-800 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            {/* Transparent Calculation Breakdown */}
            <div className="p-3 bg-white rounded-xl border border-ivory-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-charcoal-700">
                <span>Task Milestones (60% weight):</span>
                <strong className="text-forest-950">{completedMilestones}/{totalMilestones} done ({milestoneProgress}%)</strong>
              </div>
              <div className="flex justify-between items-center text-charcoal-700">
                <span>Vendor Contracts (40% weight):</span>
                <strong className="text-forest-950">{bookedVendors}/{totalVendors} locked ({vendorProgress}%)</strong>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-500 leading-snug">
              Readiness dynamically recalculates as milestones are checked off and vendor contracts are committed.
            </p>
          </div>

          {/* Upcoming Actions */}
          <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 flex items-center space-x-1.5">
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
                      Target: {m.calculatedDate} (T-{m.dueDateDaysBefore} days)
                    </div>
                  </div>
                  {m.priority === 'high' && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      Critical
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Priority Shield Protection Section */}
      <div className="bg-forest-950 text-ivory-100 rounded-3xl p-6 sm:p-8 border border-forest-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-forest-900 border border-gold-500/40 text-gold-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ivory-50">Active Priority Shields</h3>
              <p className="text-xs text-ivory-300">Protected categories cannot be automatically reduced during plan adjustments.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Shielded</span>
            </span>
            <span className="flex items-center space-x-1 text-ivory-400">
              <span className="w-2 h-2 rounded-full bg-ivory-400" />
              <span>Flexible</span>
            </span>
          </div>
        </div>

        {/* Clean, Non-Truncated Responsive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {plan.budgetCategories.map(cat => {
            const isShielded = cat.isLocked || cat.priority === 'high';
            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isShielded
                    ? 'bg-forest-900/90 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-forest-900/40 border-forest-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${isShielded ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' : 'bg-forest-950 text-ivory-400'}`}>
                    {getCategoryIcon(cat.category)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ivory-50">{cat.name}</div>
                    <div className="text-xs font-serif font-bold text-gold-300 mt-0.5">
                      ₹{cat.allocatedAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div>
                  {isShielded ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Protected</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest-950 text-ivory-400 border border-forest-800">
                      Flexible
                    </span>
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
