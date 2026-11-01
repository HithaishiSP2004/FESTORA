import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  HelpCircle, 
  ThumbsUp, 
  ThumbsDown,
  ArrowRight,
  Info,
  Building,
  Utensils,
  Camera,
  Sparkles
} from 'lucide-react';
import { EventPlan, VendorWorksheet, VendorQuote } from '../../types/event';

interface VendorDeskTabProps {
  plan: EventPlan;
  onUpdateVendorWorksheets: (worksheets: VendorWorksheet[]) => void;
  onCommitVendorQuote: (categoryId: string, amount: number) => void;
}

export const VendorDeskTab: React.FC<VendorDeskTabProps> = ({
  plan,
  onUpdateVendorWorksheets,
  onCommitVendorQuote,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    plan.vendorWorksheets[0]?.id || ''
  );

  const currentWorksheet = plan.vendorWorksheets.find(v => v.id === activeCategory) || plan.vendorWorksheets[0];

  const handleSelectQuote = (quote: VendorQuote) => {
    if (!currentWorksheet) return;

    const updatedWorksheets = plan.vendorWorksheets.map(vw => {
      if (vw.id === currentWorksheet.id) {
        return {
          ...vw,
          status: 'booked' as const,
          quotes: vw.quotes.map(q => ({
            ...q,
            isShortlisted: q.id === quote.id
          }))
        };
      }
      return vw;
    });

    onUpdateVendorWorksheets(updatedWorksheets);

    // Sync committed spend to budget category
    const cat = plan.budgetCategories.find(c => c.category === currentWorksheet.category);
    if (cat) {
      onCommitVendorQuote(cat.id, quote.quotedAmount);
    }
  };

  const getWorksheetIcon = (cat: string) => {
    switch (cat) {
      case 'catering': return <Utensils className="w-3.5 h-3.5" />;
      case 'decor': return <Sparkles className="w-3.5 h-3.5" />;
      case 'photography': return <Camera className="w-3.5 h-3.5" />;
      default: return <Building className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-ivory-50 rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-editorial">
        <span className="text-xs uppercase font-bold tracking-wider text-gold-800">
          Vendor Intelligence & Quotation Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
          Vendor Desk
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl">
          Review customized briefs, cultural screening checklists, and side-by-side vendor quotes before signing contracts.
        </p>

        {/* Notice on provenance */}
        <div className="mt-4 p-3 bg-white rounded-xl border border-ivory-200 text-xs text-charcoal-600 flex items-start space-x-2">
          <Info className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
          <span>
            Quotes shown are realistic market estimates for {plan.city}. Selecting a quote commits that amount to your active budget tracker.
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-ivory-300">
          {plan.vendorWorksheets.map(vw => (
            <button
              key={vw.id}
              onClick={() => setActiveCategory(vw.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                currentWorksheet?.id === vw.id
                  ? 'bg-forest-900 text-ivory-100 shadow-sm'
                  : 'bg-white border border-ivory-300 text-charcoal-700 hover:border-gold-400'
              }`}
            >
              {getWorksheetIcon(vw.category)}
              <span>{vw.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                vw.status === 'booked' ? 'bg-emerald-200 text-emerald-900' : 'bg-gold-100 text-gold-900'
              }`}>
                {vw.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {currentWorksheet ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Requirements & Screening Questions */}
          <div className="space-y-6">
            
            {/* Requirements Card */}
            <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-forest-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Specifications</span>
                </span>
                <span className="text-xs font-serif font-bold text-forest-950">
                  Target: ₹{currentWorksheet.estimatedBudget.toLocaleString('en-IN')}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-charcoal-700">
                {currentWorksheet.keyRequirements.map((req, i) => (
                  <li key={i} className="p-3 rounded-xl bg-white border border-ivory-200 flex items-start space-x-2">
                    <span className="text-gold-600 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Screening Questions */}
            <div className="bg-forest-950 text-ivory-100 rounded-3xl p-6 border border-forest-800 shadow-soft-editorial space-y-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-gold-400" />
                <span className="text-xs uppercase font-bold tracking-wider text-gold-400">
                  Screening Questions To Ask
                </span>
              </div>

              <div className="space-y-2.5">
                {currentWorksheet.screeningQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-xl bg-forest-900/80 border border-forest-800 text-xs text-ivory-200 leading-relaxed">
                    "{q}"
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right 2 Cols: Quotation Comparison Matrix */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Vendor Quotations ({currentWorksheet.quotes.length})
              </span>
              <span className="text-xs text-charcoal-400 font-medium">
                Allocated Ceiling: ₹{currentWorksheet.estimatedBudget.toLocaleString('en-IN')}
              </span>
            </div>

            {currentWorksheet.quotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentWorksheet.quotes.map(quote => {
                  const isWithinBudget = quote.quotedAmount <= currentWorksheet.estimatedBudget;
                  const delta = quote.quotedAmount - currentWorksheet.estimatedBudget;

                  return (
                    <div
                      key={quote.id}
                      className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                        quote.isShortlisted
                          ? 'border-gold-500 bg-gold-50/60 shadow-md ring-1 ring-gold-400'
                          : 'border-ivory-300 bg-white hover:border-gold-300 shadow-soft-editorial'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="font-bold text-forest-950 text-base leading-snug">
                            {quote.vendorName}
                          </h4>
                          {quote.isShortlisted && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Committed</span>
                            </span>
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="text-2xl font-serif font-bold text-forest-950">
                            ₹{quote.quotedAmount.toLocaleString('en-IN')}
                          </div>
                          <div className={`text-xs font-semibold ${isWithinBudget ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isWithinBudget
                              ? `Within target allocation (₹${Math.abs(delta).toLocaleString('en-IN')} surplus)`
                              : `Exceeds target by ₹${delta.toLocaleString('en-IN')}`}
                          </div>
                        </div>

                        <p className="text-xs text-charcoal-600 mb-4 bg-ivory-100 p-3 rounded-xl border border-ivory-200">
                          {quote.packageDetails}
                        </p>

                        {/* Pros */}
                        <div className="space-y-1 mb-2">
                          {quote.pros.map((p, i) => (
                            <div key={i} className="text-[11px] text-emerald-800 flex items-center space-x-1.5">
                              <ThumbsUp className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>

                        {/* Cons */}
                        <div className="space-y-1 mb-6">
                          {quote.cons.map((c, i) => (
                            <div key={i} className="text-[11px] text-amber-800 flex items-center space-x-1.5">
                              <ThumbsDown className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectQuote(quote)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                          quote.isShortlisted
                            ? 'bg-emerald-700 text-white'
                            : 'bg-forest-900 hover:bg-forest-800 text-ivory-100'
                        }`}
                      >
                        <span>{quote.isShortlisted ? 'Contract Locked' : 'Select & Commit Quote'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                      </button>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300">
                <Briefcase className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                <h4 className="font-bold text-forest-950 text-base">No Quotations Uploaded Yet</h4>
                <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
                  Use the screening questions on the left when contacting prospective vendors in {plan.city}.
                </p>
              </div>
            )}

          </div>

        </div>
      ) : null}

    </div>
  );
};
