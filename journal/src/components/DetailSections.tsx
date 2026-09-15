import React from 'react';
import { DayLog } from '../types';
import { getSurroundingDays } from '../data/days';
import { BodySection } from './details/BodySection';

interface DetailSectionsProps {
  log: DayLog;
  allDays: Record<string, DayLog>;
  onSelectDate: (date: string) => void;
}

export const DetailSections: React.FC<DetailSectionsProps> = ({ log, allDays, onSelectDate }) => {
  const surroundingDays = getSurroundingDays(log.date, allDays);

  return (
    <div className="space-y-6">
      <BodySection log={log} surroundingDays={surroundingDays} onSelectDate={onSelectDate} />
    </div>
  );
};
