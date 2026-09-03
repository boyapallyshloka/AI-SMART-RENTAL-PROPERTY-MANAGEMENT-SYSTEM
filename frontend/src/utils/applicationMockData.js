/**
 * Mock Rental Applications Data for HomeSphere Owner Portal
 */

export const APPLICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Approved',
  'Rejected',
]

export const MOCK_APPLICATIONS = [
  {
    id: 'app-1',
    applicantName: 'David Chen',
    propertyName: 'Sunset Palms Luxury Residences',
    unit: 'Unit #302',
    submittedDate: '2026-08-28',
    monthlyIncome: 12500,
    status: 'Pending',
  },
  {
    id: 'app-2',
    applicantName: 'Sophia Martinez',
    propertyName: 'Highland Oaks Modern Townhomes',
    unit: 'Townhome #201',
    submittedDate: '2026-08-29',
    monthlyIncome: 9800,
    status: 'Under Review',
  },
  {
    id: 'app-3',
    applicantName: 'Liam Patterson',
    propertyName: 'The Grandview Skyline Lofts',
    unit: 'Loft #502',
    submittedDate: '2026-08-25',
    monthlyIncome: 11000,
    status: 'Approved',
  },
  {
    id: 'app-4',
    applicantName: 'Brandon Walsh',
    propertyName: 'Harborview Bayfront Condos',
    unit: 'Unit #704',
    submittedDate: '2026-08-20',
    monthlyIncome: 6200,
    status: 'Rejected',
  },
  {
    id: 'app-5',
    applicantName: 'Rachel Green',
    propertyName: 'Metro Center Executive Suites',
    unit: 'Suite #1402',
    submittedDate: '2026-08-30',
    monthlyIncome: 10400,
    status: 'Pending',
  },
  {
    id: 'app-6',
    applicantName: 'Marcus Vance',
    propertyName: 'Pinecrest Mountain Villa',
    unit: 'Villa #1',
    submittedDate: '2026-08-31',
    monthlyIncome: 14200,
    status: 'Under Review',
  },
]

export function getPendingApplicationsCount() {
  return MOCK_APPLICATIONS.filter(
    (a) => a.status === 'Pending' || a.status === 'Under Review'
  ).length
}

