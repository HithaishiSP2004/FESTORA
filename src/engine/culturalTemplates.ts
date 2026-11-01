import { EventPlan, VendorWorksheet } from '../types/event';
import { BudgetEngine } from './budgetEngine';
import { TimelineEngine } from './timelineEngine';

export const INDIAN_WEDDING_PRESET: EventPlan = (() => {
  const totalBudget = 800000; // ₹8,00,000
  const guestCount = 200;
  const targetDate = '2026-12-18';
  const priorities = {
    catering: 'high',
    venue: 'high',
    photography: 'high',
    decor: 'medium',
    attire: 'medium',
    entertainment: 'low',
  } as const;

  const budgetCategories = BudgetEngine.calculateInitialBudget({
    totalBudget,
    guestCount,
    occasion: 'wedding',
    priorities,
  });

  const milestones = TimelineEngine.generateMilestones('wedding', targetDate);

  const vendorWorksheets: VendorWorksheet[] = [
    {
      id: 'vw-catering',
      category: 'catering',
      title: 'Royal Indian Buffet & Live Counters',
      estimatedBudget: budgetCategories.find(c => c.category === 'catering')?.allocatedAmount || 300000,
      status: 'reviewing',
      keyRequirements: [
        '30+ item North & South Indian dinner buffet',
        'Live Chaat & Dosa counter for evening cocktail hour',
        'Traditional brass chafing dishes and uniformed waitstaff',
        'Special dietary section (Pure Jain & Vegan options clearly marked)'
      ],
      screeningQuestions: [
        'Is mineral water and welcome beverage service included in per-plate price?',
        'What is your cancellation policy if guest headcount changes 10 days before?',
        'Do you provide cleanup crew and waste segregation at venue conclusion?'
      ],
      quotes: [
        {
          id: 'q-royal-feast',
          vendorName: 'Annapurna Royal Banquets & Caterers',
          quotedAmount: 285000,
          packageDetails: 'Full 3-course dinner for 200 guests, 3 live counters, complimentary welcome mocktails.',
          pros: ['Exceptional food tasting review', 'Includes vintage silver cutlery', 'Owner personally supervises'],
          cons: ['Requires 50% non-refundable advance deposit'],
          isShortlisted: true
        },
        {
          id: 'q-swagat-cater',
          vendorName: 'Swagat Gourmet Services',
          quotedAmount: 320000,
          packageDetails: 'Premium regional live stations, artisanal gelato counter, bespoke dessert studio.',
          pros: ['High-end presentation', 'Extensive multi-cuisine menu'],
          cons: ['Exceeds allocated budget by ₹20,000'],
          isShortlisted: false
        }
      ]
    },
    {
      id: 'vw-decor',
      category: 'decor',
      title: 'Heritage Mandap & Stage Floral Scenography',
      estimatedBudget: budgetCategories.find(c => c.category === 'decor')?.allocatedAmount || 130000,
      status: 'shortlisted',
      keyRequirements: [
        'Mandap with fresh Marigold, Jasmine & Rajnigandha drape styling',
        'Grand entrance floral arch with brass Urlis and floating diyas',
        'Warm ambient fairy-light tunnel leading to banquet hall'
      ],
      screeningQuestions: [
        'Are generator charges for heavy halogen/floodlights included?',
        'How many hours before the ceremony start will setup be 100% complete?',
        'Do you handle local fire clearance permits for traditional ceremonial fire (Havan)?'
      ],
      quotes: [
        {
          id: 'q-shringar-decor',
          vendorName: 'Shringar Floral Arts',
          quotedAmount: 125000,
          packageDetails: 'Complete stage floral backdrop + Mandap decor + entrance arch + 20 banquet table centerpieces.',
          pros: ['Eco-friendly floral sourcing', 'Setup completed 4 hours in advance'],
          cons: ['Extra charge for overnight teardown after 11 PM'],
          isShortlisted: true
        }
      ]
    },
    {
      id: 'vw-photography',
      category: 'photography',
      title: 'Candid Photography & Cinematic Film',
      estimatedBudget: budgetCategories.find(c => c.category === 'photography')?.allocatedAmount || 85000,
      status: 'booked',
      keyRequirements: [
        '2 Candid Photographers + 1 Cinematic Videographer + 1 Drone operator',
        'Same-day 60-second Instagram reel highlight teaser',
        'High-resolution raw files on external hard drive + 1 Premium leather photobook'
      ],
      screeningQuestions: [
        'What is your guaranteed delivery turnaround for the 3-minute cinematic film?',
        'Do you bring your own lighting rigs for evening ceremonies?',
        'Are travel and crew food expenses included in the quoted package?'
      ],
      quotes: [
        {
          id: 'q-drishti-films',
          vendorName: 'Drishti Memories & Studios',
          quotedAmount: 82000,
          packageDetails: 'Full 2-day coverage, candid photo + video, teaser within 48 hours, 40-page hardcover album.',
          pros: ['Award-winning portfolio', 'Super friendly crew', 'Clear milestone payment schedule'],
          cons: ['Album print takes 4 weeks'],
          isShortlisted: true
        }
      ]
    }
  ];

  return {
    id: 'festora-demo-wedding',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Aarav & Diya’s Heritage Wedding Celebration',
    occasion: 'wedding',
    subType: 'Traditional Ceremony & Contemporary Reception',
    targetDate,
    city: 'Jaipur, Rajasthan',
    totalBudget,
    guestCount,
    priorities,
    themeConcept: {
      title: 'Royal Marigold & Champagne Splendor',
      tagline: 'Timeless Rajputana grandeur woven with modern warmth.',
      colorPalette: [
        { name: 'Heritage Emerald', hex: '#163323' },
        { name: 'Champagne Gold', hex: '#C5A059' },
        { name: 'Marigold Ochre', hex: '#E59B2E' },
        { name: 'Warm Ivory', hex: '#FAF8F5' }
      ],
      culturalElements: [
        'Traditional Shehnai & Nagada welcome at entrance',
        'Handcrafted brass lamps with fresh fragrant Jasmine garlands',
        'Regional Rajasthani Dal Baati Churma & live Ghewar dessert counter'
      ],
      suggestedActivities: [
        'Family Sangeet choreography face-off with custom remix tracks',
        'Artisanal Mehendi & Lac bangle artisan gifting lounge for guests',
        'Polaroid memory tree where guests clip handwritten blessings'
      ],
      editorialSummary: 'A soulful celebration designed to balance age-old family rituals with effortless hospitality. The budget prioritizes guest culinary delight and everlasting candid imagery while keeping ornamental excess disciplined.'
    },
    budgetCategories,
    milestones,
    vendorWorksheets
  };
})();

