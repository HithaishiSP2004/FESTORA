import React from 'react';
import { 
  CheckCircle2, 
  Link2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan } from '../../types/event';

interface TimelineTabProps {
  plan: EventPlan;
  onToggleMilestone: (milestoneId: string) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  plan,
  onToggleMilestone,
}) => {
  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      // Trigger subtle celebration confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C5A059', '#163323', '#FAF8F5']
      });
    }
    onToggleMilestone(id);
  };

  const totalTasks = plan.milestones.length;
  const completedTasks = plan.milestones.filter(m => m.isCompleted).length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-ivory-50 rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-editorial">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gold-800">
              Preparation Roadmap
            </span>
            <h2 className="text-2xl font-serif font-bold text-forest-950 mt-1">
              Smart Milestone Timeline
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Deadlines are dynamically tied to your celebration date ({plan.targetDate}). If the date shifts, all dependencies auto-synchronize.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-ivory-200">
            <div className="text-right">
              <div className="text-xs text-charcoal-500 font-medium">Progress</div>
              <div className="text-sm font-bold text-forest-950">
                {completedTasks} of {totalTasks} Completed
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-forest-900 text-gold-400 flex items-center justify-center font-bold text-xs">
              {Math.round((completedTasks / (totalTasks || 1)) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Ladder */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-gold-300/80 space-y-6 ml-3 sm:ml-6">
        {plan.milestones.map(milestone => {
          const isDone = milestone.isCompleted;

          return (
            <div
              key={milestone.id}
              className={`relative bg-ivory-50 rounded-2xl p-5 border transition-all ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/30 opacity-80'
                  : 'border-ivory-300 hover:border-gold-400 shadow-soft-editorial'
              }`}
            >
              {/* Timeline Node Point */}
              <button
                onClick={() => handleToggle(milestone.id, isDone)}
                className={`absolute -left-[35px] sm:-left-[43px] top-5 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-gold-500 text-transparent hover:text-gold-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 fill-current" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                
                {/* Title & Category */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ivory-200 text-charcoal-700">
                      {milestone.category}
                    </span>
                    {milestone.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        Critical Path
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Done
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold mt-1.5 ${isDone ? 'line-through text-charcoal-500' : 'text-forest-950'}`}>
                    {milestone.title}
                  </h3>

                  {milestone.notes && (
                    <p className="text-xs text-charcoal-600 mt-1 max-w-xl">
                      {milestone.notes}
                    </p>
                  )}

                  {milestone.dependencies && milestone.dependencies.length > 0 && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-gold-800 mt-2">
                      <Link2 className="w-3 h-3 text-gold-600" />
                      <span>Pre-requisite: {milestone.dependencies.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Due Date & Action */}
                <div className="sm:text-right shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ivory-200">
                  <div className="text-xs font-bold text-forest-950">
                    {milestone.calculatedDate}
                  </div>
                  <div className="text-[11px] text-charcoal-500">
                    T-{milestone.dueDateDaysBefore} days before
                  </div>

                  <button
                    onClick={() => handleToggle(milestone.id, isDone)}
                    className={`mt-2 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isDone
                        ? 'bg-ivory-200 text-charcoal-600 hover:bg-ivory-300'
                        : 'bg-forest-900 text-ivory-100 hover:bg-forest-800'
                    }`}
                  >
                    {isDone ? 'Mark Incomplete' : 'Complete Task'}
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
