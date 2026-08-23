import { FC } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { VacancyForm } from '../shared/VacancyForm'
import { useCreateVacancy } from '@/query/vacancies/use-vacancies'
import { VacancyFormValues } from '@/schemas/vacancy'

const AddVacancy: FC = () => {
  const navigate = useNavigate()
  const createVacancyMutation = useCreateVacancy()

  const handleSubmit = (values: VacancyFormValues) => {
    // Filter out empty string items from responsibilities and requirements
    const cleanedValues = {
      ...values,
      responsibilities: (values.responsibilities || []).filter((r) => r.trim() !== ''),
      requirements: (values.requirements || []).filter((r) => r.trim() !== ''),
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
