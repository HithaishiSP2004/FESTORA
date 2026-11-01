import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { EventPlan, PlanDiffReport } from '../../types/event';
import { BudgetEngine } from '../../engine/budgetEngine';
import { TimelineEngine } from '../../engine/timelineEngine';
import { ChangeDiffEngine } from '../../engine/changeDiffEngine';
import { AiService } from '../../services/aiService';

interface WhatChangedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: EventPlan;
  onApplyChanges: (newPlan: EventPlan, diffReport: PlanDiffReport) => void;
}

export const WhatChangedModal: React.FC<WhatChangedModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onApplyChanges,
}) => {
  if (!isOpen) return null;

  // Adaptation inputs
  const [promptText, setPromptText] = useState('');
  const [newBudget, setNewBudget] = useState(currentPlan.totalBudget);
  const [newGuests, setNewGuests] = useState(currentPlan.guestCount);
  const [newDate, setNewDate] = useState(currentPlan.targetDate);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<EventPlan | null>(null);
  const [diffReport, setDiffReport] = useState<PlanDiffReport | null>(null);

  // Quick Simulation presets for Hackathon judges
  const applyPreset = (guestsDelta: number, budgetDelta: number, desc: string) => {
    setNewGuests(currentPlan.guestCount + guestsDelta);
    setNewBudget(Math.max(100000, currentPlan.totalBudget + budgetDelta));
    setPromptText(desc);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Deterministic Budget Adaptation
      const { categories: adaptedCategories, compromises: deterministicCompromises } = BudgetEngine.adaptBudget(
        currentPlan.budgetCategories,
        newBudget,
        newGuests,
        currentPlan.guestCount
      );

      // 2. Deterministic Timeline Recalculation
      const adaptedMilestones = TimelineEngine.calculateMilestoneDates(
        currentPlan.milestones,
        newDate
      );

      // 3. Draft Proposed Plan
      const candidatePlan: EventPlan = {
        ...currentPlan,
        version: currentPlan.version + 1,
        totalBudget: newBudget,
        guestCount: newGuests,
        targetDate: newDate,
        budgetCategories: adaptedCategories,
        milestones: adaptedMilestones,
        updatedAt: new Date().toISOString()
      };

      // 4. Request Gemini Strategic Trade-off Review
      const aiResponse = await AiService.requestAdaptationAdvice({
        changePrompt: promptText || `Adjust budget to ₹${newBudget} and guests to ${newGuests}`,
        previousPlan: currentPlan,
        proposedChanges: {
          newBudget,
          newGuestCount: newGuests,
          newDate,
        }
      });

      // 5. Compute Full BEFORE vs AFTER Diff Report
      const report = ChangeDiffEngine.comparePlans(
        currentPlan,
        candidatePlan,
        aiResponse.strategicAdvice
      );

      // Merge AI compromise suggestions if available
      if (aiResponse.compromiseSuggestions && aiResponse.compromiseSuggestions.length > 0) {
        report.compromises = [
          ...aiResponse.compromiseSuggestions,
          ...deterministicCompromises,
          ...report.compromises
        ];
      } else {
        report.compromises = [
          ...deterministicCompromises,
          ...report.compromises
        ];
      }

      setPreviewPlan(candidatePlan);
      setDiffReport(report);
    } catch (e) {
      console.error('Adaptation calculation error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = () => {
    if (previewPlan && diffReport) {
      onApplyChanges(previewPlan, diffReport);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-forest-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      
      <div className="bg-ivory-50 rounded-3xl max-w-4xl w-full border border-ivory-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-forest-950 text-ivory-100 flex items-start justify-between border-b border-forest-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-gold-400 text-forest-950">
                Adaptive Event Intelligence
              </span>
              <span className="text-xs text-gold-300 font-semibold">Core Differentiator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 mt-1">
              "What Changed?" Decision Engine
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 mt-1">
              Simulate changes in budget, guests or dates. Inspect the financial consequences and strategic compromises before approving.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ivory-400 hover:text-white hover:bg-forest-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Quick Simulation Presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-2">
              Instant Simulation Scenarios
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              <button
                type="button"
                onClick={() => applyPreset(50, -100000, "Accommodate 50 additional guests but budget decreased by ₹1 Lakh")}
                className="p-3 text-left rounded-xl border border-gold-300 bg-gold-50/70 hover:bg-gold-100 transition-colors"
              >
                <div className="text-xs font-bold text-forest-950">+50 Guests, -₹1.0 Lakh</div>
                <div className="text-[11px] text-charcoal-600 mt-0.5">Tightened budget with guest surge</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(100, 150000, "Guest headcount increased by 100 with ₹1.5L budget bump")}
                className="p-3 text-left rounded-xl border border-ivory-300 bg-white hover:border-gold-300 transition-colors"
              >
                <div className="text-xs font-bold text-forest-950">+100 Guests Expansion</div>
                <div className="text-[11px] text-charcoal-600 mt-0.5">Scale catering & venue capacity</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(-30, -150000, "Intimate family downsizing with ₹1.5L savings target")}
                className="p-3 text-left rounded-xl border border-ivory-300 bg-white hover:border-gold-300 transition-colors"
              >
                <div className="text-xs font-bold text-forest-950">-30 Guests Downsizing</div>
                <div className="text-[11px] text-charcoal-600 mt-0.5">Optimize flexible categories</div>
              </button>

            </div>
          </div>

          {/* Interactive Parameters Input */}
          <div className="bg-white p-5 rounded-2xl border border-ivory-300 space-y-4">
            
            {/* Natural language intent */}
            <div>
              <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-1.5">
                Natural Language Change Request
              </label>
              <input
                type="text"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="e.g. We have to accommodate 50 additional guests, but our budget has decreased to ₹7 lakh."
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            {/* Numerical Sliders / Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Revised Budget (₹)
                </label>
                <input
                  type="number"
                  step={10000}
                  value={newBudget}
                  onChange={e => setNewBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-bold text-forest-950"
                />
                <div className="text-[10px] text-charcoal-500 mt-1">
                  Current: ₹{currentPlan.totalBudget.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Revised Guests
                </label>
                <input
                  type="number"
                  step={5}
                  value={newGuests}
                  onChange={e => setNewGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-bold text-forest-950"
                />
                <div className="text-[10px] text-charcoal-500 mt-1">
                  Current: {currentPlan.guestCount} Guests
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  Revised Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-xs font-bold text-forest-950"
                />
                <div className="text-[10px] text-charcoal-500 mt-1">
                  Current: {currentPlan.targetDate}
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    <span>Recalculating & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span>Run Adaptive Analysis</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* BEFORE → AFTER → IMPACT → RECOMMENDED ACTION Report */}
          {diffReport && (
            <div className="space-y-6 pt-4 border-t border-ivory-300 animate-fadeIn">
              
              {/* Executive Impact Banner */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                diffReport.impactSeverity === 'critical'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                      diffReport.impactSeverity === 'critical' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {diffReport.impactSeverity} Impact Detected
                    </span>
                    <span className="text-xs font-bold">
                      {diffReport.changeSummary}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed">
                    {diffReport.strategicAdvice}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold">Delta Variance</div>
                  <div className="text-lg font-serif font-bold">
                    {diffReport.budgetDifference >= 0 ? '+' : ''}₹{diffReport.budgetDifference.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Category Diff Matrix */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block mb-3">
                  Category-Wise Comparison: Before vs After
                </span>

                <div className="bg-white rounded-2xl border border-ivory-300 overflow-hidden divide-y divide-ivory-200">
                  <div className="grid grid-cols-12 p-3 text-[11px] font-bold uppercase text-charcoal-500 bg-ivory-100">
                    <div className="col-span-4">Category & Priority</div>
                    <div className="col-span-2 text-right">Before</div>
                    <div className="col-span-2 text-right">After</div>
                    <div className="col-span-4 pl-4">Impact Explanation</div>
                  </div>

                  {diffReport.categoryDiffs.map(cd => (
                    <div key={cd.categoryId} className="grid grid-cols-12 p-3.5 text-xs items-center hover:bg-ivory-50/50">
                      
                      <div className="col-span-4">
                        <div className="font-bold text-forest-950 flex items-center space-x-1.5">
                          <span>{cd.categoryName}</span>
                          {cd.isProtected && (
                            <span title="Shielded priority">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            </span>
                          )}
                        </div>
                        {cd.isProtected && (
                          <span className="text-[10px] text-emerald-700 font-semibold">Priority Protected</span>
                        )}
                      </div>

                      <div className="col-span-2 text-right font-serif text-charcoal-500">
                        ₹{cd.previousAmount.toLocaleString('en-IN')}
                      </div>

                      <div className="col-span-2 text-right font-serif font-bold text-forest-950">
                        ₹{cd.newAmount.toLocaleString('en-IN')}
                        <div className={`text-[10px] ${cd.difference < 0 ? 'text-amber-700 font-semibold' : cd.difference > 0 ? 'text-emerald-700 font-semibold' : 'text-charcoal-400'}`}>
                          {cd.difference > 0 ? `+₹${cd.difference.toLocaleString('en-IN')}` : cd.difference < 0 ? `-₹${Math.abs(cd.difference).toLocaleString('en-IN')}` : '0'}
                        </div>
                      </div>

                      <div className="col-span-4 pl-4 text-xs text-charcoal-600 leading-snug">
                        {cd.explanation}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Compromises List */}
              {diffReport.compromises.length > 0 && (
                <div className="bg-ivory-100 p-5 rounded-2xl border border-ivory-300">
                  <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-600" />
                    <span>Recommended Compromise Decisions</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {diffReport.compromises.map((comp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-ivory-200 text-xs">
                        <div className="font-bold text-forest-950 flex justify-between">
                          <span>{comp.category}</span>
                          {comp.suggestedSavings > 0 && (
                            <span className="text-emerald-700 font-semibold">Saves ₹{comp.suggestedSavings.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <p className="text-charcoal-600 mt-1 leading-relaxed">
                          {comp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer: User Approval Gate */}
        <div className="p-6 bg-ivory-100 border-t border-ivory-300 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            Discard Changes
          </button>

          {diffReport && previewPlan ? (
            <button
              onClick={handleApprove}
              className="px-8 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-sm shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-forest-950" />
              <span>Approve & Apply Changes (Create Version {previewPlan.version}.0)</span>
            </button>
          ) : (
            <div className="text-xs text-charcoal-500 font-medium">
              Run analysis to inspect proposed changes.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
