/**
 * Mock Financial and Property Performance Analytics Data for HomeSphere Owner Portal
 */

export const REPORT_SUMMARY = {
  monthlyIncome: 24500,
  occupancyRate: 94,
  maintenanceCost: 3250,
  outstandingRent: 4800,
}

// Monthly rental income for the last 6 months
export const MONTHLY_INCOME_DATA = [
  { month: 'Apr', income: 21800 },
  { month: 'May', income: 22400 },
  { month: 'Jun', income: 23100 },
  { month: 'Jul', income: 23800 },
  { month: 'Aug', income: 24200 },
  { month: 'Sep', income: 24500 },
]

// Occupancy rate trend for the last 6 months (percentage)
export const OCCUPANCY_TREND_DATA = [
  { month: 'Apr', rate: 88 },
  { month: 'May', rate: 90 },
  { month: 'Jun', rate: 91 },
  { month: 'Jul', rate: 92 },
  { month: 'Aug', rate: 93 },
  { month: 'Sep', rate: 94 },
]

// Property Performance breakdown table data
export const PROPERTY_PERFORMANCE_DATA = [
  {
    id: 'prop-1',
    propertyName: 'Sunset Palms Luxury Residences',
    income: 7200,
    expenses: 850,
    profit: 6350,
  },
  {
    id: 'prop-2',
    propertyName: 'Highland Oaks Modern Townhomes',
    income: 5900,
    expenses: 620,
    profit: 5280,
  },
  {
    id: 'prop-3',
    propertyName: 'The Grandview Skyline Lofts',
    income: 4900,
    expenses: 540,
    profit: 4360,
  },
  {
    id: 'prop-4',
    propertyName: 'Harborview Bayfront Condos',
    income: 3900,
    expenses: 480,
    profit: 3420,
  },
  {
    id: 'prop-5',
    propertyName: 'Metro Center Executive Suites',
    income: 2850,
    expenses: 360,
    profit: 2490,
  },
  {
    id: 'prop-6',
    propertyName: 'Pinecrest Mountain Villa',
    income: 4600,
    expenses: 400,
    profit: 4200,
  },
]
