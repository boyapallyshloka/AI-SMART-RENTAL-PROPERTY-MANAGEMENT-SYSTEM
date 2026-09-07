import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader } from '../../components/ui'
import {
  RefreshCw,
  Building2,
  DollarSign,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  TrendingUp,
} from 'lucide-react'

export default function AIMonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setSuccessMessage(
        'All 5 operational models and inference telemetry pipelines are healthy and up to date.'
      )
      setTimeout(() => setSuccessMessage(''), 3500)
    }, 600)
  }

  // 5 Mock AI Monitoring Models
  const aiModels = [
    {
      id: 'model-rent',
      name: 'Rent Valuation Model',
      version: 'v2.4.1',
      status: 'Active',
      lastUpdated: '2026-09-02 04:00 UTC',
      confidence: '94.6% Accuracy',
      icon: <DollarSign className="w-4 h-4 text-[#3F7D58]" />,
      bg: 'bg-[#EDF7EE] border-[#C6DEC8]',
      summary:
        'Analyzes submarket square footage rates, seasonal turnover, and local amenity scores to calculate optimal rental pricing ranges.',
    },
    {
      id: 'model-property',
      name: 'Tenant Matching Model',
      version: 'v1.9.0',
      status: 'Active',
      lastUpdated: '2026-09-01 22:30 UTC',
      confidence: '92.1% Accuracy',
      icon: <Building2 className="w-4 h-4 text-[#315A7D]" />,
      bg: 'bg-[#EAF2F7] border-[#D9E0E6]',
      summary:
        'Matches applicant spatial requirements, income bands, and move-in schedules against active property inventory.',
    },
    {
      id: 'model-demand',
      name: 'Demand Forecast Model',
      version: 'v3.1.2',
      status: 'Active',
      lastUpdated: '2026-09-03 01:15 UTC',
      confidence: '89.4% Accuracy',
      icon: <TrendingUp className="w-4 h-4 text-[#315A7D]" />,
      bg: 'bg-[#EAF2F7] border-[#D9E0E6]',
      summary:
        'Projects 30-day and 90-day inquiry velocity, neighborhood occupancy changes, and seasonal lease renewal rates.',
    },
    {
      id: 'model-risk',
      name: 'Payment Risk Model',
      version: 'v2.8.0',
      status: 'Active',
      lastUpdated: '2026-09-02 18:45 UTC',
      confidence: '93.8% Accuracy',
      icon: <ShieldAlert className="w-4 h-4 text-[#B7791F]" />,
      bg: 'bg-[#FEF7EC] border-[#F4E2B6]',
      summary:
        'Evaluates rent-to-income ratios, ACH success history, and billing dispute frequencies to flag payment delay risk.',
    },
    {
      id: 'model-maintenance',
      name: 'Predictive Maintenance Model',
      version: 'v2.2.4',
      status: 'Active',
      lastUpdated: '2026-09-03 06:20 UTC',
      confidence: '91.2% Accuracy',
      icon: <Wrench className="w-4 h-4 text-[#5B6875]" />,
      bg: 'bg-[#F0F4F7] border-[#D9E0E6]',
      summary:
        'Ingests appliance age, sensor vibration signatures, and seasonal weather stresses to forecast component wear.',
    },
  ]

  // 3 Mock AI Alerts
  const aiAlerts = [
    {
      id: 'alert-1',
      title: 'Rent Anomaly Flagged on Unit #205',
      property: 'Sunset Palms Luxury Residences',
      severity: 'Warning',
      timestamp: '2026-09-03 08:30 UTC',
      message:
        'Unit #205 listed at $3,450/month is +14% above predicted neighborhood equilibrium ($3,020). May lead to extended vacancy.',
      badgeClass: 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]',
    },
    {
      id: 'alert-2',
      title: 'Elevated Payment Delinquency Probability',
      property: 'The Grandview Skyline Lofts (Loft #502)',
      severity: 'High',
      timestamp: '2026-09-02 19:15 UTC',
      message:
        'Invoice INV-2026-003 ($3,300) flagged with elevated risk score (78/100) after consecutive automated billing token rejections.',
      badgeClass: 'bg-[#FDF2F2] text-[#8A2E2C] border-[#EFC8C7]',
    },
    {
      id: 'alert-3',
      title: 'AC Condenser Bearing Wear Signature',
      property: 'Sunset Palms Luxury Residences (Unit #104)',
      severity: 'Medium',
      timestamp: '2026-09-02 11:40 UTC',
      message:
        'Persistent vibration telemetry on living room multi-split compressor matches early bearing degradation pattern. Recommended service dispatch.',
      badgeClass: 'bg-[#FEF7EC] text-[#8A5B16] border-[#F4E2B6]',
    },
  ]

  return (
    <DashboardLayout
      defaultRole="admin"
      activeItem="ai-monitoring"
      pageTitle="AI Monitoring"
    >
      <div className="space-y-6">
        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-md bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-[#2A583B] hover:text-[#243447] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                Model Monitoring & Diagnostics
              </h1>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                Decision Support
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
              Supervise algorithmic accuracy, model versions, telemetry health, and automated anomaly flags
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleRefresh}
            isLoading={refreshing}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Status
          </Button>
        </div>

        {/* Decision Support Governance Notice */}
        <div className="p-3.5 rounded-lg bg-[#EAF2F7] border border-[#D9E0E6] text-[#243447] text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-4 h-4 text-[#315A7D] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#243447]">
              Decision-Support Governance Notice
            </p>
            <p className="text-[#5B6875] text-xs mt-0.5 leading-relaxed">
              Algorithmic calculations provide decision-support guidance only. All pricing adjustments, lease terms, and enforcement measures require verification by authorized property staff.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Loading model telemetry..." size="md" center />
          </div>
        ) : (
          <>
            {/* 5 Mock AI Monitoring Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                  Operational Models & Accuracy Scores
                </h2>
                <span className="text-xs text-[#5B6875] font-medium">5 Models Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiModels.map((model) => (
                  <div
                    key={model.id}
                    className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-[#315A7D]/40 transition-colors space-y-3"
                  >
                    <div>
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-md border ${model.bg}`}>
                            {model.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#243447] text-sm">
                              {model.name}
                            </h3>
                            <span className="text-[11px] font-mono text-[#5B6875]">
                              {model.version}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={model.status} size="sm" />
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-[#5B6875] mt-2.5 line-clamp-3 leading-relaxed">
                        {model.summary}
                      </p>
                    </div>

                    {/* Footer Metrics */}
                    <div className="pt-2.5 border-t border-[#D9E0E6] flex items-center justify-between text-xs">
                      <span className="font-medium text-[#2A583B] bg-[#EDF7EE] border border-[#C6DEC8] px-2 py-0.5 rounded text-[11px]">
                        {model.confidence}
                      </span>
                      <div className="flex items-center gap-1 text-[#5B6875] font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{model.lastUpdated.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Alerts Section (3 Mock Alerts) */}
            <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-[#D9E0E6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
                  <h2 className="text-sm font-semibold text-[#243447]">
                    Active System Alerts & Anomaly Detections
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FEF7EC] text-[#8A5B16] border border-[#F4E2B6]">
                  {aiAlerts.length} Flagged for Review
                </span>
              </div>

              <div className="divide-y divide-[#D9E0E6]">
                {aiAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-[#F7F8FA] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${alert.badgeClass}`}
                        >
                          {alert.severity}
                        </span>
                        <h4 className="font-semibold text-[#243447] text-sm">
                          {alert.title}
                        </h4>
                      </div>

                      <p className="text-xs text-[#5B6875] font-medium">
                        Target: {alert.property}
                      </p>

                      <p className="text-xs text-[#5B6875] pt-0.5 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#5B6875] font-mono shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
