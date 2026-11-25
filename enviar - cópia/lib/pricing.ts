export interface PriceEstimate { min: number; max: number; breakdown: { label: string; value: string }[]; note?: string }
const BASE_RATES: Record<string, { base: number; perHour: number; minHours: number }> = {
  night: { base: 50, perHour: 25, minHours: 2 }, cars: { base: 60, perHour: 30, minHours: 1 },
  people: { base: 40, perHour: 25, minHours: 1 }, events: { base: 80, perHour: 35, minHours: 2 },
  football: { base: 100, perHour: 40, minHours: 2 }, urban: { base: 50, perHour: 20, minHours: 1 }, other: { base: 60, perHour: 30, minHours: 1 },
}
const DURATION_HOURS: Record<string, number> = { '30min': 0.5, '1h': 1, '1h30': 1.5, '2h': 2, '3h': 3, '4h': 4, 'halfday': 5, 'fullday': 8 }
const LOCATION_MULTIPLIER: Record<string, number> = { 'local': 1.0, 'near': 1.1, 'far': 1.25, 'travel': 1.4 }
export function calculatePrice(params: { category: string; duration: string; location: string }): PriceEstimate {
  const rate = BASE_RATES[params.category] ?? BASE_RATES.other
  const hours = DURATION_HOURS[params.duration] ?? 2
  const locMult = LOCATION_MULTIPLIER[params.location] ?? 1.0
  const effectiveHours = Math.max(hours, rate.minHours)
  const raw = (rate.base + rate.perHour * effectiveHours) * locMult
  const min = Math.round(raw * 0.9 / 5) * 5
  const max = Math.round(raw * 1.2 / 5) * 5
  const breakdown = [{ label: 'Base', value: `${rate.base}€` }, { label: 'Duração', value: `${effectiveHours}h × ${rate.perHour}€/h` }]
  if (locMult > 1.0) breakdown.push({ label: 'Deslocação', value: `+${Math.round((locMult - 1) * 100)}%` })
  const note = effectiveHours > hours ? `Duração mínima: ${rate.minHours}h` : undefined
  return { min, max, breakdown, note }
}
