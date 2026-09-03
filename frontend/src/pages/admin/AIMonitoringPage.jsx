import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { Button, StatusBadge, Loader } from '../../components/ui'
import {
  Sparkles,
  RefreshCw,
  Cpu,
  TrendingUp,
  Building2,
  DollarSign,
  ShieldAlert,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Activity,
  Calendar,
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
        'All 5 AI models and telemetry inference pipelines are healthy and up to date.'
      )
      setTimeout(() => setSuccessMessage(''), 3500)
    }, 600)
  }

  // 5 Mock AI Monitoring Models
  const aiModels = [
    {
      id: 'model-rent',
      name: 'Rent Prediction Model',
      version: 'v2.4.1',
      status: 'Active',
      lastUpdated: '2026-09-02 04:00 UTC',
      confidence: '94.6% Accuracy',
      icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      summary:
        'Analyzes submarket square footage rates, seasonal turnover, and local amenity scores to calculate optimal rental pricing ranges.',
    },
    {
      id: 'model-property',
      name: 'Property Recommendation Model',
      version: 'v1.9.0',
      status: 'Active',
      lastUpdated: '2026-09-01 22:30 UTC',
      confidence: '92.1% Accuracy',
      icon: <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
      summary:
        'Matches prospective applicant credit bands, spatial requirements, and move-in timelines with active property vacancies.',
    },
    {
      id: 'model-demand',
      name: 'Demand Forecast Model',
      version: 'v3.1.2',
      status: 'Active',
      lastUpdated: '2026-09-03 01:15 UTC',
      confidence: '89.4% Accuracy',
      icon: <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800',
      summary:
        'Projects 30-day and 90-day inquiry velocity, neighborhood occupancy changes, and seasonal lease renewal rates.',
    },
    {
      id: 'model-risk',
      name: 'Payment-Risk Model',
      version: 'v2.8.0',
      status: 'Active',
      lastUpdated: '2026-09-02 18:45 UTC',
      confidence: '93.8% Accuracy',
      icon: <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      summary:
        'Evaluates rent-to-income margins, ACH payment success consistency, and billing dispute patterns to detect late-payment risks.',
    },
    {
      id: 'model-maintenance',
      name: 'Predictive Maintenance Model',
      version: 'v2.2.4',
      status: 'Active',
      lastUpdated: '2026-09-03 06:20 UTC',
      confidence: '91.2% Accuracy',
      icon: <Wrench className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      summary:
        'Ingests appliance age, sensor vibration signatures, and seasonal weather stresses to forecast component failure before breakdowns.',
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
        'Unit #205 listed at $3,450/month is +14% above the algorithmic neighborhood equilibrium ($3,020). May lead to extended vacancy.',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    {
      id: 'alert-2',
      title: 'Elevated Payment Delinquency Probability',
      property: 'The Grandview Skyline Lofts (Loft #502)',
      severity: 'High',
      timestamp: '2026-09-02 19:15 UTC',
      message:
        'Invoice INV-2026-003 ($3,300) flagged with elevated risk index (78/100) after consecutive automated billing token rejections.',
      badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    },
    {
      id: 'alert-3',
      title: 'AC Condenser Bearing Wear Signature',
      property: 'Sunset Palms Luxury Residences (Unit #104)',
      severity: 'Medium',
      timestamp: '2026-09-02 11:40 UTC',
      message:
        'Persistent vibration telemetry on living room multi-split compressor matches early bearing degradation pattern. Recommended service dispatch.',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
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
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Telemetry & Model Monitoring
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                Inference Engines
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track algorithmic accuracy, model drift, data freshness, and system anomaly indicators
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleRefresh}
            isLoading={refreshing}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Model Status
          </Button>
        </div>

        {/* Visible AI Disclaimer Note */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              Decision-Support Governance Notice
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
              AI results and predictions are decision-support recommendations only and must be reviewed by authorized property managers or administrative staff before taking formal action.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Loading AI model telemetry..." size="md" center />
          </div>
        ) : (
          <>
            {/* 5 Mock AI Monitoring Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Production Models & Performance
                </h2>
                <span className="text-xs text-slate-400 font-medium">5 Models Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiModels.map((model) => (
                  <div
                    key={model.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                  >
                    <div>
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl border ${model.bg}`}>
                            {model.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                              {model.name}
                            </h3>
                            <span className="text-xs font-mono text-slate-400">
                              {model.version}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={model.status} size="sm" />
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                        {model.summary}
                      </p>
                    </div>

                    {/* Footer Metrics */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {model.confidence}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{model.lastUpdated.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Alerts Section (3 Mock Alerts) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Active AI Alerts & Anomaly Detections
                  </h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  {aiAlerts.length} Alerts Require Staff Review
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {aiAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${alert.badgeClass}`}
                        >
                          {alert.severity} Priority
                        </span>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {alert.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Target: {alert.property}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono shrink-0">
                      <Clock className="w-3.5 h-3.5" />
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
