/**
 * Mock Rental Applications Data for HomeSphere Owner Portal
 * Includes localStorage persistence for Application Status changes
 */

const STORAGE_KEY = 'homesphere_applications'

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
    email: 'david.chen@example.com',
    phone: '(415) 892-3401',
    employmentStatus: 'Employed (Full-Time)',
    propertyName: 'Sunset Palms Luxury Residences',
    unit: 'Unit #302',
    submittedDate: '2026-08-28',
    monthlyIncome: 12500,
    status: 'Pending',
  },
  {
    id: 'app-2',
    applicantName: 'Sophia Martinez',
    email: 'sophia.martinez@creativecorp.org',
    phone: '(512) 640-1928',
    employmentStatus: 'Employed (Full-Time)',
    propertyName: 'Highland Oaks Modern Townhomes',
    unit: 'Townhome #201',
    submittedDate: '2026-08-29',
    monthlyIncome: 9800,
    status: 'Under Review',
  },
  {
    id: 'app-3',
    applicantName: 'Liam Patterson',
    email: 'liam.patterson@techscale.io',
    phone: '(206) 555-8910',
    employmentStatus: 'Employed (Full-Time)',
    propertyName: 'The Grandview Skyline Lofts',
    unit: 'Loft #502',
    submittedDate: '2026-08-25',
    monthlyIncome: 11000,
    status: 'Approved',
  },
  {
    id: 'app-4',
    applicantName: 'Brandon Walsh',
    email: 'b.walsh@coldmail.com',
    phone: '(305) 912-4019',
    employmentStatus: 'Contractor / Self-Employed',
    propertyName: 'Harborview Bayfront Condos',
    unit: 'Unit #704',
    submittedDate: '2026-08-20',
    monthlyIncome: 6200,
    status: 'Rejected',
  },
  {
    id: 'app-5',
    applicantName: 'Rachel Green',
    email: 'rachel.green@fashionhouse.com',
    phone: '(312) 480-1123',
    employmentStatus: 'Employed (Full-Time)',
    propertyName: 'Metro Center Executive Suites',
    unit: 'Suite #1402',
    submittedDate: '2026-08-30',
    monthlyIncome: 10400,
    status: 'Pending',
  },
  {
    id: 'app-6',
    applicantName: 'Marcus Vance',
    email: 'marcus.vance@peakridge.net',
    phone: '(303) 714-2290',
    employmentStatus: 'Executive / Business Owner',
    propertyName: 'Pinecrest Mountain Villa',
    unit: 'Villa #1',
    submittedDate: '2026-08-31',
    monthlyIncome: 14200,
    status: 'Under Review',
  },
]

/**
 * Retrieve current applications list from localStorage (fallback to MOCK_APPLICATIONS)
 */
export function getStoredApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to read applications from localStorage', e)
  }

  // Initialize storage with base applications
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_APPLICATIONS))
  } catch (e) {}
  return MOCK_APPLICATIONS
}

/**
 * Sync initial in-memory mock data with localStorage if present
 */
try {
  const stored = getStoredApplications()
  stored.forEach((s) => {
    const match = MOCK_APPLICATIONS.find((m) => String(m.id) === String(s.id))
    if (match) {
      match.status = s.status
    }
  })
} catch (e) {}

/**
 * Retrieve single application by ID with current stored status
 */
export function getApplicationById(id) {
  const list = getStoredApplications()
  return list.find((a) => String(a.id) === String(id)) || null
}

/**
 * Update application status persistently in localStorage
 */
export function updateApplicationStatus(id, newStatus) {
  const currentList = getStoredApplications()
  let updatedApp = null

  const updatedList = currentList.map((app) => {
    if (String(app.id) === String(id)) {
      updatedApp = { ...app, status: newStatus }
      return updatedApp
    }
    return app
  })

  // Update in-memory array as well
  const inMemory = MOCK_APPLICATIONS.find((m) => String(m.id) === String(id))
  if (inMemory) {
    inMemory.status = newStatus
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  } catch (e) {
    console.error('Failed to save updated application status', e)
  }

  return updatedApp
}

/**
 * Count pending applications based on stored status
 */
export function getPendingApplicationsCount() {
  const list = getStoredApplications()
  return list.filter(
    (a) => a.status === 'Pending' || a.status === 'Under Review'
  ).length
}
