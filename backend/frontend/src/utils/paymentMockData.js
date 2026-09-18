/**
 * Mock Rent Payments and Invoices Data for HomeSphere
 * Shared persistent data source across Owner and Tenant portals
 */

const STORAGE_KEY = 'homesphere_invoices'

export const PAYMENT_STATUSES = [
  'Paid',
  'Pending',
  'Overdue',
]

export const MOCK_INVOICES = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
    propertyName: 'Sunset Palms Luxury Residences',
    unitNumber: 'Unit #104',
    invoiceCreatedDate: '2026-08-15',
    dueDate: '2026-09-01',
    monthlyRent: 3200,
    lateFee: 0,
    amount: 3200,
    paymentDate: '2026-08-31',
    status: 'Paid',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
    propertyName: 'Sunset Palms Luxury Residences',
    unitNumber: 'Unit #104',
    invoiceCreatedDate: '2026-09-15',
    dueDate: '2026-10-01',
    monthlyRent: 3200,
    lateFee: 0,
    amount: 3200,
    paymentDate: null,
    status: 'Pending',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-003',
    tenantName: 'Elena Rostova',
    tenantEmail: 'tenant@homesphere.com',
    propertyName: 'Sunset Palms Luxury Residences',
    unitNumber: 'Unit #104',
    invoiceCreatedDate: '2026-07-15',
    dueDate: '2026-08-01',
    monthlyRent: 3200,
    lateFee: 100,
    amount: 3300,
    paymentDate: null,
    status: 'Overdue',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-004',
    tenantName: 'Michael Chang',
    tenantEmail: 'michael.chang@example.com',
    propertyName: 'Highland Oaks Modern Townhomes',
    unitNumber: 'Townhome #201',
    invoiceCreatedDate: '2026-08-15',
    dueDate: '2026-09-01',
    monthlyRent: 2950,
    lateFee: 0,
    amount: 2950,
    paymentDate: '2026-09-01',
    status: 'Paid',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2026-005',
    tenantName: 'Jason Miller',
    tenantEmail: 'jason.miller@example.com',
    propertyName: 'Harborview Bayfront Condos',
    unitNumber: 'Unit #704',
    invoiceCreatedDate: '2026-08-20',
    dueDate: '2026-09-05',
    monthlyRent: 3900,
    lateFee: 0,
    amount: 3900,
    paymentDate: null,
    status: 'Pending',
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-2026-006',
    tenantName: 'Anthony Rossi',
    tenantEmail: 'anthony.rossi@example.com',
    propertyName: 'Pinecrest Mountain Villa',
    unitNumber: 'Villa #1',
    invoiceCreatedDate: '2026-08-10',
    dueDate: '2026-08-25',
    monthlyRent: 4500,
    lateFee: 100,
    amount: 4600,
    paymentDate: null,
    status: 'Overdue',
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-2026-007',
    tenantName: 'Jessica Taylor',
    tenantEmail: 'jessica.taylor@example.com',
    propertyName: 'Metro Center Executive Suites',
    unitNumber: 'Suite #1402',
    invoiceCreatedDate: '2026-08-20',
    dueDate: '2026-09-05',
    monthlyRent: 2850,
    lateFee: 0,
    amount: 2850,
    paymentDate: null,
    status: 'Pending',
  },
  {
    id: 'inv-8',
    invoiceNumber: 'INV-2026-008',
    tenantName: 'Ethan Walker',
    tenantEmail: 'ethan.walker@example.com',
    propertyName: 'Highland Oaks Modern Townhomes',
    unitNumber: 'Townhome #105',
    invoiceCreatedDate: '2026-08-15',
    dueDate: '2026-09-01',
    monthlyRent: 2950,
    lateFee: 0,
    amount: 2950,
    paymentDate: '2026-08-30',
    status: 'Paid',
  },
]

/**
 * Retrieve current invoices from localStorage (fallback to MOCK_INVOICES)
 */
export function getStoredInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to read invoices from localStorage', e)
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INVOICES))
  } catch (e) {}
  return MOCK_INVOICES
}

// Sync in-memory list on module initialization
try {
  const stored = getStoredInvoices()
  if (Array.isArray(stored)) {
    stored.forEach((s) => {
      const match = MOCK_INVOICES.find((m) => String(m.id) === String(s.id))
      if (match) {
        match.status = s.status
      }
    })
  }
} catch (e) {}

/**
 * Retrieve single invoice by ID
 */
export function getInvoiceById(id) {
  const list = getStoredInvoices()
  return list.find((inv) => String(inv.id) === String(id)) || null
}
