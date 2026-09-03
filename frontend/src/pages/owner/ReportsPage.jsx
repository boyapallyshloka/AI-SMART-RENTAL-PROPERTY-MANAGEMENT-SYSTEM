import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  REPORT_SUMMARY,
  MONTHLY_INCOME_DATA,
  OCCUPANCY_TREND_DATA,
  PROPERTY_PERFORMANCE_DATA,
} from '../../utils/reportMockData'
import {
  StatusBadge,
  EmptyState,
  Loader,
} from '../../components/ui'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  Users,
  Wrench,
  AlertCircle,
  TrendingUp,
  Building2,
  FileBarChart,
} from 'lucide-react'

export default function ReportsPage({ role = 'owner' }) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [incomeData, setIncomeData] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  useEffect(() => {
    // Brief simulated loading to demonstrate Loader component
    const timer = setTimeout(() => {
      setSummary(REPORT_SUMMARY)
      setIncomeData(MONTHLY_INCOME_DATA)
      setOccupancyData(OCCUPANCY_TREND_DATA)
      setPerformanceData(PROPERTY_PERFORMANCE_DATA)
      setLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout
      defaultRole={role}
      activeItem="reports"
      pageTitle={role === 'admin' ? 'Platform Reports & Analytics' : 'Reports & Analytics'}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Financial Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Portfolio revenue performance, occupancy trends, and property profitability
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 shadow-xs flex justify-center">
            <Loader text="Generating financial reports and charts..." size="md" center />
          </div>
        ) : !summary ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
            <EmptyState
              icon={<FileBarChart className="w-8 h-8" />}
              title="No report data available"
              message="Financial report metrics are not available at this moment."
            />
          </div>
        ) : (
          <>
            {/* Four Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Monthly Income */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Monthly Income
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    ${summary.monthlyIncome.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gross rental receivables
                  </p>
                </div>
              </div>

              {/* Occupancy Rate */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Occupancy Rate
                  </span>
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {summary.occupancyRate}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Portfolio units leased
                  </p>
                </div>
              </div>

              {/* Maintenance Cost */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Maintenance Cost
                  </span>
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    ${summary.maintenanceCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Repairs & service dispatches
                  </p>
                </div>
              </div>

              {/* Outstanding Rent */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Outstanding Rent
                  </span>
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                    ${summary.outstandingRent.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pending tenant payments
                  </p>
                </div>
              </div>
            </div>

            {/* Two Analytical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Monthly Rental Income (Last 6 Months) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      Monthly Rental Income
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Last 6 months revenue performance
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5" /> +12.4%
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                      />
                      <Bar
                        dataKey="income"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Occupancy Rate (Last 6 Months) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      Occupancy Rate Trend
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Last 6 months unit occupancy percentage
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5" /> +6%
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={occupancyData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[80, 100]}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value}%`, 'Occupancy']}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#0ea5e9"
                        strokeWidth={2.5}
                        fill="#0ea5e9"
                        fillOpacity={0.15}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Property Performance Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Property Performance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Financial breakdown of income, maintenance expenses, and net profit per asset
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 pl-6 pr-4">Property Name</th>
                      <th className="py-3.5 px-4">Income</th>
                      <th className="py-3.5 px-4">Expenses</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                    {performanceData.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Property Name */}
                        <td className="py-4 pl-6 pr-4 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{item.propertyName}</span>
                          </div>
                        </td>

                        {/* Income */}
                        <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          ${Number(item.income).toLocaleString()}
                        </td>

                        {/* Expenses */}
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          ${Number(item.expenses).toLocaleString()}
                        </td>

                        {/* Profit */}
                        <td className="py-4 pl-4 pr-6 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          +${Number(item.profit).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
