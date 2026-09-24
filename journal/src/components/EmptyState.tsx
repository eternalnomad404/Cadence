import React from 'react';
import { BookOpen, Briefcase } from 'lucide-react';
import { CHALLENGE_START_DATE, type GymLog } from '../types';
import type { DietDraft } from '../data/foodMenu';
import type { WeightDraft } from '../data/weightDrafts';
import type { HabitTimeDraft } from '../data/habitTimeDrafts';
import { WeightQuickLog } from './WeightQuickLog';
import { GymQuickLog } from './GymQuickLog';
import { DietQuickLog } from './DietQuickLog';
import { TimeQuickLog } from './TimeQuickLog';

interface EmptyStateProps {
  date: string;
  gymDraft?: GymLog | null;
  dietDraft?: DietDraft | null;
  /** Yesterday’s selected food ids — pin those cards first in the menu. */
  previousDietFoodIds?: string[];
  weightDraft?: WeightDraft | null;
  /** Prefill weight when none saved — usually yesterday’s kg. */
  defaultWeightKg?: number;
  weightFromPrevious?: boolean;
  onGymSaved: (gym: GymLog) => void;
  onDietSaved: (diet: DietDraft) => void;
  onWeightSaved: (weight: WeightDraft) => void;
  learningDraft?: HabitTimeDraft | null;
  outreachDraft?: HabitTimeDraft | null;
  onLearningSaved: (draft: HabitTimeDraft) => void;
  onOutreachSaved: (draft: HabitTimeDraft) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  date,
  gymDraft,
  dietDraft,
  previousDietFoodIds,
  weightDraft,
  defaultWeightKg,
  weightFromPrevious,
  onGymSaved,
  onDietSaved,
  onWeightSaved,
  learningDraft,
  outreachDraft,
  onLearningSaved,
  onOutreachSaved,
}) => {
  if (date < CHALLENGE_START_DATE) {
    return null;
  }

  return (
    <div className="w-full my-6 flex flex-col items-stretch gap-5">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <WeightQuickLog
          key={`weight-${date}`}
          date={date}
          existing={weightDraft ?? null}
          defaultKg={defaultWeightKg}
          fromPreviousDay={weightFromPrevious}
          onSaved={onWeightSaved}
        />
        <GymQuickLog
          key={`gym-${date}`}
          date={date}
          existing={gymDraft ?? null}
          onSaved={onGymSaved}
        />
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <TimeQuickLog
          key={`learning-${date}`}
          date={date}
          kind="learning"
          title="Habits — Learning"
          hint="Ideal 2 hours · focused new technology"
          icon={BookOpen}
          existing={learningDraft ?? null}
          onSaved={onLearningSaved}
        />
        <TimeQuickLog
          key={`outreach-${date}`}
          date={date}
          kind="outreach"
          title="Habits — Job outreach"
          hint="Ideal 3 hours"
          icon={Briefcase}
          existing={outreachDraft ?? null}
          onSaved={onOutreachSaved}
        />
      </div>
      <DietQuickLog
        key={`diet-${date}`}
        date={date}
        existing={dietDraft ?? null}
        previousFoodIds={previousDietFoodIds}
        onSaved={onDietSaved}
      />
    </div>
  );
};
