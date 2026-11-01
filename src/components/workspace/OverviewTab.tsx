import React, { useState } from 'react';
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
  Shirt,
  Image as ImageIcon
} from 'lucide-react';
import { EventPlan, OccasionType } from '../../types/event';
import { Rupee } from '../common/Rupee';

interface OverviewTabProps {
  plan: EventPlan;
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors') => void;
}

interface InspirationItem {
  url: string;
  caption: string;
  category: string;
}

const INSPIRATION_GALLERY: Record<OccasionType, InspirationItem[]> = {
  wedding: [
    {
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      caption: 'Mandap Floral Architecture & Ambient Glow',
      category: 'Décor & Ambience'
    },
    {
      url: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=800&q=80',
      caption: 'Artisanal Heritage Dining & Thali Service',
      category: 'Catering Presentation'
    },
    {
      url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=800&q=80',
      caption: 'Twilight Deepam Lamp-Lighting Rituals',
      category: 'Signature Experience'
    }
  ],
  birthday: [
    {
      url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
      caption: 'Botanical Garden & Balloon Arch Scenography',
      category: 'Décor & Styling'
    },
    {
      url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      caption: 'Artisanal Dessert Studio & Celebratory Cake',
      category: 'Food & Dining'
    },
    {
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
      caption: 'Warm Fairy-Light Canopy & Open-Air Ambience',
      category: 'Atmosphere & Lighting'
    }
  ],
  anniversary: [
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      caption: 'Heritage Estate Banquet & Gold Floral Styling',
      category: 'Venue & Scenography'
    },
    {
      url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      caption: 'Multi-Course Gourmet Tasting Presentation',
      category: 'Catering Excellence'
    },
    {
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
      caption: 'Candlelit Family Toast & Musical Atmosphere',
      category: 'Celebration Moment'
    }
  ],
  engagement: [
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      caption: 'Contemporary Ring Ceremony Floral Arch',
      category: 'Ceremony Stage'
    },
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      caption: 'Curated Welcome Mocktails & Hors d\'oeuvres',
      category: 'Gourmet Service'
    },
    {
      url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden Sunset Reception & Music Lounge',
      category: 'Evening Ambience'
    }
  ],
  community: [
    {
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      caption: 'Grand Cultural Stage & Illumination Rigs',
      category: 'Stage & Production'
    },
    {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      caption: 'Live Regional Culinary Counters & Utsav Buffet',
      category: 'Community Dining'
    },
    {
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      caption: 'Vibrant Festival Gathering & Musical Energy',
      category: 'Atmosphere'
    }
  ]
};

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

  // Image fallback states
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  };

  const inspirationItems = INSPIRATION_GALLERY[plan.occasion] || INSPIRATION_GALLERY.wedding;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) 
      ? dateStr 
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
      
      {/* Top Grid: Concept & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Creative Theme Concept + Visual Inspiration Gallery */}
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

          {/* Curated Visual Inspiration Gallery (Requirement 1 & 2) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Visual Styling & Atmosphere Inspiration</span>
              </span>
              <span className="text-[11px] text-charcoal-400 font-medium">Curated for {plan.occasion}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {inspirationItems.map((item, idx) => {
                const isFailed = failedImages[idx];
                return (
                  <div
                    key={idx}
                    className="group relative rounded-2xl overflow-hidden border border-ivory-300 bg-forest-950/5 shadow-sm transition-all hover:shadow-md hover:border-gold-400"
                  >
                    <div className="h-36 sm:h-40 w-full overflow-hidden bg-forest-950 relative">
                      {!isFailed ? (
                        <img
                          src={item.url}
                          alt={item.caption}
                          onError={() => handleImageError(idx)}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-forest-900 text-ivory-200 text-center">
                          <ImageIcon className="w-6 h-6 text-gold-400 mb-1" />
                          <span className="text-[11px] font-semibold">{item.category}</span>
                        </div>
                      )}
                      
                      {/* Overlay Category Tag */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-forest-950/75 backdrop-blur-sm text-[10px] font-bold text-gold-300 uppercase tracking-wider border border-gold-500/30">
                        {item.category}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border-t border-ivory-200">
                      <p className="text-xs font-semibold text-forest-950 line-clamp-1 group-hover:text-gold-700 transition-colors">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Palette (Clean Multi-Line Wrapping, No Text Truncation) */}
          <div className="pt-2">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-500 block mb-3">
              Curated Celebration Palette
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {plan.themeConcept.colorPalette.map(c => (
                <div key={c.name} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white border border-ivory-200 shadow-sm min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-forest-950 leading-tight break-words line-clamp-2" title={c.name}>
                      {c.name}
                    </div>
                    <div className="text-[10px] text-charcoal-400 uppercase font-mono mt-0.5">
                      {c.hex}
                    </div>
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
                <span className="text-xs text-charcoal-500 font-medium">Overall Preparedness</span>
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

          {/* Upcoming Actions with Formatted Dates */}
          <div className="bg-ivory-50 rounded-3xl p-6 border border-ivory-300 shadow-soft-editorial">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-forest-900 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-gold-600" />
                <span>Next On Critical Path</span>
              </span>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-gold-700 hover:text-gold-800 focus:outline-none focus:underline"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {pendingMilestones.map(m => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-white border border-ivory-200 text-xs flex items-start justify-between gap-2 shadow-sm"
                >
                  <div>
                    <div className="font-bold text-forest-950 leading-snug">{m.title}</div>
                    <div className="text-[11px] text-charcoal-500 mt-1 font-medium">
                      Target: <span className="text-forest-900 font-semibold">{formatDate(m.calculatedDate)}</span> (T-{m.dueDateDaysBefore} days)
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
      <div className="bg-forest-950 text-ivory-100 rounded-3xl p-6 sm:p-8 border border-forest-800 shadow-elevated-editorial">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-forest-900 border border-gold-500/40 text-gold-400 flex items-center justify-center shadow-sm">
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
                    <div className="mt-0.5">
                      <Rupee amount={cat.allocatedAmount} className="text-gold-300 text-xs font-bold" />
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
