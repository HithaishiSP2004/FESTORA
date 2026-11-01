import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  IndianRupee, 
  Calendar, 
  Briefcase, 
  CheckCircle2
} from 'lucide-react';
import { EventPlan, BudgetCategory, VendorWorksheet, PlanDiffReport } from '../../types/event';
import { WorkspaceHeader } from './WorkspaceHeader';
import { OverviewTab } from './OverviewTab';
import { BudgetStudioTab } from './BudgetStudioTab';
import { TimelineTab } from './TimelineTab';
import { VendorDeskTab } from './VendorDeskTab';
import { WhatChangedModal } from './WhatChangedModal';
import { VersionHistoryModal } from './VersionHistoryModal';

interface WorkspaceViewProps {
  plan: EventPlan;
  onUpdatePlan: (plan: EventPlan, reason?: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline' | 'vendors'>('overview');
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateCategories = (categories: BudgetCategory[], reason: string) => {
    const updated: EventPlan = {
      ...plan,
      budgetCategories: categories,
      updatedAt: new Date().toISOString()
    };
    onUpdatePlan(updated, reason);
    showToast(reason);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = plan.milestones.map(m => {
      if (m.id === milestoneId) {
        return { ...m, isCompleted: !m.isCompleted };
      }
      return m;
    });

    const updated: EventPlan = {
      ...plan,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    };
    onUpdatePlan(updated, 'Milestone status toggled');
  };

  const handleUpdateVendorWorksheets = (worksheets: VendorWorksheet[]) => {
    const updated: EventPlan = {
      ...plan,
      vendorWorksheets: worksheets,
      updatedAt: new Date().toISOString()
    };
    onUpdatePlan(updated, 'Vendor quote shortlisted');
    showToast('Vendor quote selection saved');
  };

  const handleCommitVendorQuote = (categoryId: string, amount: number) => {
    const updatedCategories = plan.budgetCategories.map(c => {
      if (c.id === categoryId) {
        return { ...c, committedAmount: amount };
      }
      return c;
    });
    handleUpdateCategories(updatedCategories, 'Vendor commitment synced to budget');
  };

  const handleApplyAdaptation = (newPlan: EventPlan, diffReport: PlanDiffReport) => {
    onUpdatePlan(newPlan, `Adapted: ${diffReport.changeSummary}`);
    showToast(`Plan adapted! Created Version ${newPlan.version}.0`);
    setActiveTab('budget'); // Switch to budget to inspect the new numbers immediately
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-950 text-ivory-100 px-5 py-3 rounded-2xl shadow-2xl border border-gold-400 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Identity Header */}
      <WorkspaceHeader
        plan={plan}
        onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      />

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-ivory-300 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 pt-1 px-3.5 text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border-b-2 shrink-0 rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
            activeTab === 'overview'
              ? 'border-forest-900 text-forest-950 bg-ivory-50/70 shadow-[inset_0_-2px_0_0_#163323]'
              : 'border-transparent text-charcoal-500 hover:text-forest-900 hover:bg-ivory-200/50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-gold-600" />
          <span>Celebration Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`pb-3.5 pt-1 px-3.5 text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border-b-2 shrink-0 rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
            activeTab === 'budget'
              ? 'border-forest-900 text-forest-950 bg-ivory-50/70 shadow-[inset_0_-2px_0_0_#163323]'
              : 'border-transparent text-charcoal-500 hover:text-forest-900 hover:bg-ivory-200/50'
          }`}
        >
          <IndianRupee className="w-4 h-4 text-gold-600" />
          <span>Explainable Budget Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3.5 pt-1 px-3.5 text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border-b-2 shrink-0 rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
            activeTab === 'timeline'
              ? 'border-forest-900 text-forest-950 bg-ivory-50/70 shadow-[inset_0_-2px_0_0_#163323]'
              : 'border-transparent text-charcoal-500 hover:text-forest-900 hover:bg-ivory-200/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-gold-600" />
          <span>Smart Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3.5 pt-1 px-3.5 text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border-b-2 shrink-0 rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
            activeTab === 'vendors'
              ? 'border-forest-900 text-forest-950 bg-ivory-50/70 shadow-[inset_0_-2px_0_0_#163323]'
              : 'border-transparent text-charcoal-500 hover:text-forest-900 hover:bg-ivory-200/50'
          }`}
        >
          <Briefcase className="w-4 h-4 text-gold-600" />
          <span>Vendor Desk</span>
        </button>

      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            plan={plan}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetStudioTab
            plan={plan}
            onUpdateCategories={handleUpdateCategories}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            plan={plan}
            onToggleMilestone={handleToggleMilestone}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorDeskTab
            plan={plan}
            onUpdateVendorWorksheets={handleUpdateVendorWorksheets}
            onCommitVendorQuote={handleCommitVendorQuote}
          />
        )}
      </div>

      {/* Modals */}
      <WhatChangedModal
        isOpen={isAdaptModalOpen}
        onClose={() => setIsAdaptModalOpen(false)}
        currentPlan={plan}
        onApplyChanges={handleApplyAdaptation}
      />

      <VersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        plan={plan}
        onPlanRestored={(restored) => {
          onUpdatePlan(restored, 'Restored historical version');
          showToast(`Restored to Version ${restored.version}.0`);
        }}
      />

    </div>
  );
};
