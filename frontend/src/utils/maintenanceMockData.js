/**
 * Mock Maintenance Requests Data for HomeSphere Owner Portal
 */

export const MAINTENANCE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Appliance',
  'Structural',
  'Other',
]

export const MAINTENANCE_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Emergency',
]

export const MAINTENANCE_STATUSES = [
  'Open',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
]

export const MOCK_MAINTENANCE_REQUESTS = [
  {
    id: 'maint-1',
    ticketNumber: 'TKT-2026-101',
    propertyName: 'Sunset Palms Luxury Residences',
    unitNumber: 'Unit #302',
    tenantName: 'David Chen',
    title: 'Master bathroom sink drainage leak under vanity',
    category: 'Plumbing',
    priority: 'High',
    submittedDate: '2026-08-31',
    status: 'Open',
  },
  {
    id: 'maint-2',
    ticketNumber: 'TKT-2026-102',
    propertyName: 'Highland Oaks Modern Townhomes',
    unitNumber: 'Townhome #201',
    tenantName: 'Sophia Martinez',
    title: 'Circuit breaker tripping intermittently on kitchen outlets',
    category: 'Electrical',
    priority: 'Emergency',
    submittedDate: '2026-09-01',
    status: 'Assigned',
  },
  {
    id: 'maint-3',
    ticketNumber: 'TKT-2026-103',
    propertyName: 'The Grandview Skyline Lofts',
    unitNumber: 'Loft #502',
    tenantName: 'Liam Patterson',
    title: 'Dishwasher cycles stopping before final rinse',
    category: 'Appliance',
    priority: 'Medium',
    submittedDate: '2026-08-28',
    status: 'In Progress',
  },
  {
    id: 'maint-4',
    ticketNumber: 'TKT-2026-104',
    propertyName: 'Harborview Bayfront Condos',
    unitNumber: 'Unit #704',
    tenantName: 'Brandon Walsh',
    title: 'Balcony sliding door track needs lubrication and realignment',
    category: 'Structural',
    priority: 'Low',
    submittedDate: '2026-08-25',
    status: 'Resolved',
  },
  {
    id: 'maint-5',
    ticketNumber: 'TKT-2026-105',
    propertyName: 'Metro Center Executive Suites',
    unitNumber: 'Suite #1402',
    tenantName: 'Rachel Green',
    title: 'Refrigerator freezer not maintaining freezing temperature',
    category: 'Appliance',
    priority: 'High',
    submittedDate: '2026-08-30',
    status: 'Open',
  },
  {
    id: 'maint-6',
    ticketNumber: 'TKT-2026-106',
    propertyName: 'Pinecrest Mountain Villa',
    unitNumber: 'Villa #1',
    tenantName: 'Marcus Vance',
    title: 'Smart thermostat sensor reconnect and HVAC filter replacement',
    category: 'Other',
    priority: 'Low',
    submittedDate: '2026-08-22',
    status: 'Closed',
  },
]
