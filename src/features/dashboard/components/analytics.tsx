import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { IconArticle } from '@tabler/icons-react'
import { climateQuotes } from '@/data/climate-quotes'
import { useAnalyticsAPI } from '@/query/analytics/use-analytics'
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
import { Card, CardTitle } from '@/components/ui/card'

const Analytics = () => {
  const { data: analyticsData, isLoading } =
    useAnalyticsAPI().getAnalyticsForAdmin

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

  // Prepare data for the chart
  const chartData = analyticsData?.data
    ? [
        {
          name: switchText.newsCount,
          count: analyticsData.data.newsCount,
          color: '#2563eb',
        },
        {
          name: switchText.eventCount,
          count: analyticsData.data.eventCount,
          color: '#9333ea',
        },
        {
          name: switchText.opportunityCount,
          count: analyticsData.data.opportunityCount,
          color: '#059669',
        },
        {
          name: switchText.blogCount,
          count: analyticsData.data.blogCount,
          color: '#dc2626',
        },
      ]
    : []

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
      <div className='flex w-full items-center justify-center py-16'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800'></div>
      </div>
    )
  }

  if (!analyticsData?.data) {
    return (
      <div className='flex w-full items-center justify-center py-16'>
        <p className='text-gray-500'>No data available</p>
      </div>
    )
  }

  return (
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

      {/* Content Section */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Chart */}
        <Card className='border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2'>
          <CardTitle className='mb-6 text-lg font-medium text-gray-900'>
            Content Overview
          </CardTitle>
          <ResponsiveContainer width='100%' height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#f8fafc' />
              <XAxis
                dataKey='name'
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
              <Bar dataKey='count' radius={[2, 2, 0, 0]} fill='#3b82f6' />
            </BarChart>
          </ResponsiveContainer>
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
  )
}

export default Analytics
