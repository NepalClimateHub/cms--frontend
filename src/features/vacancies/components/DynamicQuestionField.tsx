import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/ui/shadcn/input'
import { Textarea } from '@/ui/shadcn/textarea'
import { Button } from '@/ui/shadcn/button'
import { Checkbox } from '@/ui/shadcn/checkbox'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import {
  VacancyApplyFormValues,
  VacancyQuestion,
} from '@/schemas/vacancy'
import IKContext from '@/ui/molecules/image-kit/IKContext'
import IKUpload from '@/ui/molecules/image-kit/IKUpload'
import { toast } from '@/hooks/use-toast'
import { FileCheck, Upload } from 'lucide-react'

interface DynamicQuestionFieldProps {
  form: UseFormReturn<VacancyApplyFormValues>
  question: VacancyQuestion
  index: number
  /** ImageKit config, only used by FILE questions. */
  publicKey?: string
  endpoint?: string
  folder?: string
  authenticator: () => Promise<unknown>
  uploadingId: string | null
  onUploadingChange: (id: string | null) => void
}

export const DynamicQuestionField: FC<DynamicQuestionFieldProps> = ({
  form,
  question,
  index,
  publicKey,
  endpoint,
  folder,
  authenticator,
  uploadingId,
  onUploadingChange,
}) => {
  const name = `answers.${index}.value` as const

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const setValue = (value: unknown) => field.onChange(value)

        const renderInput = () => {
          switch (question.type) {
            case 'PARAGRAPH':
              return (
                <Textarea
                  rows={4}
                  value={(field.value as string) || ''}
                  onChange={(event) => setValue(event.target.value)}
                />
              )

            case 'NUMBER':
              return (
                <Input
                  type='number'
                  value={(field.value as string) ?? ''}
                  onChange={(event) => setValue(event.target.value)}
                />
              )

            case 'DATE':
              return (
                <Input
                  type='date'
                  value={(field.value as string) || ''}
                  onChange={(event) => setValue(event.target.value)}
                />
              )

            case 'URL':
              return (
                <Input
                  type='url'
                  placeholder='https://'
                  value={(field.value as string) || ''}
                  onChange={(event) => setValue(event.target.value)}
                />
              )

            case 'BOOLEAN':
              return (
                <RadioGroup
                  className='flex gap-6 pt-1'
                  value={
                    field.value === true
                      ? 'yes'
                      : field.value === false
                        ? 'no'
                        : ''
                  }
                  onValueChange={(value) => setValue(value === 'yes')}
                >
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='yes' id={`${question.id}-yes`} />
                    <label
                      htmlFor={`${question.id}-yes`}
                      className='cursor-pointer text-sm'
                    >
                      Yes
                    </label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <RadioGroupItem value='no' id={`${question.id}-no`} />
                    <label
                      htmlFor={`${question.id}-no`}
                      className='cursor-pointer text-sm'
                    >
                      No
                    </label>
                  </div>
                </RadioGroup>
              )

            case 'SINGLE_CHOICE':
              return (
                <RadioGroup
                  className='space-y-1 pt-1'
                  value={(field.value as string) || ''}
                  onValueChange={setValue}
                >
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={`${option}-${optionIndex}`}
                      className='flex items-center gap-2'
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${optionIndex}`}
                      />
                      <label
                        htmlFor={`${question.id}-${optionIndex}`}
                        className='cursor-pointer text-sm'
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )

            case 'MULTI_CHOICE': {
              const selected = Array.isArray(field.value)
                ? (field.value as string[])
                : []
              return (
                <div className='space-y-2 pt-1'>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={`${option}-${optionIndex}`}
                      className='flex items-center gap-2'
                    >
                      <Checkbox
                        id={`${question.id}-${optionIndex}`}
                        checked={selected.includes(option)}
                        onCheckedChange={(checked) =>
                          setValue(
                            checked
                              ? [...selected, option]
                              : selected.filter((item) => item !== option)
                          )
                        }
                      />
                      <label
                        htmlFor={`${question.id}-${optionIndex}`}
                        className='cursor-pointer text-sm'
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )
            }

            case 'FILE': {
              const uploadId = `question-file-${question.id}`
              const uploadedUrl = (field.value as string) || ''
              return (
                <div className='rounded-lg border-2 border-dashed border-border bg-muted/30 p-4'>
                  <IKContext
                    publicKey={publicKey}
                    urlEndpoint={endpoint}
                    authenticator={authenticator}
                  >
                    <div className='flex flex-col items-center gap-2 text-center'>
                      {uploadedUrl ? (
                        <div className='flex items-center gap-2 text-sm font-medium text-emerald-600'>
                          <FileCheck className='h-5 w-5' />
                          <span>File uploaded</span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='h-auto p-1 text-xs text-destructive'
                            onClick={() => {
                              setValue('')
                              form.setValue(`answers.${index}.fileId`, null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className='h-6 w-6 text-muted-foreground' />
                          <span className='text-xs text-muted-foreground'>
                            Upload a file (Max 10MB)
                          </span>
                          <IKUpload
                            inputId={uploadId}
                            isUploading={uploadingId === uploadId}
                            label='Select File'
                            description='File size should not exceed 10MB'
                            folder={folder}
                            useUniqueFileName={true}
                            onUploadStart={() => onUploadingChange(uploadId)}
                            onError={(err) => {
                              onUploadingChange(null)
                              toast({
                                variant: 'destructive',
                                title: 'Upload failed',
                                description:
                                  err?.message || 'Could not upload file.',
                              })
                            }}
                            onSuccess={(res: {
                              url?: string
                              fileId?: string
                            }) => {
                              onUploadingChange(null)
                              if (!res?.url) return
                              setValue(res.url)
                              form.setValue(
                                `answers.${index}.fileId`,
                                res.fileId || null
                              )
                              toast({ title: 'File uploaded' })
                            }}
                          />
                        </>
                      )}
                    </div>
                  </IKContext>
                </div>
              )
            }

            case 'TEXT':
            default:
              return (
                <Input
                  value={(field.value as string) || ''}
                  onChange={(event) => setValue(event.target.value)}
                />
              )
          }
        }

        return (
          <FormItem>
            <FormLabel>
              {question.label}{' '}
              {question.required && <span className='text-red-500'>*</span>}
            </FormLabel>
            <FormControl>{renderInput()}</FormControl>
            {question.helpText && (
              <FormDescription className='text-xs'>
                {question.helpText}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
