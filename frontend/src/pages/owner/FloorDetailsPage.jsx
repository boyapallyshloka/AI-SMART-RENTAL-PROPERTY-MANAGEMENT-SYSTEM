import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, EmptyState, Input } from '../../components/ui'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal'
import {
  Layers,
  Building,
  ArrowLeft,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Home,
  CheckCircle2,
  Save,
  X,
  Search,
} from 'lucide-react'
import {
  getBuildingById,
  getBuildingByIdForManager,
  getBuildingByIdForTenant,
  getTenantRentalContext,
} from '../../api/buildingApi'
import {
  getFloorById,
  getFloorByIdForManager,
  getFloorByIdForTenant,
  updateFloor,
  deleteFloor,
} from '../../api/floorApi'
import {
  getUnitsByFloor,
  getUnitsForManager,
  getUnitsForTenant,
  deleteUnit,
} from '../../api/unitApi'

export default function FloorDetailsPage() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const isTenant = user?.role === 'tenant'
  const isManager = user?.role === 'manager'
  const canManage = isOwner
  const basePath = isTenant ? '/tenant' : '/owner'

  const [myRental, setMyRental] = useState(null)

  const { buildingId, floorId } = useParams()
  const navigate = useNavigate()

  const [floor, setFloor] = useState(null)
  const [building, setBuilding] = useState(null)
  const [units, setUnits] = useState([])
  const [toastMessage, setToastMessage] = useState('')

  // Modals state
  const [isEditFloorOpen, setIsEditFloorOpen] = useState(false)
  const [editFloorName, setEditFloorName] = useState('')
  const [editFloorNumber, setEditFloorNumber] = useState('')
  const [floorFormErrors, setFloorFormErrors] = useState({})

  const [isDeleteFloorOpen, setIsDeleteFloorOpen] = useState(false)
  const [unitDeleteTarget, setUnitDeleteTarget] = useState(null)

  const loadData = async () => {
    try {
      let flr = null
      let bld = null
      let unitList = []

      if (isTenant) {
        flr = await getFloorByIdForTenant(floorId)
        if (flr) {
          bld = flr.building || (await getBuildingByIdForTenant(buildingId))
          unitList = await getUnitsForTenant(floorId)
        }
        const rental = await getTenantRentalContext(user)
        setMyRental(rental)
      } else if (isManager) {
        flr = await getFloorByIdForManager(floorId)
        if (flr) {
          bld = flr.building || (await getBuildingByIdForManager(buildingId))
          unitList = await getUnitsForManager(floorId)
        }
      } else {
        flr = await getFloorById(floorId)
        if (flr) {
          bld = flr.building || (await getBuildingById(buildingId))
          unitList = await getUnitsByFloor(floorId)
        }
      }

      setFloor(flr)
      if (flr) {
        setBuilding(bld)
        setUnits(unitList || [])
        setEditFloorName(flr.floorName)
        setEditFloorNumber(String(flr.floorNumber))
      }
    } catch (err) {
      console.error('Error loading floor details:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [buildingId, floorId])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Delete Floor Handler
  const handleConfirmDeleteFloor = async () => {
    if (!floor || !canManage) return
    const res = await deleteFloor(floor.floorId)
    navigate(`${basePath}/buildings/${building?.buildingId || buildingId}`, {
      state: {
        toast: `Floor "${floor.floorName}" and ${res?.deletedUnitsCount ?? 0} units on that floor were deleted.`,
      },
    })
  }

  // Delete Unit Handler
  const handleConfirmDeleteUnit = async () => {
    if (!unitDeleteTarget || !canManage) return
    await deleteUnit(unitDeleteTarget.unitId)
    await loadData()
    showToast(`Unit "${unitDeleteTarget.unitNumber}" was deleted.`)
    setUnitDeleteTarget(null)
  }

  // Edit Floor Submit
  const handleFloorSubmit = async (e) => {
    e.preventDefault()
    const errs = {}

    if (!editFloorName.trim()) {
      errs.floorName = 'Floor name is required.'
    }

    const num = Number(editFloorNumber)
    if (editFloorNumber === '' || isNaN(num) || !Number.isInteger(num)) {
      errs.floorNumber = 'Floor number must be an integer.'
    }

    if (Object.keys(errs).length > 0) {
      setFloorFormErrors(errs)
      return
    }

    await updateFloor(floor.floorId, {
      floorName: editFloorName.trim(),
      floorNumber: num,
    })

    showToast(`Floor updated successfully.`)
    setIsEditFloorOpen(false)
    await loadData()
  }

  if (!floor) {
    return (
      <DashboardLayout
        defaultRole={isTenant ? 'tenant' : 'owner'}
        activeItem="buildings"
        pageTitle="Floor Details"
      >
        <div className="space-y-6">
          <Link to={`${basePath}/buildings/${buildingId}`}>
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Building
            </Button>
          </Link>
          <EmptyState
            icon={<Layers className="w-8 h-8 text-[#5B6875]" />}
            title="Floor Not Found"
            description={`No floor found matching ID "${floorId}".`}
            action={
              <Link to={`${basePath}/buildings`}>
                <Button size="sm" variant="primary">
                  Back to Buildings
                </Button>
              </Link>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  const buildingName = building?.buildingName || floor.building?.buildingName || 'Building'

  return (
    <DashboardLayout
      defaultRole={isTenant ? 'tenant' : 'owner'}
      activeItem="buildings"
      pageTitle={`${floor.floorName} - ${buildingName}`}
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

        {/* Back Navigation Bar & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`${basePath}/buildings/${buildingId}`}>
              <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to {buildingName}
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

          {canManage && (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => {
                  setEditFloorName(floor.floorName)
                  setEditFloorNumber(String(floor.floorNumber))
                  setFloorFormErrors({})
                  setIsEditFloorOpen(true)
                }}
              >
                Edit Floor
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#B94A48]" />}
                onClick={() => setIsDeleteFloorOpen(true)}
              >
                Delete Floor
              </Button>
            </div>
          )}
        </div>

        {/* Floor Overview Header Card */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6] mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Floor Overview</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                {floor.floorName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#5B6875] mt-1.5">
                <Building className="w-3.5 h-3.5 text-[#315A7D]" />
                <span>
                  Building:{' '}
                  <strong className="text-[#243447] font-semibold">
                    {buildingName}
                  </strong>
                </span>
                <span>&bull;</span>
                <span>Level {floor.floorNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6] text-center">
                <p className="text-xs uppercase font-semibold tracking-wider text-[#5B6875]">Units</p>
                <p className="text-xl font-bold text-[#315A7D]">{units.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Units Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#243447]">
                Units on this Floor
              </h2>
              <p className="text-xs text-[#5B6875]">
                List of registered rental units, rooms, and occupancy statuses.
              </p>
            </div>

            {canManage && (
              <Link
                to={`/owner/buildings/${buildingId}/floors/${floorId}/units/new`}
              >
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Unit
                </Button>
              </Link>
            )}
          </div>

          {units.length === 0 ? (
            <EmptyState
              icon={<Home className="w-8 h-8 text-[#5B6875]" />}
              title="No units on this floor"
              description="No rental units or rooms are registered on this floor yet."
              action={
                canManage ? (
                  <Link
                    to={`/owner/buildings/${buildingId}/floors/${floorId}/units/new`}
                  >
                    <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                      Add First Unit
                    </Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {units.map((unit) => (
                <div
                  key={unit.unitId}
                  className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs flex flex-col justify-between hover:border-[#315A7D]/40 transition-colors"
                >
                  <div className="space-y-3.5">
                    {/* Header: Unit Number, Status, Type */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6875]">
                            {unit.unitType}
                          </span>
                          {isTenant && String(unit.unitId) === String(myRental?.currentUnitId) && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EDF7EE] text-[#2A583B] border border-[#C6DEC8]">
                              Your Leased Unit
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-[#243447] mt-0.5">
                          Unit {unit.unitNumber}
                        </h3>
                      </div>

                      <StatusBadge status={unit.status} size="sm" />
                    </div>

                    {/* Rent & Specifications */}
                    <div className="pt-2 border-t border-[#D9E0E6] space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-[#5B6875]">Monthly Rent</span>
                        <span className="text-base font-bold text-[#243447]">
                          ${unit.monthlyRent.toLocaleString()}
                          <span className="text-xs font-normal text-[#5B6875]">/mo</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 rounded bg-[#F7F8FA] border border-[#D9E0E6]/60">
                          <p className="text-[10px] uppercase text-[#5B6875] font-semibold">Area</p>
                          <p className="text-xs font-bold text-[#243447] mt-0.5">{unit.area} sq ft</p>
                        </div>

                        <div className="p-2 rounded bg-[#F7F8FA] border border-[#D9E0E6]/60">
                          <p className="text-[10px] uppercase text-[#5B6875] font-semibold">Beds</p>
                          <p className="text-xs font-bold text-[#243447] mt-0.5">{unit.bedrooms}</p>
                        </div>

                        <div className="p-2 rounded bg-[#F7F8FA] border border-[#D9E0E6]/60">
                          <p className="text-[10px] uppercase text-[#5B6875] font-semibold">Baths</p>
                          <p className="text-xs font-bold text-[#243447] mt-0.5">{unit.bathrooms}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description preview */}
                    {unit.description && (
                      <p className="text-xs text-[#5B6875] line-clamp-2 leading-relaxed">
                        {unit.description}
                      </p>
                    )}
                  </div>

                  {/* Actions: View (All Roles), Edit & Delete (Owner Only) */}
                  <div
                    className={`pt-4 mt-4 border-t border-[#D9E0E6] flex items-center ${
                      canManage ? 'justify-between' : 'justify-end'
                    } gap-2 flex-wrap sm:flex-nowrap`}
                  >
                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        <Link to={`/owner/units/${unit.unitId}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Pencil className="w-3 h-3" />}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Trash2 className="w-3 h-3 text-[#B94A48]" />}
                          onClick={() =>
                            setUnitDeleteTarget({
                              unitId: unit.unitId,
                              unitNumber: unit.unitNumber,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    )}

                    <Link to={`${basePath}/units/${unit.unitId}`}>
                      <Button
                        size="sm"
                        variant="primary"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        View Unit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Management Modals (Owner Only) */}
        {canManage && (
          <>
            {/* Delete Floor Modal */}
            <DeleteConfirmModal
              isOpen={isDeleteFloorOpen}
              onClose={() => setIsDeleteFloorOpen(false)}
              onConfirm={handleConfirmDeleteFloor}
              title="Delete Floor"
              itemName={floor.floorName}
              consequenceMessage={`Deleting this floor will permanently remove all ${units.length} units registered on it.`}
            />

            {/* Delete Unit Modal */}
            <DeleteConfirmModal
              isOpen={Boolean(unitDeleteTarget)}
              onClose={() => setUnitDeleteTarget(null)}
              onConfirm={handleConfirmDeleteUnit}
              title="Delete Unit"
              itemName={`Unit ${unitDeleteTarget?.unitNumber}`}
              consequenceMessage="This will permanently delete this rental unit from the building floor plan."
            />

            {/* Edit Floor Modal */}
            {isEditFloorOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in"
                role="dialog"
                aria-modal="true"
              >
                <div className="bg-white rounded-xl border border-[#D9E0E6] max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#EAF2F7] text-[#315A7D]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#243447]">Edit Floor</h3>
                        <p className="text-xs text-[#5B6875] truncate max-w-xs">{buildingName}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditFloorOpen(false)}
                      className="text-[#5B6875] hover:text-[#243447] p-1 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleFloorSubmit} className="space-y-4">
                    <Input
                      label="Floor Name"
                      placeholder="e.g. Ground Floor, 2nd Floor"
                      value={editFloorName}
                      onChange={(e) => setEditFloorName(e.target.value)}
                      error={floorFormErrors.floorName}
                      required
                    />

                    <Input
                      label="Floor Number (Integer Level)"
                      type="number"
                      step="1"
                      placeholder="e.g. 1, 2"
                      value={editFloorNumber}
                      onChange={(e) => setEditFloorNumber(e.target.value)}
                      error={floorFormErrors.floorNumber}
                      required
                    />

                    <div className="pt-3 border-t border-[#D9E0E6] flex items-center justify-end gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditFloorOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
