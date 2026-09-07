import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  REPORT_SUMMARY,
  MONTHLY_INCOME_DATA,
  OCCUPANCY_TREND_DATA,
  PROPERTY_PERFORMANCE_DATA,
} from '../../utils/reportMockData'
import {
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
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#243447]">
              Financial Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6875] mt-0.5">
              Portfolio revenue performance, occupancy trends, and asset profitability metrics
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-12 shadow-2xs flex justify-center">
            <Loader text="Generating financial reports and charts..." size="md" center />
          </div>
        ) : !summary ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-[#D9E0E6] p-8 shadow-2xs">
            <EmptyState
              icon={<FileBarChart className="w-8 h-8" />}
              title="No report data available"
              message="Financial report metrics are not available at this moment."
            />
          </div>
        ) : (
          <>
            {/* Four Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Monthly Income */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                    Monthly Income
                  </span>
                  <div className="p-2 rounded-md bg-[#EAF2F7] text-[#315A7D] border border-[#D9E0E6]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#243447] tracking-tight">
                    ${summary.monthlyIncome.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#5B6875] mt-0.5">
                    Gross rental receivables
                  </p>
                </div>
              </div>

              {/* Occupancy Rate */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                    Occupancy Rate
                  </span>
                  <div className="p-2 rounded-md bg-[#EDF7EE] text-[#3F7D58] border border-[#C6DEC8]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#243447] tracking-tight">
                    {summary.occupancyRate}%
                  </p>
                  <p className="text-xs text-[#5B6875] mt-0.5">
                    Portfolio units leased
                  </p>
                </div>
              </div>

              {/* Maintenance Cost */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                    Maintenance Cost
                  </span>
                  <div className="p-2 rounded-md bg-[#FEF7EC] text-[#B7791F] border border-[#F4E2B6]">
                    <Wrench className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#243447] tracking-tight">
                    ${summary.maintenanceCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#5B6875] mt-0.5">
                    Repairs & service dispatches
                  </p>
                </div>
              </div>

              {/* Outstanding Rent */}
              <div className="rounded-lg border border-[#D9E0E6] bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6875]">
                    Outstanding Rent
                  </span>
                  <div className="p-2 rounded-md bg-[#FDF2F2] text-[#B94A48] border border-[#EFC8C7]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#B94A48] tracking-tight">
                    ${summary.outstandingRent.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#5B6875] mt-0.5">
                    Pending tenant payments
                  </p>
                </div>
              </div>
            </div>

            {/* Two Analytical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Monthly Rental Income */}
              <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#243447]">
                      Monthly Rental Income
                    </h2>
                    <p className="text-xs text-[#5B6875] mt-0.5">
                      Last 6 months revenue performance
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A583B] bg-[#EDF7EE] border border-[#C6DEC8] px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5" /> +12.4%
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#D9E0E6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#5B6875"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#5B6875"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#315A7D',
                          borderColor: '#274B68',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                      />
                      <Bar
                        dataKey="income"
                        fill="#315A7D"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Occupancy Rate */}
              <div className="bg-white rounded-lg border border-[#D9E0E6] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E0E6] pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#243447]">
                      Occupancy Rate Trend
                    </h2>
                    <p className="text-xs text-[#5B6875] mt-0.5">
                      Last 6 months unit occupancy percentage
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2A583B] bg-[#EDF7EE] border border-[#C6DEC8] px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5" /> +6%
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={occupancyData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#D9E0E6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#5B6875"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#5B6875"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[80, 100]}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#315A7D',
                          borderColor: '#274B68',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value}%`, 'Occupancy']}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#315A7D"
                        strokeWidth={2}
                        fill="#315A7D"
                        fillOpacity={0.15}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Property Performance Table */}
            <div className="bg-white rounded-lg border border-[#D9E0E6] shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-[#D9E0E6]">
                <h2 className="text-base font-semibold text-[#243447] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#315A7D]" />
                  Property Asset Performance
                </h2>
                <p className="text-xs text-[#5B6875] mt-0.5">
                  Financial breakdown of income, maintenance expenses, and net profit per asset
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D9E0E6] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#5B6875]">
                      <th className="py-2.5 pl-4 pr-3">Property Name</th>
                      <th className="py-2.5 px-3">Income</th>
                      <th className="py-2.5 px-3">Expenses</th>
                      <th className="py-2.5 pl-3 pr-4 text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E0E6] text-xs">
                    {performanceData.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F7F8FA] transition-colors"
                      >
                        {/* Property Name */}
                        <td className="py-3 pl-4 pr-3 font-semibold text-[#243447]">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#5B6875] shrink-0" />
                            <span>{item.propertyName}</span>
                          </div>
                        </td>

                        {/* Income */}
                        <td className="py-3 px-3 font-medium text-[#243447] whitespace-nowrap">
                          ${Number(item.income).toLocaleString()}
                        </td>

                        {/* Expenses */}
                        <td className="py-3 px-3 text-[#5B6875] whitespace-nowrap">
                          ${Number(item.expenses).toLocaleString()}
                        </td>

                        {/* Profit */}
                        <td className="py-3 pl-3 pr-4 text-right font-semibold text-[#3F7D58] whitespace-nowrap">
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
