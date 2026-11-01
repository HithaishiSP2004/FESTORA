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
        
        {/* Brand identity */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-full bg-forest-900 border border-gold-400 flex items-center justify-center text-gold-400 shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold tracking-wider text-forest-950">FESTORA</span>
              <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-gold-100 text-gold-800 border border-gold-300 font-semibold">
                Adaptive AI
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-medium tracking-tight">Every celebration deserves a plan that works</p>
          </div>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              currentView === 'landing'
                ? 'bg-forest-900 text-ivory-100'
                : 'text-charcoal-600 hover:text-forest-900 hover:bg-ivory-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Discover</span>
          </button>

          <button
            onClick={() => onNavigate('workspace')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              currentView === 'workspace'
                ? 'bg-forest-900 text-ivory-100'
                : 'text-charcoal-600 hover:text-forest-900 hover:bg-ivory-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Command Center</span>
            {activePlan && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold-500 text-forest-950 font-bold ml-1">
                v{activePlan.version}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('create')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'create'
                ? 'bg-gold-600 text-white shadow-sm'
                : 'bg-gold-500 hover:bg-gold-600 text-forest-950 shadow-sm'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Celebration</span>
          </button>

          {/* Quick Demo Reset for Judges */}
          <button
            onClick={onResetDemo}
            title="Reset to flagship Jaipur Heritage Wedding demonstration baseline"
            className="p-2 text-charcoal-400 hover:text-forest-800 hover:bg-ivory-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
