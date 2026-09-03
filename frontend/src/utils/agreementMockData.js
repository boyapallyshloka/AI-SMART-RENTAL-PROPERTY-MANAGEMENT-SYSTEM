/**
 * Mock Lease Agreements Data for HomeSphere Owner Portal
 * Includes localStorage persistence for new agreement creation
 */

const STORAGE_KEY = 'homesphere_agreements'

export const AGREEMENT_STATUSES = [
  'Active',
  'Draft',
  'Pending Signature',
  'Terminated',
]

export const INITIAL_AGREEMENTS = [
  {
    id: 'agr-1',
    agreementNumber: 'AGR-2026-001',
    tenantName: 'David Chen',
    tenantEmail: 'david.chen@example.com',
    propertyName: 'Sunset Palms Luxury Residences',
    unit: 'Unit #302',
    monthlyRent: 3400,
    securityDeposit: 3400,
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    rentDueDay: '1st of the month',
    noticePeriod: '60 days',
    status: 'Active',
    notes: 'Standard 12-month lease. Landlord covers water and trash. No smoking permitted.',
    createdDate: '2026-08-20',
  },
  {
    id: 'agr-2',
    agreementNumber: 'AGR-2026-002',
    tenantName: 'Sophia Martinez',
    tenantEmail: 'sophia.martinez@creativecorp.org',
    propertyName: 'Highland Oaks Modern Townhomes',
    unit: 'Townhome #201',
    monthlyRent: 2950,
    securityDeposit: 2950,
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    rentDueDay: '1st of the month',
    noticePeriod: '30 days',
    status: 'Active',
    notes: 'Townhome residential lease. One small pet approved with $500 pet deposit.',
    createdDate: '2026-08-22',
  },
  {
    id: 'agr-3',
    agreementNumber: 'AGR-2026-003',
    tenantName: 'Liam Patterson',
    tenantEmail: 'liam.patterson@techscale.io',
    propertyName: 'The Grandview Skyline Lofts',
    unit: 'Loft #502',
    monthlyRent: 2450,
    securityDeposit: 2450,
    startDate: '2026-09-15',
    endDate: '2027-09-14',
    rentDueDay: '15th of the month',
    noticePeriod: '60 days',
    status: 'Pending Signature',
    notes: 'Awaiting electronic countersignature from primary leaseholder.',
    createdDate: '2026-08-26',
  },
  {
    id: 'agr-4',
    agreementNumber: 'AGR-2026-004',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
    propertyName: 'Sunset Palms Luxury Residences',
    unit: 'Unit #104',
    monthlyRent: 3200,
    securityDeposit: 3200,
    startDate: '2026-10-01',
    endDate: '2027-09-30',
    rentDueDay: '1st of the month',
    noticePeriod: '30 days',
    status: 'Draft',
    notes: 'Draft lease agreement prepared following rental application review.',
    createdDate: '2026-08-30',
  },
]

export let MOCK_AGREEMENTS = [...INITIAL_AGREEMENTS]

/**
 * Retrieve current agreements list from localStorage (fallback to INITIAL_AGREEMENTS)
 */
export function getStoredAgreements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to read agreements from localStorage', e)
  }

  // Initialize storage with base agreements
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AGREEMENTS))
  } catch (e) {}
  return INITIAL_AGREEMENTS
}

// Sync in-memory list on module initialization
try {
  const stored = getStoredAgreements()
  MOCK_AGREEMENTS = stored
} catch (e) {}

/**
 * Add a new draft agreement to localStorage and in-memory list
 */
export function addAgreement(agreementData) {
  const currentList = getStoredAgreements()
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  const newAgreement = {
    id: `agr-${Date.now()}`,
    agreementNumber: `AGR-2026-${randomSuffix}`,
    status: 'Draft',
    createdDate: new Date().toISOString().split('T')[0],
    ...agreementData,
  }

  const updatedList = [newAgreement, ...currentList]
  MOCK_AGREEMENTS = updatedList

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList))
  } catch (e) {
    console.error('Failed to save new agreement to localStorage', e)
  }

  return newAgreement
}

/**
 * Retrieve single agreement by ID
 */
export function getAgreementById(id) {
  const list = getStoredAgreements()
  return list.find((a) => String(a.id) === String(id)) || null
}
