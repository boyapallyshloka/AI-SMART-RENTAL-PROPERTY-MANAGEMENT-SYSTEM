/**
 * Mock Maintenance Requests Data for HomeSphere
 * Shared persistent data source across Owner and Tenant portals
 */

const STORAGE_KEY = 'homesphere_maintenance'

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
    unitNumber: 'Unit #104',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
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
    propertyName: 'Sunset Palms Luxury Residences',
    unitNumber: 'Unit #104',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
    title: 'Living room AC condenser vibration and rattling noise',
    description:
      'The multi-split AC blower unit in the main living room vibrates when operating on cooling mode above fan speed 2. Air filter checked and clean.',
    category: 'Appliance',
    priority: 'Medium',
    submittedDate: '2026-08-28',
    status: 'In Progress',
    assignedWorker: {
      name: 'Dmitri Volkov',
      phone: '(555) 671-3329',
      trade: 'HVAC & Climate Systems Specialist',
      company: 'Alpine Comfort HVAC',
      status: 'Part replacement in progress',
    },
  },
  {
    id: 'maint-3',
    ticketNumber: 'TKT-2026-103',
    propertyName: 'Sunset Palms Luxury Residences',
    unitNumber: 'Unit #104',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
    title: 'Entry keyless smart deadbolt battery replacement',
    description:
      'Front door keypad emitted low battery beep sequence. Requested fresh lithium AA battery swap and calibration check.',
    category: 'Electrical',
    priority: 'Low',
    submittedDate: '2026-08-20',
    status: 'Resolved',
    assignedWorker: {
      name: 'James Kim',
      phone: '(555) 412-9902',
      trade: 'Building Automation Technician',
      company: 'Harbor Facility Care',
      status: 'Service completed and verified',
    },
  },
  {
    id: 'maint-4',
    ticketNumber: 'TKT-2026-104',
    propertyName: 'Highland Oaks Modern Townhomes',
    unitNumber: 'Townhome #201',
    tenantName: 'Sophia Martinez',
    tenantEmail: 'sophia.martinez@creativecorp.org',
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
    id: 'maint-5',
    ticketNumber: 'TKT-2026-105',
    propertyName: 'The Grandview Skyline Lofts',
    unitNumber: 'Loft #502',
    tenantName: 'Liam Patterson',
    tenantEmail: 'liam.patterson@techscale.io',
    title: 'Dishwasher cycles stopping before final rinse',
    description:
      'Built-in Bosch dishwasher stops after 20 minutes with error code E24. Bottom tub is holding water and not pumping out through the drain line.',
    category: 'Appliance',
    priority: 'Medium',
    submittedDate: '2026-08-28',
    status: 'In Progress',
    assignedWorker: {
      name: 'Alex Miller',
      phone: '(555) 781-9921',
      trade: 'Appliance Repair Technician',
      company: 'AppliancePro Diagnostics',
      status: 'Part replacement in progress',
    },
  },
  {
    id: 'maint-6',
    ticketNumber: 'TKT-2026-106',
    propertyName: 'Harborview Bayfront Condos',
    unitNumber: 'Unit #704',
    tenantName: 'Brandon Walsh',
    tenantEmail: 'b.walsh@coldmail.com',
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
]

/**
 * Retrieve current maintenance requests from localStorage (fallback to MOCK_MAINTENANCE_REQUESTS)
 */
export function getStoredMaintenanceRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to read maintenance requests from localStorage', e)
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_MAINTENANCE_REQUESTS))
  } catch (e) {}
  return MOCK_MAINTENANCE_REQUESTS
}

// Sync in-memory list on module initialization
try {
  const stored = getStoredMaintenanceRequests()
  if (Array.isArray(stored)) {
    stored.forEach((s) => {
      const match = MOCK_MAINTENANCE_REQUESTS.find((m) => String(m.id) === String(s.id))
      if (match) {
        match.status = s.status
      }
    })
  }
} catch (e) {}

/**
 * Retrieve single maintenance request by ID
 */
export function getMaintenanceRequestById(id) {
  const list = getStoredMaintenanceRequests()
  return list.find((req) => String(req.id) === String(id)) || null
}
