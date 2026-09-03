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
    description:
      'Persistent water dripping from the P-trap connection beneath the double vanity sink in the master bath. Small puddle forming inside the cabinet baseboard.',
    category: 'Plumbing',
    priority: 'High',
    submittedDate: '2026-08-31',
    status: 'Open',
    assignedWorker: {
      name: 'Carlos Rivera',
      phone: '(555) 234-8901',
      trade: 'Licensed Master Plumber',
      company: 'Bayview Precision Plumbing LLC',
      status: 'Awaiting dispatch confirmation',
    },
  },
  {
    id: 'maint-2',
    ticketNumber: 'TKT-2026-102',
    propertyName: 'Highland Oaks Modern Townhomes',
    unitNumber: 'Townhome #201',
    tenantName: 'Sophia Martinez',
    title: 'Circuit breaker tripping intermittently on kitchen outlets',
    description:
      'GFCI circuit breaker in the kitchen keeps tripping when microwave and coffee maker are operating simultaneously. Odor of warm wiring reported.',
    category: 'Electrical',
    priority: 'Emergency',
    submittedDate: '2026-09-01',
    status: 'Assigned',
    assignedWorker: {
      name: 'Marcus Vance Jr.',
      phone: '(555) 892-4410',
      trade: 'Journeyman Electrician',
      company: 'VoltTech Electrical Services',
      status: 'On route to unit',
    },
  },
  {
    id: 'maint-3',
    ticketNumber: 'TKT-2026-103',
    propertyName: 'The Grandview Skyline Lofts',
    unitNumber: 'Loft #502',
    tenantName: 'Liam Patterson',
    title: 'Dishwasher cycles stopping before final rinse',
    description:
      'Built-in Bosch dishwasher stops after 20 minutes with error code E24. Bottom tub is holding water and not pumping out through the drain line.',
    category: 'Appliance',
    priority: 'Medium',
    submittedDate: '2026-08-28',
    status: 'In Progress',
    assignedWorker: {
      name: 'Elena Rostova',
      phone: '(555) 671-3329',
      trade: 'Appliance Repair Technician',
      company: 'AppliancePro Diagnostics',
      status: 'Part replacement in progress',
    },
  },
  {
    id: 'maint-4',
    ticketNumber: 'TKT-2026-104',
    propertyName: 'Harborview Bayfront Condos',
    unitNumber: 'Unit #704',
    tenantName: 'Brandon Walsh',
    title: 'Balcony sliding door track needs lubrication and realignment',
    description:
      'Heavy double-paned sliding glass door onto the balcony is sticking severely on the lower roller track. Difficult to slide open and latch securely.',
    category: 'Structural',
    priority: 'Low',
    submittedDate: '2026-08-25',
    status: 'Resolved',
    assignedWorker: {
      name: 'James Kim',
      phone: '(555) 412-9902',
      trade: 'General Building Maintenance Specialist',
      company: 'Harbor Facility Care',
      status: 'Service completed and tested',
    },
  },
  {
    id: 'maint-5',
    ticketNumber: 'TKT-2026-105',
    propertyName: 'Metro Center Executive Suites',
    unitNumber: 'Suite #1402',
    tenantName: 'Rachel Green',
    title: 'Refrigerator freezer not maintaining freezing temperature',
    description:
      'The sub-zero refrigerator freezer compartment temperature has risen to 38°F over the past 24 hours. Ice maker has stopped producing cubes.',
    category: 'Appliance',
    priority: 'High',
    submittedDate: '2026-08-30',
    status: 'Open',
    assignedWorker: {
      name: 'Elena Rostova',
      phone: '(555) 671-3329',
      trade: 'Appliance Repair Technician',
      company: 'AppliancePro Diagnostics',
      status: 'Scheduled for inspection',
    },
  },
  {
    id: 'maint-6',
    ticketNumber: 'TKT-2026-106',
    propertyName: 'Pinecrest Mountain Villa',
    unitNumber: 'Villa #1',
    tenantName: 'Marcus Vance',
    title: 'Smart thermostat sensor reconnect and HVAC filter replacement',
    description:
      'Ecobee smart thermostat disconnected from Wi-Fi gateway following router reboot. Quarterly MERV-13 air intake filter replacement requested.',
    category: 'Other',
    priority: 'Low',
    submittedDate: '2026-08-22',
    status: 'Closed',
    assignedWorker: {
      name: 'Tom Bradley',
      phone: '(555) 902-1811',
      trade: 'HVAC & Smart Home Systems Specialist',
      company: 'Alpine Comfort HVAC',
      status: 'Ticket closed and signed off',
    },
  },
]

export function getMaintenanceRequestById(id) {
  return MOCK_MAINTENANCE_REQUESTS.find((req) => String(req.id) === String(id)) || null
}
