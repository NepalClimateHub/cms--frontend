import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMinutesAPI } from '@/query/minutes/use-minutes'
import { Minutes, AddMinutesSchema } from '@/schemas/minutes/minutes'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import MinutesForm from '../shared/MinutesForm'

const MinutesAdd = () => {
  const addMinutesMutation = useMinutesAPI().addMinutes

  const form = useForm<Minutes>({
    resolver: zodResolver(AddMinutesSchema),
    defaultValues: {
      title: '',
      meetingTime: '',
      agenda: '',
      meetingSummary: '',
    },
  })

  const handleFormSubmit = async (values: Minutes) => {
    await addMinutesMutation.mutateAsync({
      body: {
        title: values.title,
        date: values.date.toISOString(),
        meetingTime: values.meetingTime,
        agenda: values.agenda,
        meetingSummary: values.meetingSummary,
      },
    })
  }

  return (
    <Main>
      <PageHeader
        title='Add Minutes'
        description='Record new meeting minutes'
        showBackButton={true}
      />
      <div className='mx-4 px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <MinutesForm
            form={form}
            handleFormSubmit={handleFormSubmit}
            isEdit={false}
            isLoading={addMinutesMutation.isPending}
          />
        </div>
      </div>
    </Main>
  )
}

export default MinutesAdd
