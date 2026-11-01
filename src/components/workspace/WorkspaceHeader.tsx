import React from 'react';
import { 
  MapPin, 
  Users, 
  History, 
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';
import { EventPlan } from '../../types/event';
import { Rupee } from '../common/Rupee';

interface WorkspaceHeaderProps {
  plan: EventPlan;
  onOpenAdaptModal: () => void;
  onOpenHistoryModal: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  plan,
  onOpenAdaptModal,
  onOpenHistoryModal,
}) => {
  // Calculate countdown days
  const target = new Date(plan.targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const bufferCat = plan.budgetCategories.find(c => c.category === 'buffer');
  const bufferAmount = bufferCat?.allocatedAmount || 0;

  // Capitalize city and occasion
  const formattedCity = plan.city ? plan.city.charAt(0).toUpperCase() + plan.city.slice(1) : '';
  const formattedOccasion = plan.occasion ? plan.occasion.toUpperCase() : 'CELEBRATION';
  const formattedTitle = plan.title ? plan.title.replace(/\b\w/g, l => l.toUpperCase()) : 'Celebration Plan';

  return (
    <div className="bg-forest-950 text-ivory-100 rounded-3xl p-6 sm:p-8 border border-forest-800 shadow-elevated-editorial relative overflow-hidden">
      
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Event Identity */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gold-400 text-forest-950 shadow-sm">
              {formattedOccasion}
            </span>
            <span className="text-[11px] font-semibold tracking-wider px-2 py-0.5 rounded bg-forest-800 text-gold-300 border border-forest-700">
              Version {plan.version}.0
            </span>
            <span className="text-xs text-ivory-300 flex items-center space-x-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>{formattedCity}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-tight">
            {formattedTitle}
          </h1>

          <p className="text-xs sm:text-sm text-gold-200/90 italic font-light">
            "{plan.themeConcept.tagline}"
          </p>
        </div>

        {/* Right: Key Metrics & Adapt Action */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          
          {/* Countdown */}
          <div className="bg-forest-900/90 border border-forest-800 px-4 py-3 rounded-2xl text-center min-w-[90px]">
            <div className="text-2xl font-serif font-bold text-gold-400 leading-none">
              {daysRemaining}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-ivory-400 font-semibold mt-1">
              Days To Go
            </div>
          </div>

          {/* Scale Summary */}
          <div className="bg-forest-900/90 border border-forest-800 px-4 py-3 rounded-2xl min-w-[140px]">
            <div className="text-xs text-ivory-400 mb-0.5">Total Budget</div>
            <div className="text-lg">
              <Rupee amount={plan.totalBudget} isLakh={true} className="text-ivory-50 text-xl" />
            </div>
            <div className="text-[11px] text-gold-300 flex items-center space-x-1 mt-0.5">
              <Users className="w-3 h-3 text-gold-400" />
              <span>{plan.guestCount} Guests</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            
            <button
              onClick={onOpenAdaptModal}
              className="px-4 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              <SlidersHorizontal className="w-4 h-4 text-forest-950" />
              <span>Adapt Plan ("What Changed?")</span>
            </button>

            <button
              onClick={onOpenHistoryModal}
              title="View version history & rollback snapshots"
              className="px-3.5 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-ivory-200 font-semibold text-xs sm:text-sm border border-forest-700 transition-colors flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              <History className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">Snapshots</span>
            </button>

          </div>

        </div>

      </div>

      {/* Bottom Health Bar */}
      <div className="mt-6 pt-5 border-t border-forest-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Budget Reconciled (100% Deterministic)</span>
          </span>
          <span className="text-ivory-400 flex items-center space-x-1">
            <span>Emergency Buffer:</span>
            <Rupee amount={bufferAmount} className="text-gold-300 font-semibold text-xs" />
          </span>
        </div>

        <div className="text-ivory-400">
          Target Date: <strong className="text-ivory-100 font-semibold">{new Date(plan.targetDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
        </div>
      </div>

    </div>
  );
};
