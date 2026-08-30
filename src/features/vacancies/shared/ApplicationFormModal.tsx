import { FC } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Switch } from '@/ui/shadcn/switch'
import { Badge } from '@/ui/shadcn/badge'
import {
  FormControl,
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
import { ArrowDown, ArrowUp, HelpCircle, Lock, Plus, Trash2 } from 'lucide-react'

interface BuilderProps {
  form: UseFormReturn<VacancyFormValues>
}

interface ApplicationFormModalProps extends BuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Vacancy title, shown so the admin knows which form they're editing. */
  vacancyTitle?: string
}

/** Fields every applicant fills before the role-specific questions. */
const COMMON_FIELDS: {
  label: string
  placeholder: string
  type: string
  full?: boolean
}[] = [
  { label: 'Name', placeholder: 'Applicant full name', type: 'text' },
  { label: 'Current Address', placeholder: 'City, Country', type: 'text' },
  { label: 'Email', placeholder: 'name@example.com', type: 'email' },
  { label: 'Confirm Email', placeholder: 'Re-enter email', type: 'email' },
]

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

interface QuestionCardProps extends BuilderProps {
  index: number
  total: number
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
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
        <span className='mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
          {index + 1}
        </span>

        <div className='flex-1'>
          <FormField
            control={form.control}
            name={`questions.${index}.label`}
            render={({ field }) => (
              <FormItem className='mb-0'>
                <FormLabel className='text-xs'>
                  Question <span className='text-red-500'>*</span>
                </FormLabel>
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

        <div className='flex shrink-0 items-center gap-1 pt-5'>
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

export const ApplicationFormModal: FC<ApplicationFormModalProps> = ({
  form,
  open,
  onOpenChange,
  vacancyTitle,
}) => {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'questions',
    keyName: 'fieldId',
  })

  // Validate only the questions branch before closing, so a half-written
  // question can't slip through and fail silently on the parent form.
  const handleDone = async () => {
    const valid = await form.trigger('questions')
    if (valid) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader className='border-b pb-4'>
          <DialogTitle className='text-xl font-bold'>
            Application Form
          </DialogTitle>
          <DialogDescription>
            This is the form applicants fill in
            {vacancyTitle ? ` for ${vacancyTitle}` : ''}, in order. The common
            fields and the CV link are fixed — add role-specific questions in
            between.
          </DialogDescription>
        </DialogHeader>

        {/* Common fields — shown as a locked preview */}
        <div className='space-y-3 py-4'>
          <div className='flex items-center gap-2'>
            <Lock className='h-3.5 w-3.5 text-muted-foreground' />
            <h4 className='text-sm font-semibold text-foreground'>
              Common fields
            </h4>
            <Badge variant='secondary' className='text-[10px]'>
              Always asked
            </Badge>
          </div>

          <div className='grid grid-cols-1 gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2'>
            {COMMON_FIELDS.map((commonField) => (
              <div
                key={commonField.label}
                className={commonField.full ? 'sm:col-span-2' : undefined}
              >
                <label className='text-sm font-medium text-foreground'>
                  {commonField.label}{' '}
                  <span className='text-red-500'>*</span>
                </label>
                <Input
                  type={commonField.type}
                  className='mt-1.5 cursor-not-allowed bg-background'
                  placeholder={commonField.placeholder}
                  disabled
                />
              </div>
            ))}
          </div>
        </div>

        {/* Role-specific questions */}
        <div className='space-y-4 border-t pt-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <h4 className='text-sm font-semibold text-foreground'>
                Role-specific questions
              </h4>
              <p className='text-xs text-muted-foreground'>
                Add as many as you need. Applicants answer these after the
                common fields.
              </p>
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
          </div>

          {fields.length === 0 ? (
            <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center'>
              <HelpCircle className='h-6 w-6 text-muted-foreground' />
              <p className='text-sm font-medium text-foreground'>
                No questions yet
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
        </div>

        {/* Link to CV / Resume — always rendered last on the apply form */}
        <div className='space-y-3 border-t pt-4'>
          <div className='flex items-center gap-2'>
            <Lock className='h-3.5 w-3.5 text-muted-foreground' />
            <h4 className='text-sm font-semibold text-foreground'>
              Link to CV / Resume
            </h4>
            <Badge variant='secondary' className='text-[10px]'>
              Always last
            </Badge>
          </div>

          <div className='rounded-lg border bg-muted/20 p-4'>
            <label className='text-sm font-medium text-foreground'>
              Link to CV / Resume <span className='text-red-500'>*</span>
            </label>
            <Input
              type='url'
              className='mt-1.5 cursor-not-allowed bg-background'
              placeholder='https://drive.google.com/...'
              disabled
            />
            <p className='mt-1.5 text-xs text-muted-foreground'>
              Applicants paste a shareable Drive/Dropbox link — no file upload.
            </p>
          </div>
        </div>

        <DialogFooter className='border-t pt-4'>
          <p className='mr-auto text-xs text-muted-foreground'>
            Questions are saved when you save the vacancy.
          </p>
          <Button type='button' onClick={handleDone}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
