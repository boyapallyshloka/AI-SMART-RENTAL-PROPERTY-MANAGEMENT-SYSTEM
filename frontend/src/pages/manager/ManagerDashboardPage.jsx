import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getManagerAssignedProperties
} from '../../api/propertyApi'
import { getApplicationsForProperty } from '../../api/applicationApi'
import { getMaintenanceRequests } from '../../api/maintenanceApi'
import DashboardLayout from '../../layouts/DashboardLayout'
import { ROLES } from '../../utils/roles'
import {
  Building2,
  FileCheck,
  Wrench,
  ShieldCheck,
  Info,
  Clock,
  UserCheck,
} from 'lucide-react'

export default function ManagerDashboardPage() {
  const { user } = useAuth()

  const displayName = user?.name || user?.fullName || user?.username || 'Property Manager'
  const displayEmail = user?.email || ''
  const [properties, setProperties] = useState([])
  useEffect(() => {
    const loadProperties = async () => {
      const response = await getManagerAssignedProperties()
      setProperties(response)
    }
    loadProperties()

  }, [])
  const [applications, setApplications] = useState([])
  useEffect(() => {
    const loadApplications = async () => {
      const results = await Promise.all(properties.map(property => getApplicationsForProperty(property.propertyId)))

      const allApplications = results.flat()
      setApplications(allApplications)
    }

    if (properties.length > 0) {
      loadApplications()
    }
  }, [properties])

  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  useEffect(() => {
    const loadRequests = async () => {
      const response = await getMaintenanceRequests()
      setMaintenanceRequests(response)
    }
    loadRequests()
  }, [])



  return (
    <DashboardLayout
      defaultRole={ROLES.PROPERTY_MANAGER}
      activeItem="dashboard"
      pageTitle="Manager Dashboard"
    >
      {/*Manager Dashboard Header*/}
      <div className="rounded-xl bg-[#315A7D] p-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-base font-semibold rounded-md px-3 py-1 bg-[#274B68] text-white">
              Manager Portal
            </span>
          </div>
          <h1 className="text-white font-bold text-3xl">
            Manager Dashboard
          </h1>
          <p className="text-white/90 text-sm mt-2 leading-relaxed">
            Manage your assigned properties, applications, and maintenance requests.
          </p>
        </div>
      </div>

      {/* Operational Scope Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-[#243447] pt-10 pb-8 px-8">
          Manager Overview
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#D9E0E6] bg-white p-5">
          <h3 className="text-base font-semibold text-[#243447]">
            Assigned Properties
          </h3>
          <p className="text-sm text-[#5B6875] mt-1">
            View and manage your assigned properties
          </p>
          <p className="text-2xl font-bold text-[#315A7D] mt-3">
            {properties.length} Properties
          </p>
        </div>
        {/*Applications*/}
        <div className="rounded-xl border border-[#D9E0E6] bg-white p-5">
          <h3 className="text-base font-semibold text-[#243447]">
            Applications
          </h3>
          <p className="text-sm text-[#5B6875] mt-1">
            Review tenant applications
          </p>
          <p className="text-2xl font-bold text-[#3157AD] mt-3">
            {applications.length} Applications
          </p>
        </div>
        {/*Maintenance and service*/}
        <div className="rounded-xl border border-[#D9E0E6] bg-white p-5">
          <h3 className="text-base font-semibold text-[#243447]">
            Maintenance and service
          </h3>
          <p className="text-sm text-[#5B6875] mt-1">
            Manage maintenance requests
          </p>
          <p className="text-2xl font-bold text-[#3157AD] mt-3">
            {maintenanceRequests.length} Requests
          </p>
        </div>
      </div>





    </DashboardLayout >
  )
}
