import { useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { IconArticle } from '@tabler/icons-react'
import { emailSubscriptionControllerFindAll } from '@/api'
import { climateQuotes } from '@/data/climate-quotes'
import {
  useAnalyticsAPI,
  useTopBlogAuthors,
  useNewJoinedUsers,
} from '@/query/analytics/use-analytics'
import apiClient from '@/query/apiClient'
import { Main } from '@/ui/layouts/main'
import { MultiSelect } from '@/ui/multi-select'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Card, CardTitle } from '@/ui/shadcn/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/shadcn/dialog'
import { cn } from '@/ui/shadcn/lib/utils'
import { ScrollArea } from '@/ui/shadcn/scroll-area'
import {
  Calendar,
  Users,
  Quote,
  Briefcase,
  Newspaper,
  Mail,
  Plus,
  FileText,
  Building2,
  ArrowRight,
  MessageSquare,
  Bot,
  MessageCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AdminAnalyticsOutput } from '@/api/types.gen'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessUserDirectoryAndDatabaseExport } from '@/utils/role-check.util'
import { UsersViewDialog } from '@/features/users/components/users-view-dialog'
import { mapUserOutputToUser } from '@/features/users/utils/mapping'

export default function AdminDashboardHomePage() {
  const canViewAllUsers =
    canAccessUserDirectoryAndDatabaseExport(getRoleFromToken())

  const { data: analyticsData, isLoading } =
    useAnalyticsAPI().getAnalyticsForAdmin

  // Fetch subscribed email count
  const { data: subscribedEmailsData } = useQuery({
    queryKey: ['subscribedEmailsCount'],
    queryFn: async () => {
      const res = await emailSubscriptionControllerFindAll()
      const data =
        res &&
        typeof res === 'object' &&
        'data' in res &&
        Array.isArray((res as unknown as { data: unknown }).data)
          ? (res as { data: Array<{ id?: string; email?: string }> }).data
          : []
      return data.length
    },
  })

  const { data: topAuthorsData, isLoading: isTopAuthorsLoading } =
    useTopBlogAuthors()

  const { data: newJoinedUsersData, isLoading: isNewJoinedUsersLoading } =
    useNewJoinedUsers()

  const currentYear = new Date().getFullYear()
  const [selectedYears, setSelectedYears] = useState<string[]>([
    currentYear.toString(),
  ])

  const [isTopAuthorsDialogOpen, setIsTopAuthorsDialogOpen] = useState(false)
  const [aiChatFilter, setAiChatFilter] = useState<
    'today' | 'yesterday' | 'this month' | 'all time'
  >('this month')

  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(
    null
  )
  const [isViewProfileDialogOpen, setIsViewProfileDialogOpen] = useState(false)

  // Fetch single user details for the dialog
  const { data: selectedUserDetails } = useQuery({
    queryKey: ['user', viewProfileUserId],
    queryFn: async () => {
      if (!viewProfileUserId) return null
      const response = await apiClient.get(`/api/v1/users/${viewProfileUserId}`)
      return mapUserOutputToUser(response.data.data)
    },
    enabled: !!viewProfileUserId && isViewProfileDialogOpen,
  })

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
    projectCount: 'Work / Projects',
  }

  const icons = {
    newsCount: <IconArticle className='h-4 w-4' />,
    opportunityCount: <Briefcase className='h-4 w-4' />,
    eventCount: <Calendar className='h-4 w-4' />,
    userCount: <Users className='h-4 w-4' />,
    blogCount: <Newspaper className='h-4 w-4' />,
    projectCount: <Briefcase className='h-4 w-4' />,
  }

  const colors = {
    newsCount: 'text-blue-600',
    opportunityCount: 'text-emerald-600',
    eventCount: 'text-purple-600',
    userCount: 'text-rose-600',
    blogCount: 'text-red-600',
    projectCount: 'text-violet-600',
  }

  const routes = {
    newsCount: '/news/list',
    opportunityCount: '/opportunities/list',
    eventCount: '/events/list',
    userCount: '/users',
    blogCount: '/blog/list',
    projectCount: '/projects',
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
  }, [])

  if (isLoading) {
    return (
      <Main>
        <div className='mb-2 flex flex-col items-start justify-start space-y-10 p-5'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Analytics Overview
          </h1>
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
          <h1 className='text-2xl font-bold tracking-tight'>
            Analytics Overview
          </h1>
          <div className='flex w-full items-center justify-center py-16'>
            <p className='text-gray-500'>No data available</p>
          </div>
        </div>
      </Main>
    )
  }

  const adminStats: AdminAnalyticsOutput = analyticsData.data

  return (
    <Main>
      <div className='mb-2 flex w-full flex-col space-y-10 p-5'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Analytics Overview
        </h1>

        <div className='grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.85fr_1fr]'>
          {/* Left Column - Analytics (fills remaining space) */}
          <div className='min-w-0 space-y-8'>
            {/* Analytics Cards */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
              {Object.entries(adminStats)
                .filter(
                  ([key]) =>
                    (key !== 'userCount' && !key.endsWith('Count')) ||
                    (![
                      'adminCount',
                      'organizationCount',
                      'individualCount',
                      'aiChatSessionsToday',
                      'aiChatSessionsYesterday',
                      'aiChatSessionsThisMonth',
                      'aiChatSessionsAllTime',
                      'aiChatMessagesToday',
                      'aiChatMessagesYesterday',
                      'aiChatMessagesThisMonth',
                      'aiChatMessagesAllTime',
                    ].includes(key) &&
                      key !== 'userCount')
                )
                .map(([key, value]) => {
                  if (key === 'pendingOrganizationVerificationCount')
                    return null
                  if (
                    [
                      'adminCount',
                      'organizationCount',
                      'individualCount',
                      'aiChatSessionsToday',
                      'aiChatSessionsYesterday',
                      'aiChatSessionsThisMonth',
                      'aiChatSessionsAllTime',
                      'aiChatMessagesToday',
                      'aiChatMessagesYesterday',
                      'aiChatMessagesThisMonth',
                      'aiChatMessagesAllTime',
                    ].includes(key) ||
                    key === 'userCount'
                  )
                    return null
                  return (
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
                              {(value as number).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              {/* Subscribed Emails Card */}
              <Link to='/subscribed-emails' className='group'>
                <Card className='border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md'>
                  <div className='space-y-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-amber-600'>
                      <Mail className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
                        Subscribed Emails
                      </p>
                      <p className='text-xl font-semibold text-gray-900'>
                        {subscribedEmailsData?.toLocaleString() ?? '0'}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Detailed User Card */}
            <Card className='overflow-hidden border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='flex flex-col gap-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex items-center gap-4'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600'>
                      <Users className='h-6 w-6' />
                    </div>
                    <div>
                      <h2 className='text-sm font-medium uppercase tracking-wider text-gray-500'>
                        Total Platform Users
                      </h2>
                      <p className='text-3xl font-bold text-gray-900'>
                        {Number(adminStats.userCount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {canViewAllUsers ? (
                    <Link
                      to='/users'
                      className='group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground hover:underline'
                    >
                      <span>View all users</span>
                      <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                    </Link>
                  ) : null}
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <Link
                    to='/users'
                    search={{ role: 'ADMIN' }}
                    className='flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600'>
                      <Users className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-tight text-gray-500'>
                        Admins
                      </p>
                      <p className='text-lg font-semibold text-gray-900'>
                        {adminStats.adminCount.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                  <Link
                    to='/users'
                    search={{ role: 'ORGANIZATION' }}
                    className='flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600'>
                      <Building2 className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-tight text-gray-500'>
                        Organizations
                      </p>
                      <p className='text-lg font-semibold text-gray-900'>
                        {adminStats.organizationCount.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                  <Link
                    to='/users'
                    search={{ role: 'INDIVIDUAL' }}
                    className='flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600'>
                      <Users className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-tight text-gray-500'>
                        Individuals
                      </p>
                      <p className='text-lg font-semibold text-gray-900'>
                        {adminStats.individualCount.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Actions (fixed 300px) */}
          <div className='shrink-0'>
            <Card className='flex max-h-[485px] flex-col border border-gray-200 bg-white p-5 shadow-sm'>
              <CardTitle className='mb-6 shrink-0 text-lg font-medium text-gray-900'>
                Quick Actions
              </CardTitle>
              <div className='min-h-0 flex-1 overflow-y-auto pr-1'>
                <div className='flex flex-col gap-4'>
                  <Link
                    to='/events/add'
                    className='group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100'>
                      <Calendar className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        Add Event
                      </p>
                    </div>
                    <Plus className='h-4 w-4 shrink-0 text-gray-400 group-hover:text-blue-600' />
                  </Link>

                  <Link
                    to='/opportunities/add'
                    className='group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md'
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100'>
                      <Briefcase className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        Add Opportunity
                      </p>
                    </div>
                    <Plus className='h-4 w-4 shrink-0 text-gray-400 group-hover:text-emerald-600' />
                  </Link>

                  <Link
                    to='/blog/add'
                    className='group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:shadow-md'
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors group-hover:bg-red-100'>
                      <FileText className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        Add Blog
                      </p>
                    </div>
                    <Plus className='h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-600' />
                  </Link>

                  <Link
                    to='/news/add'
                    className='group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100'>
                      <Newspaper className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        Add News
                      </p>
                    </div>
                    <Plus className='h-4 w-4 shrink-0 text-gray-400 group-hover:text-blue-600' />
                  </Link>

                  <Link
                    to='/projects/add'
                    className='group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100'>
                      <Briefcase className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        Add Work
                      </p>
                    </div>
                    <Plus className='h-4 w-4 shrink-0 text-gray-400 group-hover:text-purple-600' />
                  </Link>

                  <Link
                    to='/resources/add'
                    className='group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md'
                  >
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100'>
                      <FileText className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-gray-900'>
                        Add Resources
                      </p>
                    </div>
                    <Plus className='h-4 w-4 shrink-0 text-gray-400 group-hover:text-teal-600' />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Chat Analytics Section (Full Width) */}
        <Card className='mt-6 overflow-hidden border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
                <Bot className='h-5 w-5' />
              </div>
              <h2 className='text-sm font-medium uppercase tracking-wider text-gray-500'>
                AI Chat Analytics
              </h2>
            </div>
            {/* Filter Tabs */}
            <div className='flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5'>
              {(['today', 'yesterday', 'this month', 'all time'] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setAiChatFilter(filter)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium capitalize transition-all duration-150',
                      aiChatFilter === filter
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2'>
            <div className='flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600'>
                <MessageSquare className='h-4 w-4' />
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-tight text-gray-500'>
                  Chat Sessions
                </p>
                <p className='text-lg font-bold text-gray-900'>
                  {aiChatFilter === 'today'
                    ? (adminStats as any).aiChatSessionsToday?.toLocaleString()
                    : aiChatFilter === 'yesterday'
                      ? (
                          adminStats as any
                        ).aiChatSessionsYesterday?.toLocaleString()
                      : aiChatFilter === 'this month'
                        ? (
                            adminStats as any
                          ).aiChatSessionsThisMonth?.toLocaleString()
                        : (
                            (adminStats as any).aiChatSessionsAllTime || 0
                          ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600'>
                <MessageCircle className='h-4 w-4' />
              </div>
              <div>
                <p className='text-xs font-medium uppercase tracking-tight text-gray-500'>
                  Message Responses
                </p>
                <p className='text-lg font-bold text-gray-900'>
                  {aiChatFilter === 'today'
                    ? (adminStats as any).aiChatMessagesToday?.toLocaleString()
                    : aiChatFilter === 'yesterday'
                      ? (
                          adminStats as any
                        ).aiChatMessagesYesterday?.toLocaleString()
                      : aiChatFilter === 'this month'
                        ? (
                            adminStats as any
                          ).aiChatMessagesThisMonth?.toLocaleString()
                        : (
                            (adminStats as any).aiChatMessagesAllTime || 0
                          ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Full-width User Overview Section */}
        <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.85fr_1fr]'>
          {/* Chart */}
          <Card className='h-full border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-6 flex items-center justify-between'>
              <CardTitle className='text-lg font-medium text-gray-900'>
                User Joining Analytics
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

          {/* New Joined Users */}
          <Card className='h-full overflow-hidden border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600'>
                <Users className='h-5 w-5' />
              </div>
              <h2 className='text-sm font-medium uppercase tracking-wider text-gray-500'>
                Newly Joined Users
              </h2>
            </div>

            {isNewJoinedUsersLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800'></div>
              </div>
            ) : newJoinedUsersData && newJoinedUsersData.length > 0 ? (
              <div className='flex flex-col gap-3'>
                {newJoinedUsersData.slice(0, 3).map((user) => (
                  <div
                    key={user.userId}
                    className='flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3'
                  >
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <Avatar className='h-10 w-10 shrink-0 border border-gray-100 shadow-sm'>
                        <AvatarImage
                          src={(user as any).profilePhotoUrl}
                          className='object-cover'
                        />
                        <AvatarFallback className='bg-white'>
                          <img
                            src='/images/logo.png'
                            alt='NCH'
                            className='h-6 w-6 opacity-50'
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-gray-900'>
                          {user.name}
                        </p>
                        <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                          <p className='truncate text-xs text-gray-500'>
                            {user.email}
                          </p>
                          <span className='hidden text-gray-300 sm:inline'>
                            •
                          </span>
                          <button
                            onClick={() => {
                              setViewProfileUserId(user.userId)
                              setIsViewProfileDialogOpen(true)
                            }}
                            className='text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline'
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className='hidden shrink-0 flex-col items-end sm:flex'>
                      <span className='text-xs font-bold text-gray-900'>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-6 text-center text-sm text-gray-500'>
                No new users found.
              </div>
            )}
          </Card>
        </div>

        {/* Authors and Quote Row */}
        <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.85fr_1fr]'>
          {/* Top Blog Authors */}
          <Card className='overflow-hidden border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600'>
                  <FileText className='h-5 w-5' />
                </div>
                <h2 className='text-sm font-medium uppercase tracking-wider text-gray-500'>
                  Top Blog Authors
                </h2>
              </div>
              {topAuthorsData && topAuthorsData.length > 5 && (
                <button
                  onClick={() => setIsTopAuthorsDialogOpen(true)}
                  className='text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline'
                >
                  View all
                </button>
              )}
            </div>

            {isTopAuthorsLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800'></div>
              </div>
            ) : topAuthorsData && topAuthorsData.length > 0 ? (
              <div className='flex flex-col gap-3'>
                {topAuthorsData.slice(0, 5).map((author, index) => (
                  <div
                    key={author.userId}
                    className='flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3'
                  >
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600'>
                        {index + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-gray-900'>
                          {author.name}
                        </p>
                        <p className='truncate text-xs text-gray-500'>
                          {author.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <span className='text-lg font-bold text-gray-900'>
                        {author.blogCount}
                      </span>
                      <span className='text-[10px] uppercase text-gray-500'>
                        Blogs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-6 text-center text-sm text-gray-500'>
                No blog authors found.
              </div>
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

        <UsersViewDialog
          user={selectedUserDetails || null}
          open={isViewProfileDialogOpen}
          onOpenChange={setIsViewProfileDialogOpen}
        />

        <Dialog
          open={isTopAuthorsDialogOpen}
          onOpenChange={setIsTopAuthorsDialogOpen}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Top Blog Authors</DialogTitle>
              <DialogDescription>
                List of top contributing authors based on published blogs.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className='max-h-[60vh] pr-4'>
              <div className='flex flex-col gap-3 py-4'>
                {topAuthorsData?.map((author, index) => (
                  <div
                    key={author.userId}
                    className='flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3'
                  >
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600'>
                        {index + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-gray-900'>
                          {author.name}
                        </p>
                        <p className='truncate text-xs text-gray-500'>
                          {author.email}
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <span className='text-lg font-bold text-gray-900'>
                        {author.blogCount}
                      </span>
                      <span className='text-[10px] uppercase text-gray-500'>
                        Blogs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Main>
  )
}
