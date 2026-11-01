import React from 'react';
import { X, History, RotateCcw } from 'lucide-react';
import { EventSnapshot, EventPlan } from '../../types/event';
import { EventStorage } from '../../engine/eventStorage';
import { Rupee } from '../common/Rupee';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onPlanRestored: (restoredPlan: EventPlan) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanRestored,
}) => {
  if (!isOpen) return null;

  const snapshots: EventSnapshot[] = EventStorage.getSnapshots(plan.id);

  const handleRollback = (snapshotId: string) => {
    if (window.confirm('Restore plan to this version? All subsequent changes will be safely superseded.')) {
      const restored = EventStorage.rollbackToSnapshot(plan.id, snapshotId);
      if (restored) {
        onPlanRestored(restored);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-forest-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-ivory-50 rounded-3xl max-w-2xl w-full border border-ivory-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-forest-950 text-ivory-100 flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-forest-800 text-gold-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-ivory-50">Version Snapshot History</h3>
              <p className="text-xs text-ivory-300">Auditable trace of every plan adaptation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ivory-400 hover:text-white hover:bg-forest-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {snapshots.length > 0 ? (
            snapshots.map(snap => {
              const isCurrent = snap.version === plan.version;
              const dateFormatted = new Date(snap.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div
                  key={snap.snapshotId}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-gold-500 bg-gold-50/70 shadow-sm'
                      : 'border-ivory-300 bg-white hover:border-gold-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-forest-950">
                        Version {snap.version}.0
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active Version
                        </span>
                      )}
                      <span className="text-xs text-charcoal-400">
                        {dateFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal-600 mt-1 font-medium">
                      {snap.description}
                    </p>

                    <div className="text-[11px] text-charcoal-500 mt-1 flex items-center space-x-1">
                      <span>Budget:</span>
                      <Rupee amount={snap.plan.totalBudget} className="text-[11px] font-semibold text-charcoal-700" />
                      <span>• {snap.plan.guestCount} Guests</span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => handleRollback(snap.snapshotId)}
                      className="px-3 py-1.5 rounded-xl border border-ivory-300 hover:border-gold-400 bg-ivory-100 hover:bg-ivory-200 text-xs font-semibold text-forest-950 flex items-center space-x-1.5 shrink-0 self-start sm:self-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gold-600" />
                      <span>Revert to this</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-charcoal-500 text-xs">
              No historical snapshots recorded yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-ivory-100 border-t border-ivory-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-forest-900 text-ivory-100 text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
