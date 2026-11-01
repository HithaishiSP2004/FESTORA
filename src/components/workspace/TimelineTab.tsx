import React from 'react';
import { 
  CheckCircle2, 
  Link2,
  AlertTriangle,
  Check
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
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C5A059', '#163323', '#FAF8F5']
      });
    }
    onToggleMilestone(id);
  };

  const totalTasks = plan.milestones.length;
  const completedTasks = plan.milestones.filter(m => m.isCompleted).length;
  const progressPercentage = Math.round((completedTasks / (totalTasks || 1)) * 100);
  const now = new Date().getTime();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { dayMonth: '', year: '', formatted: '' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { dayMonth: dateStr, year: '', formatted: dateStr };
    
    const day = d.getDate();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });
    
    return {
      day,
      month,
      year,
      weekday,
      formatted: `${day} ${month} ${year}`
    };
  };

  const targetDateFormatted = formatDate(plan.targetDate).formatted;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-ivory-50 rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-soft-editorial">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gold-800">
              Preparation Roadmap
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 mt-1">
              Smart Milestone Timeline
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              Deadlines are dynamically tied to your celebration date ({targetDateFormatted}). If the date shifts, all dependencies auto-synchronize.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl border border-ivory-200 shadow-sm shrink-0">
            <div className="text-right">
              <div className="text-xs text-charcoal-500 font-medium">Roadmap Progress</div>
              <div className="text-sm font-bold text-forest-950">
                {completedTasks} of {totalTasks} Completed
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-forest-900 text-gold-400 flex items-center justify-center font-bold text-xs shadow-inner">
              {progressPercentage}%
            </div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden mt-6">
          <div
            className="bg-forest-800 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Milestone Ladder: Responsive, Tight Editorial Layout */}
      <div className="max-w-4xl mx-auto space-y-4">
        {plan.milestones.map(milestone => {
          const isDone = milestone.isCompleted;
          const isOverdue = !isDone && milestone.calculatedDate && new Date(milestone.calculatedDate).getTime() < now;
          const dateObj = formatDate(milestone.calculatedDate);

          return (
            <div
              key={milestone.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all shadow-soft-editorial flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                  : isOverdue
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-ivory-300 hover:border-gold-400'
              }`}
            >
              {/* Left Column: Calendar Chip & Details */}
              <div className="flex items-start space-x-4">
                
                {/* Visual Calendar Badge */}
                <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-sm transition-colors ${
                  isDone
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : isOverdue
                    ? 'bg-amber-100 border-amber-300 text-amber-950'
                    : 'bg-ivory-100 border-ivory-300 text-forest-950'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                    {dateObj.month}
                  </span>
                  <span className="text-xl font-bold font-serif leading-tight">
                    {dateObj.day}
                  </span>
                  <span className="text-[9px] text-charcoal-500 font-medium leading-none">
                    T-{milestone.dueDateDaysBefore}d
                  </span>
                </div>

                {/* Milestone Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ivory-200 text-charcoal-700">
                      {milestone.category}
                    </span>

                    {milestone.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                        Critical Path
                      </span>
                    )}

                    {isOverdue && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 flex items-center space-x-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Action Due</span>
                      </span>
                    )}

                    {isDone && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center space-x-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>Done</span>
                      </span>
                    )}
                  </div>

                  <h3 className={`text-base font-bold leading-snug ${isDone ? 'line-through text-charcoal-400' : 'text-forest-950'}`}>
                    {milestone.title}
                  </h3>

                  {milestone.notes && (
                    <p className="text-xs text-charcoal-500 leading-relaxed max-w-xl">
                      {milestone.notes}
                    </p>
                  )}

                  {milestone.dependencies && milestone.dependencies.length > 0 && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-gold-800 font-medium pt-0.5">
                      <Link2 className="w-3 h-3 text-gold-600 shrink-0" />
                      <span>Pre-requisite: {milestone.dependencies.join(', ')}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Toggle Action Button */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-ivory-200 gap-2">
                <span className="text-[11px] text-charcoal-500 sm:text-right hidden sm:block font-medium">
                  Due {dateObj.formatted}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggle(milestone.id, isDone)}
                  aria-label={`Mark milestone "${milestone.title}" as ${isDone ? 'incomplete' : 'completed'}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                      : 'bg-forest-900 hover:bg-forest-800 text-ivory-100'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-700' : 'text-gold-400'}`} />
                  <span>{isDone ? 'Completed' : 'Complete Task'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
