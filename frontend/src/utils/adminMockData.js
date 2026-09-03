/**
 * Mock Data for HomeSphere Super Admin Portal
 * User Management and Owner Verification Data
 */

export const USER_ROLES = [
  'All Roles',
  'Owner',
  'Tenant',
  'Manager',
  'Admin',
]

export const MOCK_USERS = [
  {
    id: 'usr-001',
    name: 'Marcus Vance',
    email: 'owner@homesphere.com',
    role: 'Owner',
    accountStatus: 'Active',
    verificationStatus: 'Verified',
    joinDate: '2026-01-10',
    submittedDate: '2026-01-10',
    documentStatus: 'All 3 Documents Verified',
  },
  {
    id: 'usr-002',
    name: 'Elena Rostova',
    email: 'tenant@homesphere.com',
    role: 'Tenant',
    accountStatus: 'Active',
    verificationStatus: 'Verified',
    joinDate: '2026-02-14',
    submittedDate: '2026-02-14',
    documentStatus: 'Government Photo ID Verified',
  },
  {
    id: 'usr-003',
    name: 'Sarah Connor',
    email: 'manager@homesphere.com',
    role: 'Manager',
    accountStatus: 'Active',
    verificationStatus: 'Verified',
    joinDate: '2026-03-01',
    submittedDate: '2026-03-01',
    documentStatus: 'Corporate Employment Verified',
  },
  {
    id: 'usr-004',
    name: 'Alexandra Hayes',
    email: 'admin@homesphere.com',
    role: 'Admin',
    accountStatus: 'Active',
    verificationStatus: 'Verified',
    joinDate: '2025-11-20',
    submittedDate: '2025-11-20',
    documentStatus: 'Security Credential Approved',
  },
  {
    id: 'usr-005',
    name: 'Robert Sterling (Highland Estates LLC)',
    email: 'robert.sterling@highlandestates.com',
    role: 'Owner',
    accountStatus: 'Pending',
    verificationStatus: 'Pending',
    joinDate: '2026-08-28',
    submittedDate: '2026-08-28',
    documentStatus: 'Articles of Org & Property Deed Uploaded',
  },
  {
    id: 'usr-006',
    name: 'Victoria Reed (Apex Real Estate Holdings)',
    email: 'v.reed@apexholdings.net',
    role: 'Owner',
    accountStatus: 'Pending',
    verificationStatus: 'Pending',
    joinDate: '2026-08-30',
    submittedDate: '2026-08-30',
    documentStatus: 'Government ID & EIN Tax Form Uploaded',
  },
  {
    id: 'usr-007',
    name: 'David Chen',
    email: 'david.chen@example.com',
    role: 'Tenant',
    accountStatus: 'Active',
    verificationStatus: 'Verified',
    joinDate: '2026-07-19',
    submittedDate: '2026-07-19',
    documentStatus: 'Income & Rental Ledger Verified',
  },
  {
    id: 'usr-008',
    name: 'Jonathan Pierce (Summit Crest Properties)',
    email: 'jonathan@summitcrestprops.com',
    role: 'Owner',
    accountStatus: 'Pending',
    verificationStatus: 'Pending',
    joinDate: '2026-09-01',
    submittedDate: '2026-09-01',
    documentStatus: 'Property Title & Ownership Affidavit Uploaded',
  },
]

/**
 * Filter users who are owners with Pending verification status
 */
export function getPendingOwners() {
  return MOCK_USERS.filter(
    (u) => u.role === 'Owner' && u.verificationStatus === 'Pending'
  )
}
