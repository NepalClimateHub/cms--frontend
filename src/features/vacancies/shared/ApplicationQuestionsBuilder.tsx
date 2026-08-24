import { FC } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Switch } from '@/ui/shadcn/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/shadcn/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  VacancyFormValues,
  VacancyQuestionType,
  createEmptyQuestion,
  isChoiceQuestion,
} from '@/schemas/vacancy'
import { ArrowDown, ArrowUp, HelpCircle, Plus, Trash2 } from 'lucide-react'

interface BuilderProps {
  form: UseFormReturn<VacancyFormValues>
}

interface QuestionCardProps extends BuilderProps {
  index: number
  total: number
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const OptionsEditor: FC<BuilderProps & { index: number }> = ({
  form,
  index,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `questions.${index}.options` as never,
  })

  return (
    <div className='space-y-2 rounded-md border border-dashed bg-muted/20 p-3'>
      <div className='flex items-center justify-between'>
        <FormLabel className='text-xs font-medium'>
          Options <span className='text-red-500'>*</span>
        </FormLabel>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 gap-1 text-xs'
          onClick={() => append('')}
        >
          <Plus className='h-3 w-3' /> Add Option
        </Button>
      </div>

      {fields.map((option, optionIndex) => (
        <div key={option.id} className='flex items-center gap-2'>
          <FormField
            control={form.control}
            name={`questions.${index}.options.${optionIndex}`}
            render={({ field }) => (
              <FormItem className='mb-0 flex-1'>
                <FormControl>
                  <Input
                    placeholder={`Option ${optionIndex + 1}`}
                    className='h-9 text-sm'
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10'
            onClick={() => remove(optionIndex)}
            disabled={fields.length <= 2}
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      ))}

      <FormField
        control={form.control}
        name={`questions.${index}.options`}
        render={() => (
          <FormItem className='mb-0'>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

const QuestionCard: FC<QuestionCardProps> = ({
  form,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const type = form.watch(`questions.${index}.type`)

  const handleTypeChange = (next: VacancyQuestionType) => {
    form.setValue(`questions.${index}.type`, next, { shouldValidate: false })
    // Choice questions need options; every other type must not carry them.
    if (isChoiceQuestion(next)) {
      const current = form.getValues(`questions.${index}.options`) || []
      if (current.filter((option) => option.trim() !== '').length < 2) {
        form.setValue(`questions.${index}.options`, ['', ''])
      }
    } else {
      form.setValue(`questions.${index}.options`, [])
    }
  }

  return (
    <div className='space-y-4 rounded-lg border bg-background p-4'>
      <div className='flex items-start justify-between gap-3'>
        <span className='mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
          {index + 1}
        </span>

        <div className='flex-1'>
          <FormField
            control={form.control}
            name={`questions.${index}.label`}
            render={({ field }) => (
              <FormItem className='mb-0'>
                <FormControl>
                  <Input
                    placeholder='e.g. How many years have you worked with automated testing?'
                    className='w-full'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex shrink-0 items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ArrowUp className='h-3.5 w-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            <ArrowDown className='h-3.5 w-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-destructive hover:bg-destructive/10'
            onClick={onRemove}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 pl-9 sm:grid-cols-3'>
        <FormField
          control={form.control}
          name={`questions.${index}.type`}
          render={({ field }) => (
            <FormItem className='mb-0'>
              <FormLabel className='text-xs'>Answer Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) =>
                  handleTypeChange(value as VacancyQuestionType)
                }
              >
                <FormControl>
                  <SelectTrigger className='h-9 text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUESTION_TYPES.map((questionType) => (
                    <SelectItem key={questionType} value={questionType}>
                      {QUESTION_TYPE_LABELS[questionType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`questions.${index}.helpText`}
          render={({ field }) => (
            <FormItem className='mb-0'>
              <FormLabel className='text-xs'>Helper Text</FormLabel>
              <FormControl>
                <Input
                  placeholder='Optional hint shown under the field'
                  className='h-9 text-sm'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`questions.${index}.required`}
          render={({ field }) => (
            <FormItem className='mb-0 flex items-center justify-between rounded-md border px-3 py-2 sm:mt-6'>
              <FormLabel className='text-xs font-medium'>Required</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {isChoiceQuestion(type) && (
        <div className='pl-9'>
          <OptionsEditor form={form} index={index} />
        </div>
      )}
    </div>
  )
}

export const ApplicationQuestionsBuilder: FC<BuilderProps> = ({ form }) => {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'questions',
    keyName: 'fieldId',
  })

  return (
    <Card className='border-border/50 bg-card/60 shadow-sm backdrop-blur'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-4'>
        <div>
          <CardTitle className='text-lg font-semibold'>
            Application Questions
          </CardTitle>
          <CardDescription className='mt-1 text-xs'>
            Full name, email, confirm email, contact number, current address and
            CV link are always asked. Add role-specific questions below.
          </CardDescription>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-1.5 text-xs'
          onClick={() => append(createEmptyQuestion(fields.length))}
        >
          <Plus className='h-3.5 w-3.5' /> Add Question
        </Button>
      </CardHeader>
      <CardContent className='space-y-4'>
        {fields.length === 0 ? (
          <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center'>
            <HelpCircle className='h-6 w-6 text-muted-foreground' />
            <p className='text-sm font-medium text-foreground'>
              No custom questions yet
            </p>
            <p className='max-w-sm text-xs text-muted-foreground'>
              Applicants will only fill the common fields. Add questions to
              screen candidates on what actually matters for this role.
            </p>
          </div>
        ) : (
          fields.map((field, index) => (
            <QuestionCard
              key={field.fieldId}
              form={form}
              index={index}
              total={fields.length}
              onRemove={() => remove(index)}
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
            />
          ))
        )}

        <FormDescription className='text-xs'>
          Each question keeps a stable id — editing a question later will not
          break answers already submitted.
        </FormDescription>
      </CardContent>
    </Card>
  )
}
