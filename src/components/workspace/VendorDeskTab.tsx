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
  Sparkles,
  PlusCircle,
  Trash2,
  X
} from 'lucide-react';
import { EventPlan, VendorWorksheet, VendorQuote } from '../../types/event';
import { Rupee } from '../common/Rupee';

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

  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newQuotedAmount, setNewQuotedAmount] = useState<number | ''>('');
  const [newPackageDetails, setNewPackageDetails] = useState('');
  const [newPros, setNewPros] = useState('');
  const [newCons, setNewCons] = useState('');

  // Keyboard accessibility: Escape key listener for Add Quote modal
  React.useEffect(() => {
    if (!isAddQuoteModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAddQuoteModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddQuoteModalOpen]);

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

  const handleDeleteQuote = (quoteId: string) => {
    if (!currentWorksheet) return;

    const updatedWorksheets = plan.vendorWorksheets.map(vw => {
      if (vw.id === currentWorksheet.id) {
        const remainingQuotes = vw.quotes.filter(q => q.id !== quoteId);
        const hasBooked = remainingQuotes.some(q => q.isShortlisted);
        return {
          ...vw,
          status: hasBooked ? ('booked' as const) : ('reviewing' as const),
          quotes: remainingQuotes
        };
      }
      return vw;
    });

    onUpdateVendorWorksheets(updatedWorksheets);
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorksheet || !newVendorName.trim() || !newQuotedAmount) return;

    const newQuote: VendorQuote = {
      id: `q-${Date.now()}`,
      vendorName: newVendorName.trim(),
      quotedAmount: Number(newQuotedAmount),
      packageDetails: newPackageDetails.trim() || 'Custom vendor proposal package',
      pros: newPros.split(',').map(s => s.trim()).filter(Boolean),
      cons: newCons.split(',').map(s => s.trim()).filter(Boolean),
      isShortlisted: false
    };

    const updatedWorksheets = plan.vendorWorksheets.map(vw => {
      if (vw.id === currentWorksheet.id) {
        return {
          ...vw,
          status: vw.status === 'booked' ? vw.status : ('reviewing' as const),
          quotes: [...vw.quotes, newQuote]
        };
      }
      return vw;
    });

    onUpdateVendorWorksheets(updatedWorksheets);

    // Reset form
    setNewVendorName('');
    setNewQuotedAmount('');
    setNewPackageDetails('');
    setNewPros('');
    setNewCons('');
    setIsAddQuoteModalOpen(false);
  };

  const getWorksheetIcon = (cat: string) => {
    switch (cat) {
      case 'catering': return <Utensils className="w-3.5 h-3.5" />;
      case 'decor': return <Sparkles className="w-3.5 h-3.5" />;
      case 'photography': return <Camera className="w-3.5 h-3.5" />;
      default: return <Building className="w-3.5 h-3.5" />;
    }
  };

  const formattedCity = plan.city ? plan.city.charAt(0).toUpperCase() + plan.city.slice(1) : 'your city';

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

        {/* Notice on provenance — Explicitly transparent as required by Plan Item 4 */}
        <div className="mt-4 p-3.5 bg-white rounded-xl border border-ivory-200 text-xs text-charcoal-700 flex items-start space-x-2.5 shadow-sm">
          <Info className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Planning estimates</strong> are system-generated starting points, not verified vendor quotations. Add actual vendor quotes to compare offers and track commitments.
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-ivory-300">
          {plan.vendorWorksheets.map(vw => (
            <button
              key={vw.id}
              onClick={() => setActiveCategory(vw.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 focus:outline-none focus:ring-1 focus:ring-gold-400 ${
                currentWorksheet?.id === vw.id
                  ? 'bg-forest-900 text-ivory-100 shadow-sm'
                  : 'bg-white border border-ivory-300 text-charcoal-700 hover:border-gold-400'
              }`}
            >
              {getWorksheetIcon(vw.category)}
              <span>{vw.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                vw.status === 'booked' 
                  ? 'bg-emerald-200 text-emerald-900' 
                  : vw.status === 'shortlisted'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gold-100 text-gold-900'
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
                <span className="text-xs text-charcoal-500 font-medium flex items-center space-x-1">
                  <span>Planning Target:</span>
                  <Rupee amount={currentWorksheet.estimatedBudget} className="text-xs text-forest-950 font-bold" />
                </span>
              </div>

              <ul className="space-y-2 text-xs text-charcoal-700">
                {currentWorksheet.keyRequirements.map((req, i) => (
                  <li key={i} className="p-3 rounded-xl bg-white border border-ivory-200 flex items-start space-x-2 shadow-sm">
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
                  <div key={i} className="p-3 rounded-xl bg-forest-900/80 border border-forest-800 text-xs text-ivory-200 leading-relaxed font-light">
                    "{q}"
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right 2 Cols: Quotation Comparison Matrix */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 px-1">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  Vendor Quotations ({currentWorksheet.quotes.length})
                </span>
                <span className="text-xs text-charcoal-400 font-medium ml-2">
                  Planning Ceiling: <Rupee amount={currentWorksheet.estimatedBudget} className="text-xs text-charcoal-600 font-semibold" />
                </span>
              </div>

              <button
                onClick={() => setIsAddQuoteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                <span>Add Vendor Quote</span>
              </button>
            </div>

            {currentWorksheet.quotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentWorksheet.quotes.map(quote => {
                  const isWithinBudget = quote.quotedAmount <= currentWorksheet.estimatedBudget;
                  const delta = quote.quotedAmount - currentWorksheet.estimatedBudget;

                  return (
                    <div
                      key={quote.id}
                      className={`p-6 rounded-3xl border flex flex-col justify-between transition-all relative ${
                        quote.isShortlisted
                          ? 'border-gold-500 bg-gold-50/70 shadow-md ring-1 ring-gold-400'
                          : 'border-ivory-300 bg-white hover:border-gold-300 shadow-soft-editorial'
                      }`}
                    >
                      <div>
                        
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="font-bold text-forest-950 text-base leading-snug">
                            {quote.vendorName}
                          </h4>
                          
                          <div className="flex items-center space-x-1.5 shrink-0">
                            {quote.isShortlisted && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center space-x-1 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Committed</span>
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteQuote(quote.id)}
                              title="Delete quotation"
                              aria-label={`Delete quote from ${quote.vendorName}`}
                              className="p-1.5 text-charcoal-400 hover:text-red-600 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-2xl font-bold text-forest-950">
                            <Rupee amount={quote.quotedAmount} className="text-2xl font-bold text-forest-950" />
                          </div>
                          <div className={`text-xs font-semibold mt-0.5 ${isWithinBudget ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isWithinBudget
                              ? `Within target allocation (₹${Math.abs(delta).toLocaleString('en-IN')} surplus)`
                              : `Exceeds target by ₹${delta.toLocaleString('en-IN')}`}
                          </div>
                        </div>

                        <p className="text-xs text-charcoal-600 mb-4 bg-ivory-100 p-3 rounded-xl border border-ivory-200">
                          {quote.packageDetails}
                        </p>

                        {/* Pros */}
                        {quote.pros && quote.pros.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {quote.pros.map((p, i) => (
                              <div key={i} className="text-[11px] text-emerald-800 flex items-center space-x-1.5 font-medium">
                                <ThumbsUp className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cons */}
                        {quote.cons && quote.cons.length > 0 && (
                          <div className="space-y-1 mb-6">
                            {quote.cons.map((c, i) => (
                              <div key={i} className="text-[11px] text-amber-800 flex items-center space-x-1.5 font-medium">
                                <ThumbsDown className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>

                      <button
                        onClick={() => handleSelectQuote(quote)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                          quote.isShortlisted
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-forest-900 hover:bg-forest-800 text-ivory-100 shadow-sm'
                        }`}
                      >
                        <span>{quote.isShortlisted ? 'Contract Locked & Committed' : 'Select & Commit Quote'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                      </button>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 shadow-soft-editorial space-y-4">
                <Briefcase className="w-10 h-10 text-charcoal-300 mx-auto" />
                <div>
                  <h4 className="font-bold text-forest-950 text-base">No Quotations Uploaded Yet</h4>
                  <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
                    Use the screening questions on the left when speaking to prospective vendors in {formattedCity}.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddQuoteModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 text-xs font-bold transition-all shadow-sm inline-flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-gold-400" />
                  <span>Add First Vendor Quote</span>
                </button>
              </div>
            )}

          </div>

        </div>
      ) : null}

      {/* Add Vendor Quotation Modal */}
      {isAddQuoteModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-quote-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-forest-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-ivory-50 rounded-3xl max-w-lg w-full border border-ivory-300 shadow-2xl overflow-hidden">
            
            <div className="p-6 bg-forest-950 text-ivory-100 flex items-center justify-between border-b border-forest-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                  New Vendor Quotation
                </span>
                <h3 id="add-quote-modal-title" className="font-serif font-bold text-xl text-ivory-50">
                  {currentWorksheet?.title}
                </h3>
              </div>
              <button
                onClick={() => setIsAddQuoteModalOpen(false)}
                aria-label="Close add quotation modal"
                className="p-1.5 text-ivory-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="p-6 space-y-4 text-xs">
              <div>
                <label htmlFor="vendor-name-input" className="block font-bold text-forest-950 uppercase tracking-wider mb-1">
                  Vendor / Business Name *
                </label>
                <input
                  id="vendor-name-input"
                  type="text"
                  required
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. Royal Heritage Caterers"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white font-medium focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="quoted-amount-input" className="block font-bold text-forest-950 uppercase tracking-wider mb-1">
                  Total Quoted Price (₹) *
                </label>
                <input
                  id="quoted-amount-input"
                  type="number"
                  required
                  min="1"
                  value={newQuotedAmount}
                  onChange={(e) => setNewQuotedAmount(Number(e.target.value))}
                  placeholder="e.g. 240000"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white font-medium focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="package-details-input" className="block font-bold text-forest-950 uppercase tracking-wider mb-1">
                  Package Inclusions & Deliverables
                </label>
                <textarea
                  id="package-details-input"
                  rows={2}
                  value={newPackageDetails}
                  onChange={(e) => setNewPackageDetails(e.target.value)}
                  placeholder="e.g. Buffet for 200 guests, 3 live counters, complimentary dessert table."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white font-medium focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="pros-input" className="block font-bold text-forest-950 uppercase tracking-wider mb-1">
                  Key Strengths / Pros (comma-separated)
                </label>
                <input
                  id="pros-input"
                  type="text"
                  value={newPros}
                  onChange={(e) => setNewPros(e.target.value)}
                  placeholder="e.g. Great tasting session, Eco-friendly cutlery, Owner oversees"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white font-medium focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="cons-input" className="block font-bold text-forest-950 uppercase tracking-wider mb-1">
                  Trade-offs / Cons (comma-separated)
                </label>
                <input
                  id="cons-input"
                  type="text"
                  value={newCons}
                  onChange={(e) => setNewCons(e.target.value)}
                  placeholder="e.g. 50% non-refundable deposit required, Overtime charge after 11 PM"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white font-medium focus:ring-2 focus:ring-gold-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setIsAddQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal-600 font-semibold hover:bg-ivory-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-ivory-100 font-bold shadow-sm"
                >
                  Add Quote to Matrix
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
