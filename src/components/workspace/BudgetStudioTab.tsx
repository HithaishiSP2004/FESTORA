import React, { useState } from 'react';
import { 
  IndianRupee, 
  Lock, 
  Unlock, 
  ShieldCheck,
  Building,
  Utensils,
  Camera,
  Sparkles,
  Music,
  Shirt,
  Info
} from 'lucide-react';
import { EventPlan, BudgetCategory } from '../../types/event';
import { Rupee } from '../common/Rupee';

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
  const remainingUncommitted = Math.max(0, plan.totalBudget - totalCommitted);

  const isReconciled = totalAllocated === plan.totalBudget;

  const handleToggleLock = (catId: string) => {
    const updated = plan.budgetCategories.map(c => {
      if (c.id === catId) {
        return { ...c, isLocked: !c.isLocked };
      }
      return c;
    });
    onUpdateCategories(updated, `Toggled lock status for category`);
    if (selectedCategory?.id === catId) {
      setSelectedCategory(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null);
    }
  };

  const handleUpdateCommitted = (catId: string, amount: number) => {
    const sanitizedAmount = Math.max(0, isNaN(amount) ? 0 : amount);
    const updated = plan.budgetCategories.map(c => {
      if (c.id === catId) {
        return { ...c, committedAmount: sanitizedAmount };
      }
      return c;
    });
    onUpdateCategories(updated, `Updated committed expenditure`);
    if (selectedCategory?.id === catId) {
      setSelectedCategory(prev => prev ? { ...prev, committedAmount: sanitizedAmount } : null);
    }
  };

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
      
      {/* Top Banner: Financial Summary & Verification */}
      <div className="bg-ivory-50 rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-editorial">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gold-800">
              Explainable Financial Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
              Budget Allocation Studio
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Every figure is derived from explicit mathematical formulas and baseline cultural assumptions.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-forest-950 text-ivory-100 text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isReconciled ? 'Deterministic Balance: 100% Reconciled' : 'Reconciliation Pending'}
            </span>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ivory-300">
          <div>
            <span className="text-xs text-charcoal-500 font-medium">Target Budget</span>
            <div className="text-xl mt-0.5">
              <Rupee amount={plan.totalBudget} className="text-xl text-forest-950 font-bold" />
            </div>
            <span className="text-[10px] text-charcoal-500 font-medium">Total authorized ceiling</span>
          </div>

          <div>
            <span className="text-xs text-charcoal-500 font-medium">Allocated Sum</span>
            <div className="text-xl mt-0.5">
              <Rupee 
                amount={totalAllocated} 
                className={`text-xl font-bold ${isReconciled ? 'text-forest-900' : 'text-red-600'}`} 
              />
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {((totalAllocated / plan.totalBudget) * 100).toFixed(0)}% mapped
            </span>
          </div>

          <div>
            <span className="text-xs text-charcoal-500 font-medium">Committed / Booked</span>
            <div className="text-xl mt-0.5">
              <Rupee amount={totalCommitted} className="text-xl text-gold-700 font-bold" />
            </div>
            <span className="text-[10px] text-charcoal-500 font-medium flex items-center space-x-1">
              <Rupee amount={remainingUncommitted} className="text-[10px] font-semibold text-charcoal-600" />
              <span>remaining</span>
            </span>
          </div>

          <div>
            <span className="text-xs text-charcoal-500 font-medium">5% Safety Buffer</span>
            <div className="text-xl mt-0.5">
              <Rupee amount={bufferAmount} className="text-xl text-forest-900 font-bold" />
            </div>
            <span className="text-[10px] text-gold-800 font-semibold block">Included in total ceiling</span>
          </div>
        </div>

        {/* Visual Allocation Stacked Bar */}
        <div className="mt-6 pt-4 border-t border-ivory-200">
          <div className="flex justify-between items-center text-xs text-charcoal-500 mb-2 font-medium">
            <span>Category Budget Share</span>
            <span className="font-semibold text-forest-900">Total: 100% (Fully Reconciled)</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-ivory-200 shadow-inner">
            {plan.budgetCategories.map((cat, idx) => {
              const colors = [
                'bg-forest-800',
                'bg-forest-600',
                'bg-gold-500',
                'bg-gold-600',
                'bg-emerald-700',
                'bg-emerald-800',
                'bg-charcoal-600'
              ];
              return (
                <div
                  key={cat.id}
                  style={{ width: `${cat.percentageOfTotal}%` }}
                  className={`${colors[idx % colors.length]} h-full transition-all hover:opacity-80`}
                  title={`${cat.name}: ${cat.percentageOfTotal}% (₹${cat.allocatedAmount.toLocaleString('en-IN')})`}
                />
              );
            })}
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
            <span className="text-xs text-charcoal-400 font-medium">Click a row to inspect formula</span>
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
                      ? 'border-gold-500 bg-gold-50/70 shadow-sm ring-1 ring-gold-400'
                      : 'border-ivory-300 bg-white hover:border-gold-300 shadow-soft-editorial'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    {/* Category Title & Tags */}
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLock(cat.id);
                        }}
                        title={cat.isLocked ? 'Protected category (Shielded)' : 'Flexible category'}
                        className={`p-2 rounded-xl text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-gold-400 ${
                          cat.isLocked
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-ivory-200 text-charcoal-500 hover:text-charcoal-800'
                        }`}
                      >
                        {cat.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      <div className="p-2 rounded-xl bg-ivory-100 text-forest-900 border border-ivory-200">
                        {getCategoryIcon(cat.category)}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-forest-950">{cat.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            cat.costSource === 'user_provided'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-ivory-200 text-charcoal-600'
                          }`}>
                            {cat.costSource === 'user_provided' ? 'User-Set' : 'Model-Estimate'}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-500 line-clamp-1 mt-0.5 font-medium">
                          {cat.calculationBasis}
                        </p>
                      </div>
                    </div>

                    {/* Numbers */}
                    <div className="text-right sm:shrink-0">
                      <div>
                        <Rupee amount={cat.allocatedAmount} className="text-base font-bold text-forest-950" />
                      </div>
                      <div className="text-xs text-charcoal-400 font-medium">
                        {cat.percentageOfTotal}% of total
                      </div>
                    </div>

                  </div>

                  {/* Allocation Visual Bar */}
                  <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full ${isShielded ? 'bg-emerald-700' : 'bg-gold-500'}`}
                      style={{ width: `${Math.min(100, cat.percentageOfTotal * 2.2)}%` }}
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
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors focus:outline-none focus:ring-1 focus:ring-gold-400 ${
                    selectedCategory.isLocked
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-ivory-200 text-charcoal-600'
                  }`}
                >
                  {selectedCategory.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{selectedCategory.isLocked ? 'Protected' : 'Flexible'}</span>
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-sm">
                <span className="text-xs text-charcoal-500 font-medium">Allocated Ceiling</span>
                <div className="text-2xl mt-0.5">
                  <Rupee amount={selectedCategory.allocatedAmount} className="text-2xl font-bold text-forest-950" />
                </div>
                <div className="text-xs text-gold-800 font-semibold mt-1">
                  Represents {selectedCategory.percentageOfTotal}% of total authorized ceiling (₹{plan.totalBudget.toLocaleString('en-IN')})
                </div>
              </div>

              {/* Formula & Calculation Basis */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-1">
                  Calculation Formula
                </span>
                <div className="p-3.5 rounded-xl bg-ivory-100 border border-ivory-300 text-xs text-charcoal-800 font-mono leading-relaxed break-words">
                  {selectedCategory.calculationBasis}
                </div>
              </div>

              {/* Explicit Assumptions */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-forest-900 block mb-1">
                  Baseline Assumptions
                </span>
                <p className="text-xs text-charcoal-600 leading-relaxed bg-white p-3.5 rounded-xl border border-ivory-200 font-medium">
                  {selectedCategory.assumptions}
                </p>
              </div>

              {/* Buffer Specific Clarification */}
              {selectedCategory.category === 'buffer' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Contingency Clarification:</strong> This ₹{selectedCategory.allocatedAmount.toLocaleString('en-IN')} reserve is already factored inside your ₹{plan.totalBudget.toLocaleString('en-IN')} total budget. It protects against overtime charges and guest surges.
                  </span>
                </div>
              )}

              {/* Cost Provenance Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Estimates represent deterministic planning benchmarks. Real vendor quotes are managed under the Vendor Desk.
                </span>
              </div>

              {/* Committed Tracker input */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-1.5">
                  Actual Booked Contract (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="0"
                    value={selectedCategory.committedAmount || ''}
                    onChange={(e) => handleUpdateCommitted(selectedCategory.id, Number(e.target.value))}
                    placeholder="Enter booked quote..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1.5 flex justify-between">
                  <span>Variance vs Allocation:</span>
                  <span className={`font-semibold ${
                    selectedCategory.committedAmount > selectedCategory.allocatedAmount
                      ? 'text-red-600'
                      : 'text-emerald-700'
                  }`}>
                    {selectedCategory.committedAmount > 0
                      ? selectedCategory.committedAmount <= selectedCategory.allocatedAmount
                        ? `₹${(selectedCategory.allocatedAmount - selectedCategory.committedAmount).toLocaleString('en-IN')} remaining`
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
