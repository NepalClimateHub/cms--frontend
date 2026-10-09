import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import type { FC } from 'react'
import {
  useGetVacancy,
  useUpdateVacancy,
} from '@/query/vacancies/use-vacancies'
import type { VacancyFormValues } from '@/schemas/vacancy'
import { VacancyForm } from '../shared/VacancyForm'

const EditVacancy: FC = () => {
  const { id } = useParams({ from: '/_authenticated/vacancies/$id' })
  const { applicationForm } = useSearch({
    from: '/_authenticated/vacancies/$id',
  })
  const navigate = useNavigate()
  const { data, isLoading } = useGetVacancy(id)
  const updateVacancyMutation = useUpdateVacancy()

  const vacancy = data?.data

  const handleSubmit = (values: VacancyFormValues) => {
    const cleanedValues = {
      ...values,
      responsibilities: (values.responsibilities || []).filter(
        (r) => r.trim() !== ''
      ),
      requirements: (values.requirements || []).filter((r) => r.trim() !== ''),
      // Send null (not '') so the backend's URL validation passes and clearing the field removes the link
      googleFormLink: values.googleFormLink?.trim() || null,
    }

    updateVacancyMutation.mutate(
      {
        id,
        data: cleanedValues,
      },
      {
        onSuccess: () => {
          navigate({ to: '/vacancies' })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className='p-6 text-center text-muted-foreground'>
        Loading vacancy...
      </div>
    )
  }

  if (!vacancy) {
    return <div className='p-6 text-center text-red-500'>Vacancy not found</div>
  }

  return (
    <VacancyForm
      title={`Edit Vacancy: ${vacancy.title}`}
      initialValues={{
        title: vacancy.title,
        openings: vacancy.openings,
        duration: vacancy.duration || '',
        hoursPerWeek: vacancy.hoursPerWeek || '',
        overview: vacancy.overview || '',
        responsibilities: vacancy.responsibilities || [],
        requirements: vacancy.requirements || [],
        location: vacancy.location || '',
        type: vacancy.type || '',
        deadline: vacancy.deadline || null,
        isActive: vacancy.isActive,
        isDraft: vacancy.isDraft,
        questions: vacancy.questions || [],
        googleFormLink: vacancy.googleFormLink || '',
      }}
      openApplicationForm={applicationForm}
      onSubmit={handleSubmit}
      isLoading={updateVacancyMutation.isPending}
    />
  )
}

export default EditVacancy
