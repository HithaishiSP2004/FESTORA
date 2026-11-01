import { TaskMilestone, OccasionType } from '../types/event';

export class TimelineEngine {
  /**
   * Generates a culturally prioritized task milestone schedule for an occasion.
   */
  public static generateMilestones(occasion: OccasionType, targetDateStr: string): TaskMilestone[] {
    const rawTemplates = this.getMilestoneTemplates(occasion);
    return this.calculateMilestoneDates(rawTemplates, targetDateStr);
  }

  /**
   * Recalculates milestone target dates when the event date changes.
   */
  public static calculateMilestoneDates(milestones: TaskMilestone[], targetDateStr: string): TaskMilestone[] {
    const targetDate = new Date(targetDateStr);
    
    return milestones.map(m => {
      const milestoneDate = new Date(targetDate);
      milestoneDate.setDate(milestoneDate.getDate() - m.dueDateDaysBefore);

      return {
        ...m,
        calculatedDate: milestoneDate.toISOString().split('T')[0],
      };
    }).sort((a, b) => b.dueDateDaysBefore - a.dueDateDaysBefore); // Furthest out to day-of
  }

  private static getMilestoneTemplates(occasion: OccasionType): TaskMilestone[] {
    if (occasion === 'wedding' || occasion === 'engagement') {
      return [
        {
          id: 'ms-venue',
          title: 'Finalize & Reserve Banquet Venue / Mandapam',
          category: 'venue',
          dueDateDaysBefore: 120,
          priority: 'high',
          isCompleted: false,
          notes: 'Verify air conditioning, generator backup, and parking permit capacity.'
        },
        {
          id: 'ms-caterer',
          title: 'Conduct Food Tasting & Lock Catering Contract',
          category: 'catering',
          dueDateDaysBefore: 90,
          priority: 'high',
          isCompleted: false,
          dependencies: ['ms-venue'],
          notes: 'Finalize live chaat counters, welcome beverage list, and dessert spread.'
        },
        {
          id: 'ms-photo',
          title: 'Book Candid Photographer & Cinematography Team',
          category: 'photography',
          dueDateDaysBefore: 75,
          priority: 'high',
          isCompleted: false,
          notes: 'Review unedited portfolio samples and align on delivery timeline for video teasers.'
        },
        {
          id: 'ms-decor',
          title: 'Approve Decor Concept & Floral Moodboard',
          category: 'decor',
          dueDateDaysBefore: 60,
          priority: 'medium',
          isCompleted: false,
          dependencies: ['ms-venue'],
          notes: 'Select fresh vs hybrid flowers, entrance arch style, and stage lighting ambiance.'
        },
        {
          id: 'ms-invites',
          title: 'Finalize Digital & Printed Invitation Distribution',
          category: 'coordination',
          dueDateDaysBefore: 45,
          priority: 'medium',
          isCompleted: false,
          dependencies: ['ms-venue'],
          notes: 'Send WhatsApp save-the-dates and dispatch courier parcels to outstation relatives.'
        },
        {
          id: 'ms-attire',
          title: 'Complete Bridal & Groom Attire Trials & Alterations',
          category: 'attire',
          dueDateDaysBefore: 30,
          priority: 'high',
          isCompleted: false,
          notes: 'Double check jewelry match, footwear comfort, and coordinate backup safety pins.'
        },
        {
          id: 'ms-music',
          title: 'Finalize DJ Playlist, Sangeet Tracks & MC Script',
          category: 'entertainment',
          dueDateDaysBefore: 20,
          priority: 'low',
          isCompleted: false,
          notes: 'Ensure sound equipment compliance with municipal curfew guidelines.'
        },
        {
          id: 'ms-guest-confirm',
          title: 'Collate Final RSVP Headcount for Caterer',
          category: 'catering',
          dueDateDaysBefore: 10,
          priority: 'high',
          isCompleted: false,
          dependencies: ['ms-caterer'],
          notes: 'Freeze minimum plate commitment count to prevent wastage penalties.'
        },
        {
          id: 'ms-final-run',
          title: 'Conduct Venue Walkthrough & Vendor Sequence Briefing',
          category: 'coordination',
          dueDateDaysBefore: 2,
          priority: 'high',
          isCompleted: false,
          notes: 'Assign family coordinators for vendor arrivals, payment envelopes, and guest welcoming.'
        }
      ];
    }

    // Default template for Birthday / Anniversary / Community
    return [
      {
        id: 'ms-venue',
        title: 'Book Venue or Party Space',
        category: 'venue',
        dueDateDaysBefore: 45,
        priority: 'high',
        isCompleted: false,
        notes: 'Confirm timing slots and basic AV sound support.'
      },
      {
        id: 'ms-caterer',
        title: 'Freeze Menu & Guest Catering Estimate',
        category: 'catering',
        dueDateDaysBefore: 30,
        priority: 'high',
        isCompleted: false,
        notes: 'Include vegetarian specialty items and celebratory cake order.'
      },
      {
        id: 'ms-decor',
        title: 'Order Themed Decor, Balloon Arches & Lighting',
        category: 'decor',
        dueDateDaysBefore: 20,
        priority: 'medium',
        isCompleted: false,
        notes: 'Coordinate photo-op backdrop and customized signage.'
      },
      {
        id: 'ms-invites',
        title: 'Send Digital Invitations & Track RSVPs',
        category: 'coordination',
        dueDateDaysBefore: 15,
        priority: 'medium',
        isCompleted: false,
        notes: 'Follow up with key friends and family.'
      },
      {
        id: 'ms-photo',
        title: 'Confirm Event Photographer & Sound System',
        category: 'photography',
        dueDateDaysBefore: 7,
        priority: 'medium',
        isCompleted: false,
        notes: 'Check sound connectivity and microphone test.'
      },
      {
        id: 'ms-day-prep',
        title: 'Day-of Setup & Cake Pickup Coordination',
        category: 'coordination',
        dueDateDaysBefore: 1,
        priority: 'high',
        isCompleted: false,
        notes: 'Confirm vendor arrival times 2 hours before celebration starts.'
      }
    ];
  }
}

