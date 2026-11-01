import React, { useState } from 'react';
import { 
  IndianRupee, 
  Lock, 
  Unlock, 
  ShieldCheck
} from 'lucide-react';
import { EventPlan, BudgetCategory } from '../../types/event';

interface BudgetStudioTabProps {
  plan: EventPlan;
  onUpdateCategories: (categories: BudgetCategory[], reason: string) => void;
}

export const BudgetStudioTab: React.FC<BudgetStudioTabProps> = ({
  plan,
  onUpdateCategories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(
    plan.budgetCategories[0] || null
  );

  const totalAllocated = plan.budgetCategories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const totalCommitted = plan.budgetCategories.reduce((sum, c) => sum + c.committedAmount, 0);
  const bufferCat = plan.budgetCategories.find(c => c.category === 'buffer');
  const bufferAmount = bufferCat?.allocatedAmount || 0;

  const isReconciled = totalAllocated === plan.totalBudget;

  const handleToggleLock = (catId: string) => {
    const updated = plan.budgetCategories.map(c => {
      if (c.id === catId) {
        return { ...c, isLocked: !c.isLocked };
      }
      return c;
    });
    onUpdateCategories(updated, `Toggled lock status for category`);
  };

  const handleUpdateCommitted = (catId: string, amount: number) => {
    const updated = plan.budgetCategories.map(c => {
      if (c.id === catId) {
        return { ...c, committedAmount: Math.max(0, amount) };
      }
      return c;
    });
    onUpdateCategories(updated, `Updated committed expenditure`);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Financial Summary & Verification */}
      <div className="bg-ivory-50 rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-editorial">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gold-800">
              Explainable Financial Engine
            </span>
            <h2 className="text-2xl font-serif font-bold text-forest-950 mt-1">
              Budget Allocation Studio
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Every estimate features explicit calculation formulas and baseline assumptions. Zero arbitrary guesses.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-forest-950 text-ivory-100 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isReconciled ? 'Deterministic Reconcile: 100% Balanced' : 'Reconciliation Pending'}
            </span>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ivory-300">
          <div>
            <span className="text-xs text-charcoal-500">Target Budget</span>
            <div className="text-xl font-serif font-bold text-forest-950">
              ₹{plan.totalBudget.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-charcoal-400">Total authorized ceiling</span>
          </div>

          <div>
            <span className="text-xs text-charcoal-500">Allocated Sum</span>
            <div className={`text-xl font-serif font-bold ${isReconciled ? 'text-forest-900' : 'text-red-600'}`}>
              ₹{totalAllocated.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {((totalAllocated / plan.totalBudget) * 100).toFixed(0)}% mapped
            </span>
          </div>

          <div>
            <span className="text-xs text-charcoal-500">Committed / Booked</span>
            <div className="text-xl font-serif font-bold text-gold-700">
              ₹{totalCommitted.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-charcoal-400">
              {((totalCommitted / plan.totalBudget) * 100).toFixed(1)}% of total
            </span>
          </div>

          <div>
            <span className="text-xs text-charcoal-500">Safety Buffer</span>
            <div className="text-xl font-serif font-bold text-forest-900">
              ₹{bufferAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gold-800 font-semibold">5% Statutory Reserve</span>
          </div>
        </div>
      </div>

      {/* Main Budget Grid: Category Breakdown + Formula Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Category List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Itemized Categories ({plan.budgetCategories.length})
            </span>
            <span className="text-xs text-charcoal-400">Click a row to inspect formula</span>
          </div>

          <div className="space-y-3">
            {plan.budgetCategories.map(cat => {
              const isSelected = selectedCategory?.id === cat.id;
              const isShielded = cat.isLocked || cat.priority === 'high';

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-gold-500 bg-gold-50/50 shadow-sm'
                      : 'border-ivory-300 bg-white hover:border-gold-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* Category Title & Tags */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLock(cat.id);
                        }}
                        title={cat.isLocked ? 'Locked category (Shielded)' : 'Unlocked category'}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          cat.isLocked
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-ivory-200 text-charcoal-400 hover:text-charcoal-700'
                        }`}
                      >
                        {cat.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-forest-950">{cat.name}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            cat.costSource === 'user_provided'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-ivory-200 text-charcoal-600'
                          }`}>
                            {cat.costSource === 'user_provided' ? 'User-Set' : 'Model-Estimate'}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-500 line-clamp-1 mt-0.5">
                          {cat.calculationBasis}
                        </p>
                      </div>
                    </div>

                    {/* Numbers */}
                    <div className="text-right sm:shrink-0">
                      <div className="text-base font-serif font-bold text-forest-950">
                        ₹{cat.allocatedAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-charcoal-400">
                        {cat.percentageOfTotal}% of budget
                      </div>
                    </div>

                  </div>

                  {/* Allocation Visual Bar */}
                  <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full ${isShielded ? 'bg-emerald-700' : 'bg-gold-500'}`}
                      style={{ width: `${Math.min(100, cat.percentageOfTotal * 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Transparent Formula Inspector */}
        <div className="space-y-6">
          {selectedCategory ? (
            <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial space-y-5 sticky top-24">
              
              <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-800">
                    Formula Inspector
                  </span>
                  <h3 className="font-serif font-bold text-lg text-forest-950">
                    {selectedCategory.name}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleLock(selectedCategory.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                    selectedCategory.isLocked
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-ivory-200 text-charcoal-600'
                  }`}
                >
                  {selectedCategory.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{selectedCategory.isLocked ? 'Locked' : 'Flexible'}</span>
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-white p-4 rounded-2xl border border-ivory-200">
                <span className="text-xs text-charcoal-500">Allocated Ceiling</span>
                <div className="text-2xl font-serif font-bold text-forest-950">
                  ₹{selectedCategory.allocatedAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-gold-800 font-semibold mt-0.5">
                  Represents {selectedCategory.percentageOfTotal}% of total celebration funds
                </div>
              </div>

              {/* Formula & Calculation Basis */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-1">
                  Calculation Formula
                </span>
                <div className="p-3.5 rounded-xl bg-ivory-100 border border-ivory-300 text-xs text-charcoal-800 font-mono leading-relaxed">
                  {selectedCategory.calculationBasis}
                </div>
              </div>

              {/* Explicit Assumptions */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-1">
                  Baseline Assumptions
                </span>
                <p className="text-xs text-charcoal-600 leading-relaxed bg-white p-3.5 rounded-xl border border-ivory-200">
                  {selectedCategory.assumptions}
                </p>
              </div>

              {/* Committed Tracker input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-1.5">
                  Actual Committed / Contracted Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={selectedCategory.committedAmount || ''}
                    onChange={(e) => handleUpdateCommitted(selectedCategory.id, Number(e.target.value))}
                    placeholder="Enter booked quote..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div className="text-[11px] text-charcoal-400 mt-1 flex justify-between">
                  <span>Variance vs Allocated:</span>
                  <span className={`font-semibold ${
                    selectedCategory.committedAmount > selectedCategory.allocatedAmount
                      ? 'text-red-600'
                      : 'text-emerald-700'
                  }`}>
                    {selectedCategory.committedAmount > 0
                      ? selectedCategory.committedAmount <= selectedCategory.allocatedAmount
                        ? `₹${(selectedCategory.allocatedAmount - selectedCategory.committedAmount).toLocaleString('en-IN')} surplus remaining`
                        : `₹${(selectedCategory.committedAmount - selectedCategory.allocatedAmount).toLocaleString('en-IN')} over budget`
                      : 'No contract signed yet'}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-charcoal-400 text-xs">
              Select a category to inspect formulas.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
