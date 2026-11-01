import React from 'react';
import { Sparkles, Calendar, PlusCircle, RotateCcw, Compass } from 'lucide-react';
import { EventPlan } from '../../types/event';

interface NavbarProps {
  currentView: 'landing' | 'create' | 'workspace';
  onNavigate: (view: 'landing' | 'create' | 'workspace') => void;
  activePlan: EventPlan;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activePlan,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Identity */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-forest-900 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-sm transition-all group-hover:scale-105 group-hover:border-gold-400">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold tracking-wider text-forest-950">FESTORA</span>
            </div>
            <p className="text-[11px] text-charcoal-500 font-medium tracking-tight">Adaptive Event Intelligence</p>
          </div>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 ${
              currentView === 'landing'
                ? 'bg-forest-900 text-ivory-100 shadow-sm'
                : 'text-charcoal-600 hover:text-forest-900 hover:bg-ivory-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Discover</span>
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 ${
              currentView === 'workspace'
                ? 'bg-forest-900 text-ivory-100 shadow-sm'
                : 'text-charcoal-600 hover:text-forest-900 hover:bg-ivory-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden md:inline">Command Centre</span>
            {activePlan && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 border ${
                currentView === 'workspace'
                  ? 'bg-gold-400/20 text-gold-300 border-gold-400/40'
                  : 'bg-gold-100 text-gold-800 border-gold-300'
              }`}>
                v{activePlan.version}.0
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('create')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 ${
              currentView === 'create'
                ? 'bg-gold-600 text-white shadow-sm'
                : 'bg-gold-500 hover:bg-gold-600 text-forest-950 shadow-sm'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Plan</span>
          </button>

          {/* Quick Demo Reset */}
          <button
            onClick={onResetDemo}
            title="Reset to flagship demonstration baseline"
            aria-label="Reset to flagship demonstration baseline"
            className="p-2 text-charcoal-400 hover:text-forest-800 hover:bg-ivory-200 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
