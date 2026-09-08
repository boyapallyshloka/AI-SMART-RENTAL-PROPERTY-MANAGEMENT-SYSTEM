import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, Input, EmptyState } from '../../components/ui'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal'
import {
  Building,
  Building2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Layers,
  CheckCircle2,
  Save,
  X,
  Search,
} from 'lucide-react'
import {
  getBuildingById,
  getBuildingByIdForManager,
  getBuildingByIdForTenant,
  deleteBuilding,
  getTenantRentalContext,
} from '../../api/buildingApi'
import {
  getFloorsByBuilding,
  getFloorsForManager,
  getFloorsForTenant,
  createFloor,
  updateFloor,
  deleteFloor,
} from '../../api/floorApi'
import {
  getUnitsByFloor,
  getUnitsForManager,
  getUnitsForTenant,
} from '../../api/unitApi'

export default function BuildingDetailsPage() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const isTenant = user?.role === 'tenant'
  const isManager = user?.role === 'manager'
  const canManage = isOwner
  const basePath = isTenant ? '/tenant' : '/owner'

  const [myRental, setMyRental] = useState(null)

  const { buildingId } = useParams()
  const navigate = useNavigate()

  const [building, setBuilding] = useState(null)
  const [floors, setFloors] = useState([])
  const [floorUnitsMap, setFloorUnitsMap] = useState({})
  const [toastMessage, setToastMessage] = useState('')

  // Modals state
  const [isDeleteBuildingOpen, setIsDeleteBuildingOpen] = useState(false)
  const [floorDeleteTarget, setFloorDeleteTarget] = useState(null)
  const [floorModalData, setFloorModalData] = useState(null) // { mode: 'add' | 'edit', floorId?: string, floorName: string, floorNumber: string }
  const [floorFormErrors, setFloorFormErrors] = useState({})

  const loadData = async () => {
    try {
      let b = null
      let flrs = []

      if (isTenant) {
        b = await getBuildingByIdForTenant(buildingId)
        if (b) flrs = await getFloorsForTenant(buildingId)
        const rental = await getTenantRentalContext(user)
        setMyRental(rental)
      } else if (isManager) {
        b = await getBuildingByIdForManager(buildingId)
        if (b) flrs = await getFloorsForManager(buildingId)
      } else {
        b = await getBuildingById(buildingId)
        if (b) flrs = await getFloorsByBuilding(buildingId)
      }

      setBuilding(b)
      setFloors(flrs || [])

      if (flrs && flrs.length > 0) {
        const unitsEntries = await Promise.all(
          flrs.map(async (f) => {
            const uList = isTenant
              ? await getUnitsForTenant(f.floorId)
              : isManager
              ? await getUnitsForManager(f.floorId)
              : await getUnitsByFloor(f.floorId)
            return [f.floorId, uList || []]
          })
        )
        setFloorUnitsMap(Object.fromEntries(unitsEntries))
      } else {
        setFloorUnitsMap({})
      }
    } catch (err) {
      console.error('Error loading building details:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [buildingId])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Delete Building handler
  const handleConfirmDeleteBuilding = async () => {
    if (!building || !canManage) return
    const res = await deleteBuilding(building.buildingId)
    navigate(`${basePath}/buildings`, {
      state: {
        toast: `"${building.buildingName}" and its ${res?.deletedFloorsCount ?? 0} floors were deleted.`,
      },
    })
  }

  // Delete Floor handler
  const handleConfirmDeleteFloor = async () => {
    if (!floorDeleteTarget || !canManage) return
    const res = await deleteFloor(floorDeleteTarget.floorId)
    await loadData()
    showToast(
      `"${floorDeleteTarget.floorName}" and ${res?.deletedUnitsCount ?? 0} units on that floor were deleted.`
    )
    setFloorDeleteTarget(null)
  }

  // Floor form modal handlers
  const handleOpenAddFloor = () => {
    const nextNumber = floors.length > 0 ? Math.max(...floors.map((f) => f.floorNumber)) + 1 : 1
    setFloorModalData({
      mode: 'add',
      floorName: `Floor ${nextNumber}`,
      floorNumber: String(nextNumber),
    })
    setFloorFormErrors({})
  }

  const handleOpenEditFloor = (floor) => {
    setFloorModalData({
      mode: 'edit',
      floorId: floor.floorId,
      floorName: floor.floorName,
      floorNumber: String(floor.floorNumber),
    })
    setFloorFormErrors({})
  }

  const handleFloorSubmit = async (e) => {
    e.preventDefault()
    const errs = {}

    if (!floorModalData.floorName.trim()) {
      errs.floorName = 'Floor name is required.'
    }

    const num = Number(floorModalData.floorNumber)
    if (floorModalData.floorNumber === '' || isNaN(num) || !Number.isInteger(num)) {
      errs.floorNumber = 'Floor number must be an integer.'
    }

    if (Object.keys(errs).length > 0) {
      setFloorFormErrors(errs)
      return
    }

    if (floorModalData.mode === 'add') {
      await createFloor({
        floorName: floorModalData.floorName.trim(),
        floorNumber: num,
        buildingId: building.buildingId,
        building: {
          buildingId: building.buildingId,
          buildingName: building.buildingName,
          property: building.property,
        },
      })
      showToast(`Added "${floorModalData.floorName.trim()}" successfully.`)
    } else {
      await updateFloor(floorModalData.floorId, {
        floorName: floorModalData.floorName.trim(),
        floorNumber: num,
      })
      showToast(`Updated "${floorModalData.floorName.trim()}" successfully.`)
    }

    setFloorModalData(null)
    await loadData()
  }

  if (!building) {
    return (
      <DashboardLayout
        defaultRole={isTenant ? 'tenant' : 'owner'}
        activeItem="buildings"
        pageTitle="Building Details"
      >
        <div className="space-y-6">
          <Link to={`${basePath}/buildings`}>
            <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Buildings
            </Button>
          </Link>
          <EmptyState
            icon={<Building className="w-8 h-8 text-[#5B6875]" />}
            title="Building Not Found"
            description={`No building found matching ID "${buildingId}".`}
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

  const allUnitsCount = getMockUnitsByBuildingId(building.buildingId).length

  return (
    <DashboardLayout
      defaultRole={isTenant ? 'tenant' : 'owner'}
      activeItem="buildings"
      pageTitle={building.buildingName}
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
            <Link to={`${basePath}/buildings`}>
              <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                {isTenant ? 'Back to My Rental Property' : 'Back to Buildings'}
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
              <Link to={`/owner/buildings/${building.buildingId}/edit`}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Pencil className="w-3.5 h-3.5" />}
                >
                  Edit Building
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#B94A48]" />}
                onClick={() => setIsDeleteBuildingOpen(true)}
              >
                Delete Building
              </Button>
            </div>
          )}
        </div>

        {/* Building Overview Card */}
        <div className="bg-white rounded-lg border border-[#D9E0E6] p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#D9E0E6] pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6] mb-2">
                <Building className="w-3.5 h-3.5" />
                <span>
                  {isTenant
                    ? building.property?.id === myRental?.property?.id
                      ? 'Your Community Complex'
                      : 'Available Property Building'
                    : 'Building Overview'}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                {building.buildingName}
              </h1>
              {building.property && (
                <div className="flex items-center gap-2 text-xs text-[#5B6875] mt-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#315A7D]" />
                  <span>
                    Associated Property:{' '}
                    <strong className="text-[#243447] font-semibold">
                      {building.property.name}
                    </strong>
                  </span>
                  <span>&bull;</span>
                  <span>
                    {building.property.address}, {building.property.city}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6] text-center">
                <p className="text-xs uppercase font-semibold tracking-wider text-[#5B6875]">Floors</p>
                <p className="text-xl font-bold text-[#243447]">{building.totalFloors}</p>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-[#F7F8FA] border border-[#D9E0E6] text-center">
                <p className="text-xs uppercase font-semibold tracking-wider text-[#5B6875]">Units</p>
                <p className="text-xl font-bold text-[#315A7D]">{building.totalUnits}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {building.description && (
            <div className="text-xs sm:text-sm text-[#5B6875] leading-relaxed">
              <p className="font-medium text-[#243447] mb-1">Description</p>
              <p>{building.description}</p>
            </div>
          )}
        </div>

        {/* Floors Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#243447]">
                Floors in this Building
              </h2>
              <p className="text-xs text-[#5B6875]">
                Manage floor levels, inspect assigned units, or add a new floor.
              </p>
            </div>

            {canManage && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAddFloor}
              >
                Add Floor
              </Button>
            )}
          </div>

          {floors.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-8 h-8 text-[#5B6875]" />}
              title="No floors registered"
              description="There are currently no floors registered in this building."
              action={
                canManage ? (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={handleOpenAddFloor}
                  >
                    Add First Floor
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors.map((floor) => {
                const floorUnits = floorUnitsMap[floor.floorId] || []
                return (
                  <div
                    key={floor.floorId}
                    className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs flex flex-col justify-between hover:border-[#315A7D]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#315A7D] block">
                            Floor {floor.floorNumber}
                          </span>
                          <h3 className="font-semibold text-base text-[#243447] mt-0.5">
                            {floor.floorName}
                          </h3>
                        </div>

                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#EAF2F7] text-[#274B68] border border-[#D9E0E6]">
                          {floorUnits.length} Units
                        </span>
                      </div>

                      <p className="text-xs text-[#5B6875]">
                        {floorUnits.length > 0
                          ? `${floorUnits.map((u) => u.unitNumber).join(', ')}`
                          : 'No units assigned yet'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#D9E0E6] space-y-2">
                      <div
                        className={`flex items-center ${
                          canManage ? 'justify-between' : 'justify-end'
                        } gap-2 flex-wrap sm:flex-nowrap`}
                      >
                        {canManage && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Pencil className="w-3 h-3" />}
                              onClick={() => handleOpenEditFloor(floor)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<Trash2 className="w-3 h-3 text-[#B94A48]" />}
                              onClick={() =>
                                setFloorDeleteTarget({
                                  floorId: floor.floorId,
                                  floorName: floor.floorName,
                                  unitsCount: floorUnits.length,
                                })
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        )}

                        <Link
                          to={`${basePath}/buildings/${building.buildingId}/floors/${floor.floorId}`}
                        >
                          <Button
                            size="sm"
                            variant="primary"
                            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            View Floor
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Management Modals (Owner Only) */}
        {canManage && (
          <>
            {/* Delete Building Modal */}
            <DeleteConfirmModal
              isOpen={isDeleteBuildingOpen}
              onClose={() => setIsDeleteBuildingOpen(false)}
              onConfirm={handleConfirmDeleteBuilding}
              title="Delete Building"
              itemName={building.buildingName}
              consequenceMessage={`This will permanently delete this building along with all of its ${floors.length} floors and ${allUnitsCount} units.`}
            />

            {/* Delete Floor Modal */}
            <DeleteConfirmModal
              isOpen={Boolean(floorDeleteTarget)}
              onClose={() => setFloorDeleteTarget(null)}
              onConfirm={handleConfirmDeleteFloor}
              title="Delete Floor"
              itemName={floorDeleteTarget?.floorName}
              consequenceMessage={
                floorDeleteTarget &&
                `This will permanently remove this floor and all ${floorDeleteTarget.unitsCount} units registered on it.`
              }
            />

            {/* Add / Edit Floor Modal */}
            {floorModalData && (
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
                        <h3 className="text-base font-bold text-[#243447]">
                          {floorModalData.mode === 'add' ? 'Add Floor' : 'Edit Floor'}
                        </h3>
                        <p className="text-xs text-[#5B6875] truncate max-w-xs">
                          {building.buildingName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setFloorModalData(null)}
                      className="text-[#5B6875] hover:text-[#243447] p-1 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleFloorSubmit} className="space-y-4">
                    <div className="p-2.5 rounded bg-[#F7F8FA] border border-[#D9E0E6] text-xs text-[#5B6875]">
                      <span>Target Building: </span>
                      <strong className="text-[#243447]">{building.buildingName}</strong>
                    </div>

                    <Input
                      label="Floor Name"
                      placeholder="e.g. Ground Floor, 2nd Floor, Penthouse"
                      value={floorModalData.floorName}
                      onChange={(e) =>
                        setFloorModalData((prev) => ({ ...prev, floorName: e.target.value }))
                      }
                      error={floorFormErrors.floorName}
                      required
                    />

                    <Input
                      label="Floor Number (Integer Level)"
                      type="number"
                      step="1"
                      placeholder="e.g. 1, 2, 3"
                      value={floorModalData.floorNumber}
                      onChange={(e) =>
                        setFloorModalData((prev) => ({ ...prev, floorNumber: e.target.value }))
                      }
                      error={floorFormErrors.floorNumber}
                      required
                    />

                    <div className="pt-3 border-t border-[#D9E0E6] flex items-center justify-end gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFloorModalData(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        {floorModalData.mode === 'add' ? 'Create Floor' : 'Save Changes'}
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
