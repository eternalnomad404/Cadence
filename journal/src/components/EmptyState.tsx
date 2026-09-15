import React from 'react';
import { CHALLENGE_START_DATE, type GymLog } from '../types';
import type { DietDraft } from '../data/foodMenu';
import type { WeightDraft } from '../data/weightDrafts';
import { WeightQuickLog } from './WeightQuickLog';
import { GymQuickLog } from './GymQuickLog';
import { DietQuickLog } from './DietQuickLog';

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
}) => {
  if (date < CHALLENGE_START_DATE) {
    return null;
  }

  return (
    <div className="w-full my-6 flex flex-col items-center gap-5">
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
