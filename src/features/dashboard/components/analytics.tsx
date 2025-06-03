import { Link } from '@tanstack/react-router'
import { useAnalyticsAPI } from '@/query/analytics/use-analytics'
import { Newspaper, Briefcase, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { climateQuotes } from '@/data/climate-quotes';
import { useMemo } from 'react';

const Analytics = () => {
  const { data: analyticsData, isLoading } =
    useAnalyticsAPI().getAnalyticsForAdmin

  const switchText = {
    newsCount: 'News',
    opportunityCount: 'Opportunities',
    eventCount: 'Events',
    userCount: 'Users',
  }

  const icons = {
    newsCount: <Newspaper className='h-5 w-5 text-blue-600' />,
    opportunityCount: <Briefcase className='h-5 w-5 text-green-600' />,
    eventCount: <Calendar className='h-5 w-5 text-purple-600' />,
    userCount: <Users className='h-5 w-5 text-pink-600' />,
  }

  const gradientColors = {
    newsCount: 'from-blue-500/20 to-blue-600/20',
    opportunityCount: 'from-green-500/20 to-green-600/20',
    eventCount: 'from-purple-500/20 to-purple-600/20',
    userCount: 'from-pink-500/20 to-pink-600/20',
  }

  const iconBgColors = {
    newsCount: 'bg-blue-100',
    opportunityCount: 'bg-green-100',
    eventCount: 'bg-purple-100',
    userCount: 'bg-pink-100',
  }

  const routes = {
    newsCount: '/news/list',
    opportunityCount: '/opportunities/list',
    eventCount: '/events/list',
    userCount: '/users',
  }

  // Prepare data for the chart
  const chartData = analyticsData?.data ? [
    { name: switchText.newsCount, count: analyticsData.data.newsCount },
    { name: switchText.eventCount, count: analyticsData.data.eventCount },
    { name: switchText.opportunityCount, count: analyticsData.data.opportunityCount },
  ] : [];

  // Get the quote of the day
  const quoteOfTheDay = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % climateQuotes.length;
    return climateQuotes[quoteIndex];
  }, [climateQuotes]); // Recalculate only if climateQuotes array changes

  return (
    <div className='flex w-full flex-col gap-6'>
      {isLoading ? (
        <div className='flex w-full items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      ) : (
        analyticsData?.data && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
            {/* Analytics Cards */}
            <div className='lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {Object.entries(analyticsData?.data).map(([key, value]) => (
                <Link
                  key={key}
                  to={routes[key as keyof typeof routes]}
                  className='block transition-transform duration-200 hover:scale-[1.02]'
                >
                  <Card className='relative w-full overflow-hidden rounded-xl border-none shadow-lg transition-all duration-200 hover:shadow-xl'>
                    <div
                      className='absolute inset-0 bg-gradient-to-r opacity-10'
                      style={{
                        background: `linear-gradient(135deg, ${gradientColors[key as keyof typeof gradientColors]})`,
                      }}
                    />
                    <div className='relative flex h-full flex-col p-8'>
                      <div className='flex flex-row items-center justify-between'>
                        <div className='flex flex-col space-y-2'>
                          <CardTitle className='text-base font-medium text-muted-foreground'>
                            {switchText[key as keyof typeof switchText] ?? ''}
                          </CardTitle>
                          <div className='text-4xl font-bold tracking-tight'>
                            {value}
                          </div>
                        </div>
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            iconBgColors[key as keyof typeof iconBgColors]
                          )}
                        >
                          {icons[key as keyof typeof icons]}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Charts Section */}
            <Card className='lg:col-span-2 p-6 shadow-lg'>
              <CardTitle className='text-lg font-semibold mb-4'>Content Overview</CardTitle>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Quotes Section */}
            <Card className='lg:col-span-2 p-6 shadow-lg flex flex-col justify-center items-center text-center'>
               <CardTitle className='text-lg font-semibold mb-4'>Climate Quote of the Day</CardTitle>
               <p className='text-muted-foreground italic'>
                 "{quoteOfTheDay.quote}"
               </p>
               <p className='text-muted-foreground mt-2'>
                 - {quoteOfTheDay.author}
               </p>
            </Card>
          </div>
        )
      )}
    </div>
  )
}

export default Analytics
