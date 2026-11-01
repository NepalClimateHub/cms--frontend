import { useNavigate } from '@tanstack/react-router'
import type { FC } from 'react'
import { useCreateVacancy } from '@/query/vacancies/use-vacancies'
import type { VacancyFormValues } from '@/schemas/vacancy'
import { VacancyForm } from '../shared/VacancyForm'

const AddVacancy: FC = () => {
  const navigate = useNavigate()
  const createVacancyMutation = useCreateVacancy()

  const handleSubmit = (values: VacancyFormValues) => {
    // Filter out empty string items from responsibilities and requirements
    const cleanedValues = {
      ...values,
      responsibilities: (values.responsibilities || []).filter(
        (r) => r.trim() !== ''
      ),
      requirements: (values.requirements || []).filter((r) => r.trim() !== ''),
      // Send null (not '') so the backend's URL validation passes and clearing the field removes the link
      googleFormLink: values.googleFormLink?.trim() || null,
    }

    createVacancyMutation.mutate(cleanedValues, {
      onSuccess: () => {
        navigate({ to: '/vacancies' })
      },
    })
  }

  return (
    <VacancyForm
      title='Add New Vacancy'
      onSubmit={handleSubmit}
      isLoading={createVacancyMutation.isPending}
    />
  )
}

export default AddVacancy