export const GOLDEN_ANNIVERSARY_PRESET: EventPlan = (() => {
  const totalBudget = 400000;
  const guestCount = 100;
  const targetDate = '2026-11-28';
  const priorities = {
    catering: 'high',
    venue: 'medium',
    photography: 'high',
    decor: 'medium',
    attire: 'low',
    entertainment: 'medium',
  } as const;

  const budgetCategories = BudgetEngine.calculateInitialBudget({
    totalBudget,
    guestCount,
    occasion: 'anniversary',
    priorities,
  });

  const milestones = TimelineEngine.generateMilestones('anniversary', targetDate);

  return {
    id: 'festora-demo-anniversary',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: 'Ramesh & Sunita’s Golden 50th Jubilee',
    occasion: 'anniversary',
    subType: '50 Years of Love & Family Gathering',
    targetDate,
    city: 'Bengaluru, Karnataka',
    totalBudget,
    guestCount,
    priorities,
    themeConcept: {
      title: 'Golden Nostalgia & Vintage Harmony',
      tagline: 'Honoring half a century of devotion and cherished generations.',
      colorPalette: [
        { name: 'Vintage Gold', hex: '#C5A059' },
        { name: 'Warm Burgundy', hex: '#681E29' },
        { name: 'Ivory Cream', hex: '#FAF8F5' },
        { name: 'Muted Forest', hex: '#234E37' }
      ],
      culturalElements: [
        'Vow renewal ceremony with close family garland exchange',
        'Audio-visual timeline projection of 50 years of family photographs',
        'Retro 1970s Bollywood acoustic orchestra performance'
      ],
      suggestedActivities: [
        'Grandchildren story-sharing circle and surprise musical tribute',
        'Custom engraved souvenir brass diyas for all attending families',
        'Golden Champagne & Sparkling Cider cake-cutting toast'
      ],
      editorialSummary: 'An intimate, high-warmth family assembly honoring life, love, and generational continuity. The financial plan allocates generously to guest dining and cinematography.'
    },
    budgetCategories,
    milestones,
    vendorWorksheets: []
  };
})();

