import { useAnalyticsAPI } from '@/query/analytics/use-analytics'
import { Newspaper, Briefcase, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    newsCount: <Newspaper className='h-5 w-5' />,
    opportunityCount: <Briefcase className='h-5 w-5' />,
    eventCount: <Calendar className='h-5 w-5' />,
    userCount: <Users className='h-5 w-5' />,
  }

  const gradientColors = {
    newsCount: 'from-blue-500 to-blue-600',
    opportunityCount: 'from-green-500 to-green-600',
    eventCount: 'from-purple-500 to-purple-600',
    userCount: 'from-pink-500 to-pink-600',
  }

  return (
    <div className='flex w-full flex-row gap-4'>
      {isLoading ? (
        <div className='flex w-full items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      ) : (
        analyticsData?.data && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {Object.entries(analyticsData?.data).map(([key, value]) => (
              <Card
                key={key}
                className='relative w-full overflow-hidden rounded-lg shadow-lg'
              >
                <div
                  className='absolute inset-0 bg-gradient-to-r opacity-5'
                  style={{
                    background: `linear-gradient(135deg, ${gradientColors[key as keyof typeof gradientColors]})`,
                  }}
                />
                <div className='relative flex h-full flex-col p-4'>
                  <div className='flex flex-row items-center justify-between pb-4'>
                    <div className='flex flex-col space-y-1'>
                      <CardTitle className='text-sm font-medium text-gray-500'>
                        {switchText[key as keyof typeof switchText] ?? ''}
                      </CardTitle>
                      <div className='text-3xl font-bold'>{value}</div>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm'>
                      {icons[key as keyof typeof icons]}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default Analytics
