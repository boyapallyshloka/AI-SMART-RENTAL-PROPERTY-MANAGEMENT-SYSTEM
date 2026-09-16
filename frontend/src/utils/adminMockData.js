/**
 * Mock Data for HomeSphere Super Admin Portal
 * Retained solely for Owner Verification and Audit Logs pending their API migrations.
 * User Management is now fully connected to the live backend (userApi.js) and has no mock data.
 */

// Retained specifically for OwnerVerificationPage pending Owner Verification API migration
export const MOCK_PENDING_OWNERS = [
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

export function getPendingOwners() {
  return MOCK_PENDING_OWNERS.filter(
    (u) => (u.role === 'Owner' || u.role === 'PROPERTY_OWNER') && u.verificationStatus === 'Pending'
  )
}

export const getPendingOwnerVerifications = getPendingOwners

export const AUDIT_MODULES = [
  'All Modules',
  'Authentication',
  'Properties',
  'Payments',
  'Applications',
  'Maintenance',
  'Owner Verification',
]

export const AUDIT_RESULTS = [
  'All Results',
  'Success',
  'Warning',
  'Failed',
]

export const MOCK_AUDIT_LOGS = [
  {
    id: 'log-001',
    timestamp: '2026-09-03 14:15:22',
    userName: 'Elena Rostova',
    role: 'Tenant',
    action: 'Submitted rental application for Sunset Palms Unit #104',
    module: 'Applications',
    result: 'Success',
  },
  {
    id: 'log-002',
    timestamp: '2026-09-03 13:40:05',
    userName: 'Marcus Vance',
    role: 'Owner',
    action: 'Created draft lease agreement AGR-2026-004',
    module: 'Properties',
    result: 'Success',
  },
  {
    id: 'log-003',
    timestamp: '2026-09-03 12:10:48',
    userName: 'Robert Sterling',
    role: 'Owner',
    action: 'Uploaded deed & business registration for verification',
    module: 'Owner Verification',
    result: 'Success',
  },
  {
    id: 'log-004',
    timestamp: '2026-09-03 11:25:30',
    userName: 'Alexandra Hayes',
    role: 'Admin',
    action: 'Approved identity verification for Apex Real Estate Holdings',
    module: 'Owner Verification',
    result: 'Success',
  },
  {
    id: 'log-005',
    timestamp: '2026-09-03 10:45:19',
    userName: 'Elena Rostova',
    role: 'Tenant',
    action: 'Attempted card payment with expired billing token on INV-2026-003',
    module: 'Payments',
    result: 'Failed',
  },
  {
    id: 'log-006',
    timestamp: '2026-09-03 09:30:11',
    userName: 'Elena Rostova',
    role: 'Tenant',
    action: 'Filed emergency maintenance repair ticket TKT-2026-101',
    module: 'Maintenance',
    result: 'Success',
  },
  {
    id: 'log-007',
    timestamp: '2026-09-03 08:12:04',
    userName: 'Sarah Connor',
    role: 'Manager',
    action: 'Updated technician dispatch schedule for ticket TKT-2026-102',
    module: 'Maintenance',
    result: 'Success',
  },
  {
    id: 'log-008',
    timestamp: '2026-09-02 23:55:18',
    userName: 'Unknown User (IP: 198.51.100.42)',
    role: 'Tenant',
    action: 'Consecutive failed login attempts (password mismatch threshold)',
    module: 'Authentication',
    result: 'Warning',
  },
  {
    id: 'log-009',
    timestamp: '2026-09-02 18:22:40',
    userName: 'David Chen',
    role: 'Tenant',
    action: 'Completed two-factor authentication sign-in',
    module: 'Authentication',
    result: 'Success',
  },
  {
    id: 'log-010',
    timestamp: '2026-09-02 15:10:09',
    userName: 'Marcus Vance',
    role: 'Owner',
    action: 'Published rental listing for Sunset Palms Unit #205',
    module: 'Properties',
    result: 'Success',
  },
]
