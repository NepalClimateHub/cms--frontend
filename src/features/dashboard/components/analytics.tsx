import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'

const analytics = () => {
  const analyticsData = [
    {
      title: 'Organizations',
      value: 20,
    },
    {
      title: 'Opportunities',
      value: 20,
    },
    {
      title: 'Events',
      value: 20,
    },
  ]

  return (
    <div className='flex w-full flex-row gap-4'>
      {analyticsData.map((item) => (
        <Card key={item.title} className='w-1/3'>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default analytics
