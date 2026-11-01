export type OccasionType = 
  | 'wedding' 
  | 'birthday' 
  | 'anniversary' 
  | 'engagement' 
  | 'community';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface PrioritySettings {
  catering: PriorityLevel;
  venue: PriorityLevel;
  decor: PriorityLevel;
  photography: PriorityLevel;
  entertainment: PriorityLevel;
  attire: PriorityLevel;
}

export type CostSource = 'system_estimated' | 'user_provided';

export interface BudgetCategory {
  id: string;
  name: string;
  category: 'venue' | 'catering' | 'decor' | 'photography' | 'entertainment' | 'attire' | 'buffer';
  allocatedAmount: number;
  committedAmount: number;
  percentageOfTotal: number;
  priority: PriorityLevel;
  isLocked: boolean;
  costSource: CostSource;
  calculationBasis: string;
  assumptions: string;
  costPerUnit?: number;
  unitLabel?: string;
  unitCount?: number;
}

export interface TaskMilestone {
  id: string;
  title: string;
  category: string;
  dueDateDaysBefore: number; // e.g. 90 = 90 days before event date
  calculatedDate?: string;
  priority: PriorityLevel;
  isCompleted: boolean;
  dependencies?: string[]; // IDs of milestones that must be done first
  notes?: string;
}

export interface VendorWorksheet {
  id: string;
  category: string;
  title: string;
  estimatedBudget: number;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'booked';
  keyRequirements: string[];
  screeningQuestions: string[];
  quotes: VendorQuote[];
}

export interface VendorQuote {
  id: string;
  vendorName: string;
  quotedAmount: number;
  packageDetails: string;
  pros: string[];
  cons: string[];
  isShortlisted?: boolean;
}

export interface EventThemeConcept {
  title: string;
  tagline: string;
  colorPalette: { name: string; hex: string }[];
  culturalElements: string[];
  suggestedActivities: string[];
  editorialSummary: string;
}

export interface EventPlan {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  occasion: OccasionType;
  subType?: string; // e.g., "Traditional South Indian & Modern Reception"
  targetDate: string; // YYYY-MM-DD
  city: string;
  totalBudget: number; // in INR
  guestCount: number;
  priorities: PrioritySettings;
  themeConcept: EventThemeConcept;
  budgetCategories: BudgetCategory[];
  milestones: TaskMilestone[];
  vendorWorksheets: VendorWorksheet[];
}

export interface EventSnapshot {
  snapshotId: string;
  version: number;
  timestamp: string;
  description: string;
  plan: EventPlan;
}

export interface CategoryDiff {
  categoryId: string;
  categoryName: string;
  previousAmount: number;
  newAmount: number;
  difference: number;
  percentChange: number;
  isProtected: boolean;
  explanation: string;
}

export interface PlanDiffReport {
  changeSummary: string;
  previousBudget: number;
  newBudget: number;
  budgetDifference: number;
  previousGuests: number;
  newGuests: number;
  guestDifference: number;
  previousDate?: string;
  newDate?: string;
  categoryDiffs: CategoryDiff[];
  impactSeverity: 'low' | 'moderate' | 'critical';
  compromises: {
    category: string;
    description: string;
    suggestedSavings: number;
  }[];
  strategicAdvice: string;
}

