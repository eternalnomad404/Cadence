/** Aman's locked maintenance for Cadence deficit/surplus math */
export const MAINTENANCE_CALORIES = 2400;

export type EnergyBalance = {
  intake: number;
  maintenance: number;
  /** maintenance - intake; positive = deficit, negative = surplus */
  delta: number;
  kind: 'deficit' | 'surplus' | 'maintenance';
  label: string;
};

export function energyBalance(intakeCalories: number, maintenance = MAINTENANCE_CALORIES): EnergyBalance {
  const intake = Math.max(0, Math.round(intakeCalories));
  const delta = maintenance - intake;
  if (delta > 0) {
    return {
      intake,
      maintenance,
      delta,
      kind: 'deficit',
      label: `Deficit ${delta} kcal`,
    };
  }
  if (delta < 0) {
    return {
      intake,
      maintenance,
      delta,
      kind: 'surplus',
      label: `Surplus ${Math.abs(delta)} kcal`,
    };
  }
  return {
    intake,
    maintenance,
    delta: 0,
    kind: 'maintenance',
    label: 'At maintenance',
  };
}
