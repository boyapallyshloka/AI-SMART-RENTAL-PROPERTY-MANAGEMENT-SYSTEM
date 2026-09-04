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
        return <TrendingUp className="w-4 h-4 text-[#3F7D58]" />
      case 'Market Dynamics':
        return <Sparkles className="w-4 h-4 text-[#315A7D]" />
      case 'Retention & Capacity':
        return <Building2 className="w-4 h-4 text-[#315A7D]" />
      case 'Revenue Security':
        return <ShieldCheck className="w-4 h-4 text-[#3F7D58]" />
      case 'Asset Protection':
        return <AlertCircle className="w-4 h-4 text-[#B7791F]" />
      case 'Financial Yield':
      default:
        return <Layers className="w-4 h-4 text-[#315A7D]" />
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
          <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#C6DEC8] text-[#2A583B] text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#3F7D58] shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage('')}
              className="text-[#3F7D58] hover:text-[#2A583B] font-bold px-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Header with Refresh Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
                AI Portfolio Insights
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                <Sparkles className="w-3 h-3 text-[#315A7D]" /> Real-time
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-1">
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
        <div className="p-4 rounded-xl bg-[#FEF7EC] border border-[#F4E2B6] text-[#8A5B16] text-xs sm:text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-[#8A5B16]">
              Decision-Support Notice:{' '}
            </strong>
            AI insights are decision-support recommendations and should be reviewed by a property manager before taking financial or operational action.
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-12 shadow-xs flex justify-center">
            <Loader text="Synthesizing portfolio intelligence..." size="md" center />
          </div>
        ) : insights.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-[#D9E0E6] p-8 shadow-xs">
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
                className="bg-white rounded-xl border border-[#D9E0E6] p-6 shadow-xs hover:border-[#315A7D] transition-all flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Category and Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5B6875]">
                    {getCategoryIcon(card.category)}
                    <span>{card.category}</span>
                  </div>
                  <StatusBadge status={card.status} size="sm" />
                </div>

                {/* Card Body: Title, Value/Prediction, Confidence */}
                <div className="space-y-2">
                  <h2 className="text-base font-bold text-[#243447]">
                    {card.title}
                  </h2>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#315A7D] tracking-tight">
                    {card.prediction}
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F7F8FA] text-[#243447] border border-[#D9E0E6]">
                    {card.confidence}
                  </div>
                </div>

                {/* Card Bottom: Explanation */}
                <div className="pt-3 border-t border-[#D9E0E6] text-xs text-[#5B6875] leading-relaxed">
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
