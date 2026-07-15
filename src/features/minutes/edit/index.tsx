import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from '@tanstack/react-router'
import { useGetOneMinutes, useMinutesAPI } from '@/query/minutes/use-minutes'
import { AddMinutesSchema, type Minutes } from '@/schemas/minutes/minutes'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import MinutesForm from '../shared/MinutesForm'

const MinutesEdit = () => {
  const { minutesId } = useParams({
    from: '/_authenticated/minutes/$minutesId/',
  })

  const { data: minutesData, isLoading } = useGetOneMinutes(minutesId)
  const [isFormReady, setIsFormReady] = useState(false)
  const hasReset = useRef(false)

  const minutesMutation = useMinutesAPI().updateMinutes

  const form = useForm<Minutes>({
    resolver: zodResolver(AddMinutesSchema),
  })

  useEffect(() => {
    if (minutesData && !hasReset.current) {
      form.reset({
        title: minutesData.title,
        date: minutesData.date ? new Date(minutesData.date) : new Date(),
        meetingTime: minutesData.meetingTime || '',
        agenda: minutesData.agenda || '',
        meetingSummary: minutesData.meetingSummary || '',
      })
      hasReset.current = true
      setIsFormReady(true)
    }
  }, [minutesData])

  const handleFormSubmit = async (values: Minutes) => {
    await minutesMutation.mutateAsync({
      path: {
        id: minutesId,
      },
      body: {
        title: values.title,
        date: values.date.toISOString(),
        meetingTime: values.meetingTime,
        agenda: values.agenda,
        meetingSummary: values.meetingSummary,
      },
    })
  }

  if (isLoading || !minutesData || !isFormReady) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader title='Edit Minutes' showBackButton={true} />
      <div className='mx-4 px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <MinutesForm
            form={form}
            handleFormSubmit={handleFormSubmit}
            isEdit={true}
            isLoading={minutesMutation.isPending}
          />
        </div>
      </div>
    </Main>
  )
}

export default MinutesEdit
