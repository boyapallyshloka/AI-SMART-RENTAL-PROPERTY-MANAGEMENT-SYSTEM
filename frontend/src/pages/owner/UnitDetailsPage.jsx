import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, EmptyState } from '../../components/ui'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal'
import {
  Home,
  ArrowLeft,
  DollarSign,
  Bed,
  Bath,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react'
import {
  getUnitById,
  getUnitByIdForManager,
  getUnitByIdForTenant,
  deleteUnit,
} from '../../api/unitApi'
import { getTenantRentalContext } from '../../api/buildingApi'
import { useAuth } from '../../context/AuthContext'

export default function UnitDetailsPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isOwner = user?.role === 'owner'
  const isTenant = user?.role === 'tenant'
  const isManager = user?.role === 'manager'
  const canManage = isOwner
  const basePath = isTenant ? '/tenant' : '/owner'

  const [myRental, setMyRental] = useState(null)
  const isCurrentRentedUnit = isTenant && String(unitId) === String(myRental?.currentUnitId)

  const [unit, setUnit] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const loadUnit = async () => {
    try {
      let u = null
      if (isTenant) {
        u = await getUnitByIdForTenant(unitId)
        const rental = await getTenantRentalContext(user)
        setMyRental(rental)
      } else if (isManager) {
        u = await getUnitByIdForManager(unitId)
      } else {
        u = await getUnitById(unitId)
      }
      setUnit(u)
    } catch (err) {
      console.error('Error loading unit:', err)
    }
  }

  useEffect(() => {
    loadUnit()
  }, [unitId])

  const handleDeleteConfirm = async () => {
    if (!unit || !canManage) return
    await deleteUnit(unit.unitId)
    const backUrl =
      unit.floor?.building?.buildingId && unit.floor?.floorId
        ? `${basePath}/buildings/${unit.floor.building.buildingId}/floors/${unit.floor.floorId}`
        : `${basePath}/buildings`

    navigate(backUrl, {
      state: { toast: `Unit "${unit.unitNumber}" was deleted.` },
    })
  }

  if (!unit) {
    return (
      <DashboardLayout
        defaultRole={isTenant ? 'tenant' : 'owner'}
        activeItem="buildings"
        pageTitle="Unit Details"
      >
        <div className="space-y-6">
          <Link to={`${basePath}/buildings`}>
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Buildings
            </Button>
          </Link>
          <EmptyState
            icon={<Home className="w-8 h-8 text-[#5B6875]" />}
            title="Unit Not Found"
            description={`No unit found matching ID "${unitId}".`}
            action={
              <Link to={`${basePath}/buildings`}>
                <Button size="sm" variant="primary">
                  View All Buildings
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  const floor = unit.floor
  const building = floor?.building
  const property = building?.property

  const backDestination =
    building?.buildingId && floor?.floorId
      ? `${basePath}/buildings/${building.buildingId}/floors/${floor.floorId}`
      : `${basePath}/buildings`

  const backLabel = floor?.floorName ? `Back to ${floor.floorName}` : 'Back to Floor'

  return (
    <DashboardLayout
      defaultRole={isTenant ? 'tenant' : 'owner'}
      activeItem="buildings"
      pageTitle={`Unit ${unit.unitNumber}`}
    >
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-lg bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-[#2A583B] hover:text-[#1c3c28] text-base leading-none px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top Navigation & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={backDestination}>
              <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                {backLabel}
              </Button>
            </Link>
            {isTenant && (
              <Link to="/tenant/find-properties">
                <Button size="sm" variant="outline" leftIcon={<Search className="w-3.5 h-3.5" />}>
                  Find Other Properties
                </Button>
              </Link>
            )}
          </div>

          {/* Actions: Edit, Delete (Owner Only) */}
          {canManage && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Link to={`/owner/units/${unit.unitId}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Pencil className="w-3.5 h-3.5" />}
                >
                  Edit Unit
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#B94A48]" />}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete Unit
              </Button>
            </div>
          )}
        </div>

        {/* Tenant Status Context Banner */}
        {isCurrentRentedUnit && (
          <div className="p-4 rounded-lg bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
              <span>This is your active leased residence &bull; Leased until {myRental?.leaseSummary?.leaseEndDate || 'July 31, 2027'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-white text-[#2A583B] border border-[#C6DEC8] text-[11px] font-bold self-start sm:self-auto">
              Your Current Rental
            </span>
          </div>
        )}

        {isTenant && !isCurrentRentedUnit && unit.status === 'VACANT' && (
          <div className="p-3.5 rounded-lg bg-[#EAF2F7] border border-[#C2D8E8] text-[#274B68] text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#315A7D] shrink-0" />
              <span>Available Vacant Unit &bull; Open for Lease Discovery</span>
            </div>
            <Link to="/tenant/find-properties" className="text-[#315A7D] hover:underline font-semibold text-xs">
              &larr; Back to Find Properties
            </Link>
          </div>
        )}

        {/* Unit Header Card */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#315A7D] px-2 py-0.5 rounded bg-[#EAF2F7] border border-[#D9E0E6]">
                  {unit.unitType}
                </span>
                <span className="text-xs text-[#5B6875] font-mono">
                  ID: {unit.unitId}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Unit {unit.unitNumber}
              </h1>
              {building && (
                <p className="text-xs text-[#5B6875]">
                  {building.buildingName} &bull; {floor?.floorName || `Floor ${floor?.floorNumber}`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={unit.status} size="md" />
            </div>
          </div>
        </div>

        {/* Detail Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Unit Overview */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Home className="w-4 h-4 text-[#315A7D]" />
              <h2 className="font-semibold text-sm text-[#243447]">Unit Overview</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70">
                <p className="text-[#5B6875] font-medium">Unit Number</p>
                <p className="font-bold text-sm text-[#243447] mt-0.5">{unit.unitNumber}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70">
                <p className="text-[#5B6875] font-medium">Unit Type</p>
                <p className="font-bold text-sm text-[#243447] mt-0.5">{unit.unitType}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70">
                <p className="text-[#5B6875] font-medium">Status</p>
                <div className="mt-1">
                  <StatusBadge status={unit.status} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70">
                <p className="text-[#5B6875] font-medium">Area</p>
                <p className="font-bold text-sm text-[#243447] mt-0.5">{unit.area} sq ft</p>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <MapPin className="w-4 h-4 text-[#315A7D]" />
              <h2 className="font-semibold text-sm text-[#243447]">Location Hierarchy</h2>
            </div>

            <div className="space-y-3 text-xs">
              {property && (
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70 flex items-center justify-between">
                  <div>
                    <p className="text-[#5B6875] font-medium">Property</p>
                    <p className="font-bold text-sm text-[#243447] mt-0.5">{property.name}</p>
                    <p className="text-[11px] text-[#5B6875]">{property.address}, {property.city}</p>
                  </div>
                  <Building2 className="w-4 h-4 text-[#315A7D] shrink-0" />
                </div>
              )}

              {building && (
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70 flex items-center justify-between">
                  <div>
                    <p className="text-[#5B6875] font-medium">Building</p>
                    <p className="font-bold text-sm text-[#243447] mt-0.5">{building.buildingName}</p>
                  </div>
                  <Link
                    to={`${basePath}/buildings/${building.buildingId}`}
                    className="text-xs text-[#315A7D] font-semibold hover:underline"
                  >
                    View Building
                  </Link>
                </div>
              )}

              {floor && (
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70 flex items-center justify-between">
                  <div>
                    <p className="text-[#5B6875] font-medium">Floor</p>
                    <p className="font-bold text-sm text-[#243447] mt-0.5">
                      {floor.floorName} (Floor {floor.floorNumber})
                    </p>
                  </div>
                  {building && (
                    <Link
                      to={`${basePath}/buildings/${building.buildingId}/floors/${floor.floorId}`}
                      className="text-xs text-[#315A7D] font-semibold hover:underline"
                    >
                      View Floor
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Rental & Financials */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <DollarSign className="w-4 h-4 text-[#315A7D]" />
              <h2 className="font-semibold text-sm text-[#243447]">Rental &amp; Financials</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70">
                <p className="text-[#5B6875] font-medium">Monthly Rent</p>
                <p className="font-bold text-base text-[#243447] mt-0.5">
                  ${unit.monthlyRent.toLocaleString()}
                  <span className="text-xs font-normal text-[#5B6875]">/mo</span>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70">
                <p className="text-[#5B6875] font-medium">Security Deposit</p>
                <p className="font-bold text-base text-[#243447] mt-0.5">
                  ${unit.securityDeposit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Room Details */}
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#D9E0E6] pb-3">
              <Bed className="w-4 h-4 text-[#315A7D]" />
              <h2 className="font-semibold text-sm text-[#243447]">Room Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D] shrink-0">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[#5B6875] font-medium">Bedrooms</p>
                  <p className="font-bold text-base text-[#243447] mt-0.5">{unit.bedrooms}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6]/70 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#EAF2F7] flex items-center justify-center text-[#315A7D] shrink-0">
                  <Bath className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[#5B6875] font-medium">Bathrooms</p>
                  <p className="font-bold text-base text-[#243447] mt-0.5">{unit.bathrooms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Description */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-3">
          <h2 className="font-semibold text-sm text-[#243447] border-b border-[#D9E0E6] pb-3">
            Description
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6875] leading-relaxed">
            {unit.description || 'No description provided for this unit.'}
          </p>
        </div>

        {/* Delete Unit Modal */}
        {canManage && (
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Unit"
            itemName={`Unit ${unit.unitNumber}`}
            consequenceMessage="This will permanently delete this rental unit record."
          />
        )}
      </div>
    </DashboardLayout>
  )
}
