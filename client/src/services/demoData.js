/**
 * Demo Health Data
 * ================
 * Used as fallback when the user has no real health records.
 * This makes the app feel alive on first login instead of showing empty states.
 *
 * IMPORTANT: This data is never sent to the backend — it's purely for display.
 */

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))
  return d.toISOString()
}

export const DEMO_RECORDS = [
  { id: 'demo-1', heart_rate: 72, steps: 8420, sleep_hours: '7.5', spo2: '98', calories_burned: '320', source: 'demo', timestamp: daysAgo(0) },
  { id: 'demo-2', heart_rate: 68, steps: 10230, sleep_hours: '8.0', spo2: '97', calories_burned: '410', source: 'demo', timestamp: daysAgo(1) },
  { id: 'demo-3', heart_rate: 75, steps: 6100, sleep_hours: '6.5', spo2: '99', calories_burned: '280', source: 'demo', timestamp: daysAgo(2) },
  { id: 'demo-4', heart_rate: 70, steps: 9500, sleep_hours: '7.0', spo2: '98', calories_burned: '365', source: 'demo', timestamp: daysAgo(3) },
  { id: 'demo-5', heart_rate: 78, steps: 5200, sleep_hours: '6.0', spo2: '97', calories_burned: '250', source: 'demo', timestamp: daysAgo(4) },
  { id: 'demo-6', heart_rate: 65, steps: 11000, sleep_hours: '8.5', spo2: '99', calories_burned: '450', source: 'demo', timestamp: daysAgo(5) },
  { id: 'demo-7', heart_rate: 71, steps: 7800, sleep_hours: '7.2', spo2: '98', calories_burned: '340', source: 'demo', timestamp: daysAgo(6) },
]

export const DEMO_LATEST = DEMO_RECORDS[0]

export const DEMO_SUMMARY = {
  avg_heart_rate: 71.3,
  avg_spo2: 98.0,
  total_steps: 58250,
  total_calories: 2415,
  avg_sleep_hours: 7.24,
  record_count: 7,
  period: 'week',
}
