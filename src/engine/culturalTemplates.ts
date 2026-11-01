import { EventPlan, VendorWorksheet, BudgetCategory } from '../types/event';
import { BudgetEngine } from './budgetEngine';
import { TimelineEngine } from './timelineEngine';

/**
 * Generates realistic vendor worksheets tailored to the selected city and calculated budget allocations.
 */
export function generateRealisticVendorWorksheets(
  city: string,
  budgetCategories: BudgetCategory[]
): VendorWorksheet[] {
  const cateringAlloc = budgetCategories.find(c => c.category === 'catering')?.allocatedAmount || 200000;
  const venueAlloc = budgetCategories.find(c => c.category === 'venue')?.allocatedAmount || 150000;
  const decorAlloc = budgetCategories.find(c => c.category === 'decor')?.allocatedAmount || 80000;
  const photoAlloc = budgetCategories.find(c => c.category === 'photography')?.allocatedAmount || 60000;

  const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Bangalore';
  const now = Date.now();

  return [
    {
      id: 'vw-catering',
      category: 'catering',
      title: 'Catering & Dining Worksheet',
      estimatedBudget: cateringAlloc,
      status: 'reviewing',
      keyRequirements: [
        'Multi-course regional specialty menu & live counters',
        'Welcome beverages, mocktail bar & dessert spread',
        'Uniformed waitstaff, setup & cleanup included'
      ],
      screeningQuestions: [
        'Is mineral water and welcome beverage service included in per-plate rate?',
        'What is your cancellation policy if headcount changes 7 days prior?',
        'Do you provide live food counter chefs and cleanup personnel?'
      ],
      quotes: [
        {
          id: `q-cat-1-${now}`,
          vendorName: `${cityName} Artisanal Feasts & Banquets`,
          quotedAmount: Math.round(cateringAlloc * 0.95),
          packageDetails: 'Full celebratory buffet with 3 live counters, mocktail bar, and personalized dessert studio.',
          pros: ['Exemplary food tasting rating', 'Eco-friendly tableware', 'Dedicated on-site manager'],
          cons: ['Requires 40% advance deposit at signing'],
          isShortlisted: true
        },
        {
          id: `q-cat-2-${now + 1}`,
          vendorName: 'Royal Spice Caterers & Events',
          quotedAmount: Math.round(cateringAlloc * 1.05),
          packageDetails: 'Grand regional feast spread with 4 live stations and premium dessert fountain.',
          pros: ['Generous portion sizes', 'Extensive multi-cuisine menu options'],
          cons: [`Exceeds planning benchmark by ₹${Math.round(cateringAlloc * 0.05).toLocaleString('en-IN')}`],
          isShortlisted: false
        }
      ]
    },
    {
      id: 'vw-venue',
      category: 'venue',
      title: 'Celebration Venue & Banquet Hall',
      estimatedBudget: venueAlloc,
      status: 'reviewing',
      keyRequirements: [
        'Air-conditioned banquet or lush open lawn with backup generator',
        'Dedicated parking and valet coordination',
        'Ample green rooms / dressing suites for hosts'
      ],
      screeningQuestions: [
        'Are generator and AC power backup charges included in the base rental?',
        'What is the permitted music curfew and sound cutoff hour?',
        'Is outside catering and decor permitted without penalty fee?'
      ],
      quotes: [
        {
          id: `q-ven-1-${now + 2}`,
          vendorName: `${cityName} Heritage Garden & Banquets`,
          quotedAmount: Math.round(venueAlloc * 0.96),
          packageDetails: 'Full-day access, climate-controlled main hall, green lawn, 2 bridal suites, backup generator.',
          pros: ['Convenient central location', 'Ample valet parking capacity'],
          cons: ['Teardown must conclude strictly by 11:30 PM'],
          isShortlisted: false
        }
      ]
    },
    {
      id: 'vw-decor',
      category: 'decor',
      title: 'Styling, Florals & Ambient Scenography',
      estimatedBudget: decorAlloc,
      status: 'reviewing',
      keyRequirements: [
        'Custom ceremonial backdrop and entrance floral arch',
        'Ambient warm fairy-light canopy and table centerpieces',
        'Eco-friendly seasonal florals and props'
      ],
      screeningQuestions: [
        'Are heavy power generator cabling and setup labor included?',
        'How many hours prior to ceremony commencement will decor be 100% ready?',
        'Do you provide safety fire clearance for ceremonial candles or lamps?'
      ],
      quotes: [
        {
          id: `q-dec-1-${now + 3}`,
          vendorName: 'Aura Floral & Event Stylists',
          quotedAmount: Math.round(decorAlloc * 0.98),
          packageDetails: 'Entrance floral styling, stage backdrop with brass fixtures, ambient lighting and seating decor.',
          pros: ['Prompt setup 3 hours before start', 'Fresh local blooms sourced morning-of'],
          cons: ['Extra charge for overnight teardown'],
          isShortlisted: false
        }
      ]
    },
    {
      id: 'vw-photography',
      category: 'photography',
      title: 'Candid Photography & Cinematography',
      estimatedBudget: photoAlloc,
      status: 'reviewing',
      keyRequirements: [
        '1 Senior Candid Photographer + 1 Cinematic Videographer',
        'Teaser highlight reel (60 seconds) within 72 hours',
        'High-resolution raw image drive + 1 Premium photo album'
      ],
      screeningQuestions: [
        'What is the guaranteed turnaround for edited video and album proofing?',
        'Are crew travel, food, and drone permits included in the package?',
        'Can we review unedited raw photos before final album selection?'
      ],
      quotes: [
        {
          id: `q-pho-1-${now + 4}`,
          vendorName: 'Lumière Memories & Films',
          quotedAmount: Math.round(photoAlloc * 0.95),
          packageDetails: 'Full ceremony coverage, 2 photographers, cinematic highlight reel, 200 edited images, deluxe album.',
          pros: ['Award-winning candid capture style', 'Quick 48-hour social media teaser'],
          cons: ['Full album print delivery takes 3-4 weeks'],
          isShortlisted: false
        }
      ]
    }
  ];
}

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

