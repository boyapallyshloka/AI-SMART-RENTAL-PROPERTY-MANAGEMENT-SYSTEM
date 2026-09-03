import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { MOCK_AI_INSIGHTS } from '../../utils/aiInsightsMockData'
import {
  Button,
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Building2,
  Info,
  Layers,
} from 'lucide-react'

export default function AIInsightsPage() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState('')

  useEffect(() => {
    // Brief simulated loading to demonstrate Loader component
    const timer = setTimeout(() => {
      setInsights(MOCK_AI_INSIGHTS)
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setNoticeMessage('AI insights refreshed with latest portfolio telemetry.')
      setTimeout(() => setNoticeMessage(''), 4000)
    }, 400)
  }

  // Category icon mapping helper
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Pricing Optimization':
        return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      case 'Market Dynamics':
        return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      case 'Retention & Capacity':
        return <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
      case 'Revenue Security':
        return <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      case 'Asset Protection':
        return <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case 'Financial Yield':
      default:
        return <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    }
  }

  return (
    <DashboardLayout
      defaultRole="owner"
      activeItem="ai-insights"
      pageTitle="AI Insights"
    >
      <div className="space-y-6">
        {/* Notice Notification */}
        {noticeMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage('')}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100 font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header with Refresh Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Portfolio Insights
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Real-time
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Predictive asset analytics, revenue optimization, and proactive maintenance forecasts
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Insights'}
            </Button>
          </div>
        </div>

        {/* Mandatory Advisory Notice */}
        <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-950 dark:text-amber-100">
              Decision-Support Notice:{' '}
            </strong>
            AI insights are decision-support recommendations and should be reviewed by a property manager before taking financial or operational action.
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Synthesizing portfolio intelligence..." size="md" center />
          </div>
        ) : insights.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<Sparkles className="w-8 h-8" />}
              title="No AI insights generated"
              message="Telemetry data is currently insufficient to produce predictive recommendations."
            />
          </div>
        ) : (
          /* Six Insight Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Category and Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {getCategoryIcon(card.category)}
                    <span>{card.category}</span>
                  </div>
                  <StatusBadge status={card.status} size="sm" />
                </div>

                {/* Card Body: Title, Value/Prediction, Confidence */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {card.title}
                  </h2>
                  <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {card.prediction}
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/70">
                    {card.confidence}
                  </div>
                </div>

                {/* Card Bottom: Explanation */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
