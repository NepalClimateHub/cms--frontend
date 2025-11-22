import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { IconArticle } from '@tabler/icons-react'
import { climateQuotes } from '@/data/climate-quotes'
import { useAnalyticsAPI } from '@/query/analytics/use-analytics'
import apiClient from '@/query/apiClient'
import { Main } from '@/ui/layouts/main'
import { MultiSelect } from '@/ui/multi-select'
import { Card, CardTitle } from '@/ui/shadcn/card'
import { cn } from '@/ui/shadcn/lib/utils'
import { Calendar, Users, Quote, Briefcase, Newspaper } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function AdminDashboardHomePage() {
  const { data: analyticsData, isLoading } =
    useAnalyticsAPI().getAnalyticsForAdmin

  const currentYear = new Date().getFullYear()
  const [selectedYears, setSelectedYears] = useState<string[]>([
    currentYear.toString(),
  ])

  // Fetch data for all selected years using useQueries
  const yearQueries = useQueries({
    queries: selectedYears.map((year) => ({
      queryKey: ['monthlyUserStats', parseInt(year, 10)],
      queryFn: async () => {
        const response = await apiClient.get(
          '/api/v1/analytics/monthly-user-stats',
          {
            params: { year: year },
          }
        )
        return response.data.data as {
          monthlyStats: { month: string; count: number }[]
          year: number
        }
      },
      enabled: selectedYears.length > 0,
    })),
  })

  const isLoadingMonthlyStats = yearQueries.some(
    (query: { isLoading: boolean }) => query.isLoading
  )
  const monthlyStatsData = yearQueries
    .map((query: { data: unknown }) => query.data)
    .filter(Boolean) as Array<{
    monthlyStats: { month: string; count: number }[]
    year: number
  }>

  const switchText = {
    newsCount: 'News',
    opportunityCount: 'Opportunities',
    eventCount: 'Events',
    userCount: 'Users',
    blogCount: 'Blogs',
  }

  const icons = {
    newsCount: <IconArticle className='h-4 w-4' />,
    opportunityCount: <Briefcase className='h-4 w-4' />,
    eventCount: <Calendar className='h-4 w-4' />,
    userCount: <Users className='h-4 w-4' />,
    blogCount: <Newspaper className='h-4 w-4' />,
  }

  const colors = {
    newsCount: 'text-blue-600',
    opportunityCount: 'text-emerald-600',
    eventCount: 'text-purple-600',
    userCount: 'text-rose-600',
    blogCount: 'text-red-600',
  }

  const routes = {
    newsCount: '/news/list',
    opportunityCount: '/opportunities/list',
    eventCount: '/events/list',
    userCount: '/users',
    blogCount: '/blog/list',
  }

  // Generate year options (current year and 4 years back)
  const yearOptions = useMemo(() => {
    const years = []
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i)
    }
    return years.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    }))
  }, [currentYear])

  // Prepare data for the user monthly chart - combine data from all selected years
  const userChartData = useMemo(() => {
    if (monthlyStatsData.length === 0) return []

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    // Create a map to combine data by month
    const combinedData: Record<
      string,
      { month: string; [key: string]: string | number }
    > = {}

    monthNames.forEach((month) => {
      combinedData[month] = { month }
    })

    // Add data for each year
    monthlyStatsData.forEach((statsData, index) => {
      const year = selectedYears[index]
      statsData?.monthlyStats.forEach((stat) => {
        if (combinedData[stat.month]) {
          combinedData[stat.month][year] = stat.count
        }
      })
    })

    return Object.values(combinedData)
  }, [monthlyStatsData, selectedYears])

  // Generate colors for each year - green and blue theme
  const yearColors = [
    '#10b981', // emerald-500 (green)
    '#3b82f6', // blue-500 (blue)
    '#059669', // emerald-600 (darker green)
    '#2563eb', // blue-600 (darker blue)
    '#14b8a6', // teal-500 (teal-green)
  ]

  // Get the quote of the day
  const quoteOfTheDay = useMemo(() => {
    const today = new Date()
    const dayOfYear = Math.ceil(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const quoteIndex = dayOfYear % climateQuotes.length
    return climateQuotes[quoteIndex]
  }, [climateQuotes])

  if (isLoading) {
    return (
      <Main>
        <div className='mb-2 flex flex-col items-start justify-start space-y-10 p-5'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex w-full items-center justify-center py-16'>
            <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800'></div>
          </div>
        </div>
      </Main>
    )
  }

  if (!analyticsData?.data) {
    return (
      <Main>
        <div className='mb-2 flex flex-col items-start justify-start space-y-10 p-5'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex w-full items-center justify-center py-16'>
            <p className='text-gray-500'>No data available</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='mb-2 flex flex-col items-start justify-start space-y-10 p-5'>
        <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>

        <div className='space-y-8'>
          {/* Analytics Cards */}
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
            {Object.entries(analyticsData.data).map(([key, value]) => (
              <Link
                key={key}
                to={routes[key as keyof typeof routes]}
                className='group'
              >
                <Card className='border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md'>
                  <div className='space-y-2'>
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50',
                        colors[key as keyof typeof colors]
                      )}
                    >
                      {icons[key as keyof typeof icons]}
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
                        {switchText[key as keyof typeof switchText]}
                      </p>
                      <p className='text-xl font-semibold text-gray-900'>
                        {value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* User Overview Section */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Chart */}
            <Card className='border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2'>
              <div className='mb-6 flex items-center justify-between'>
                <CardTitle className='text-lg font-medium text-gray-900'>
                  New Users Joined
                </CardTitle>
                <MultiSelect
                  options={yearOptions}
                  onValueChange={(values) => setSelectedYears(values)}
                  defaultValue={selectedYears}
                  placeholder='Select years'
                  className='w-[300px]'
                  showSelectAll={false}
                />
              </div>
              {isLoadingMonthlyStats ? (
                <div className='flex h-[240px] items-center justify-center'>
                  <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800'></div>
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={240}>
                  <BarChart
                    data={userChartData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' stroke='#f8fafc' />
                    <XAxis
                      dataKey='month'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    {selectedYears.map((year, index) => (
                      <Bar
                        key={year}
                        dataKey={year}
                        radius={[2, 2, 0, 0]}
                        fill={yearColors[index % yearColors.length]}
                        name={year}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Quote */}
            <Card className='border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='flex h-full flex-col justify-between'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50'>
                      <Quote className='h-4 w-4 text-gray-600' />
                    </div>
                    <div>
                      <CardTitle className='text-lg font-medium text-gray-900'>
                        Daily Quote
                      </CardTitle>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <p className='text-sm leading-relaxed text-gray-600'>
                      "{quoteOfTheDay.quote}"
                    </p>
                    <p className='text-xs font-medium text-gray-500'>
                      — {quoteOfTheDay.author}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Main>
  )
}
