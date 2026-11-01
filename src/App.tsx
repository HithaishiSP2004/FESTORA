import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { CreationStudio } from './components/create/CreationStudio';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { EventPlan } from './types/event';
import { EventStorage } from './engine/eventStorage';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'create' | 'workspace'>('landing');
  const [activePlan, setActivePlan] = useState<EventPlan>(() => EventStorage.loadActivePlan());

  // Ensure local storage sync on updates
  const handleUpdatePlan = (updatedPlan: EventPlan, snapshotReason?: string) => {
    setActivePlan(updatedPlan);
    EventStorage.savePlan(updatedPlan, snapshotReason || 'Plan updated');
  };

  const handleSelectPreset = (preset: EventPlan) => {
    setActivePlan(preset);
    EventStorage.savePlan(preset, `Loaded preset: ${preset.title}`);
    setCurrentView('workspace');
  };

  const handlePlanCreated = (newPlan: EventPlan) => {
    setActivePlan(newPlan);
    EventStorage.savePlan(newPlan, 'Created new celebration plan');
    setCurrentView('workspace');
  };

  const handleResetDemo = () => {
    const defaultPlan = EventStorage.resetToDefault();
    setActivePlan(defaultPlan);
    setCurrentView('workspace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-charcoal-800 font-sans selection:bg-gold-500 selection:text-white">
      
      {/* Editorial Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        activePlan={activePlan}
        onResetDemo={handleResetDemo}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartPlanning={() => setCurrentView('create')}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {currentView === 'create' && (
          <CreationStudio
            onPlanCreated={handlePlanCreated}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'workspace' && (
          <WorkspaceView
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-ivory-300 bg-ivory-50/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-charcoal-500">
          
          <div className="flex items-center space-x-2">
            <span className="font-display text-base font-bold text-forest-950">FESTORA</span>
            <span className="text-gold-700 font-medium">| Adaptive Event Intelligence</span>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p>
              Engineered for <span className="font-semibold text-forest-950">Google x Hack2Skill PromptWars Virtual</span>
            </p>
            <p className="text-[11px] text-charcoal-400">
              Deterministic Calculation Engine + Google Gemini AI • Challenge 5: Celebration & Event Planner
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default App;
