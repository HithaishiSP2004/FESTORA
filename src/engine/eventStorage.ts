import { EventPlan, EventSnapshot } from '../types/event';
import { INDIAN_WEDDING_PRESET } from './culturalTemplates';

const CURRENT_PLAN_KEY = 'festora_current_plan_v1';
const SNAPSHOTS_KEY_PREFIX = 'festora_snapshots_';

export class EventStorage {
  /**
   * Retrieves the active plan from LocalStorage or returns the default Indian Wedding demo.
   */
  public static loadActivePlan(): EventPlan {
    try {
      const serialized = localStorage.getItem(CURRENT_PLAN_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Robust structural validation: ensure core properties and arrays exist
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.id === 'string' &&
          typeof parsed.title === 'string' &&
          typeof parsed.totalBudget === 'number' &&
          typeof parsed.guestCount === 'number' &&
          Array.isArray(parsed.budgetCategories) &&
          Array.isArray(parsed.milestones) &&
          parsed.budgetCategories.length > 0
        ) {
          return parsed as EventPlan;
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error, falling back to initial preset:', e);
    }
    // Default to the flagship Indian Wedding demo preset
    this.savePlan(INDIAN_WEDDING_PRESET, 'Initial Heritage Wedding baseline plan');
    return INDIAN_WEDDING_PRESET;
  }

  /**
   * Persists the plan and automatically captures a version snapshot.
   */
  public static savePlan(plan: EventPlan, snapshotDescription: string = 'Plan updated'): void {
    try {
      localStorage.setItem(CURRENT_PLAN_KEY, JSON.stringify(plan));
      this.recordSnapshot(plan, snapshotDescription);
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  /**
   * Saves a snapshot of the plan state into the version history.
   */
  public static recordSnapshot(plan: EventPlan, description: string): EventSnapshot {
    const snapshot: EventSnapshot = {
      snapshotId: `snap-${plan.id}-v${plan.version}-${Date.now()}`,
      version: plan.version,
      timestamp: new Date().toISOString(),
      description,
      plan: JSON.parse(JSON.stringify(plan)), // Deep copy
    };

    try {
      const key = `${SNAPSHOTS_KEY_PREFIX}${plan.id}`;
      const existingStr = localStorage.getItem(key);
      const snapshots: EventSnapshot[] = existingStr ? JSON.parse(existingStr) : [];
      
      // Avoid duplicate consecutive identical versions
      const lastSnap = snapshots[snapshots.length - 1];
      if (!lastSnap || lastSnap.version !== plan.version) {
        snapshots.push(snapshot);
        // Keep up to 20 snapshots per event to stay lightweight
        if (snapshots.length > 20) snapshots.shift();
        localStorage.setItem(key, JSON.stringify(snapshots));
      }
    } catch (e) {
      console.warn('Snapshot persistence error:', e);
    }

    return snapshot;
  }

  /**
   * Loads all snapshots for a given event ID.
   */
  public static getSnapshots(eventId: string): EventSnapshot[] {
    try {
      const key = `${SNAPSHOTS_KEY_PREFIX}${eventId}`;
      const existingStr = localStorage.getItem(key);
      return existingStr ? JSON.parse(existingStr) : [];
    } catch (e) {
      console.warn('Snapshot retrieval error:', e);
      return [];
    }
  }

  /**
   * Restores a plan to a previous snapshot state.
   */
  public static rollbackToSnapshot(eventId: string, snapshotId: string): EventPlan | null {
    const snapshots = this.getSnapshots(eventId);
    const target = snapshots.find(s => s.snapshotId === snapshotId);
    if (!target) return null;

    // Find highest version across all existing snapshots to advance monotonically without version collisions
    const maxVersion = snapshots.reduce((max, s) => Math.max(max, s.version), target.plan.version);
    const restoredPlan: EventPlan = {
      ...JSON.parse(JSON.stringify(target.plan)),
      version: maxVersion + 1,
      updatedAt: new Date().toISOString()
    };

    this.savePlan(restoredPlan, `Restored to version ${target.version} (${target.description})`);
    return restoredPlan;
  }

  /**
   * Clears saved state and resets to the default flagship demo.
   */
  public static resetToDefault(): EventPlan {
    try {
      localStorage.removeItem(CURRENT_PLAN_KEY);
      localStorage.removeItem(`${SNAPSHOTS_KEY_PREFIX}${INDIAN_WEDDING_PRESET.id}`);
    } catch (e) {
      console.warn('Reset error:', e);
    }
    return this.loadActivePlan();
  }
}

