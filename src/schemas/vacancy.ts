import { z } from 'zod'

/* -------------------------------------------------------------------------- */
/*                          Dynamic application questions                      */
/* -------------------------------------------------------------------------- */

export const QUESTION_TYPES = [
  'TEXT',
  'PARAGRAPH',
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'BOOLEAN',
  'NUMBER',
  'DATE',
  'FILE',
  'URL',
] as const

export type VacancyQuestionType = (typeof QUESTION_TYPES)[number]

export const QUESTION_TYPE_LABELS: Record<VacancyQuestionType, string> = {
  TEXT: 'Short answer',
  PARAGRAPH: 'Paragraph',
  SINGLE_CHOICE: 'Single choice',
  MULTI_CHOICE: 'Multiple choice',
  BOOLEAN: 'Yes / No',
  NUMBER: 'Number',
  DATE: 'Date',
  FILE: 'File upload',
  URL: 'Link / URL',
}

export const CHOICE_QUESTION_TYPES: VacancyQuestionType[] = [
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
]

export const isChoiceQuestion = (type: VacancyQuestionType) =>
  CHOICE_QUESTION_TYPES.includes(type)

export const vacancyQuestionSchema = z
  .object({
    // Stable id generated on the client so answers stay linked across edits.
    id: z.string().min(1),
    label: z.string().min(1, 'Question is required'),
    type: z.enum(QUESTION_TYPES).default('TEXT'),
    required: z.boolean().default(false),
    helpText: z.string().optional(),
    options: z.array(z.string()).default([]),
    order: z.coerce.number().default(0),
  })
  .superRefine((question, ctx) => {
    if (!isChoiceQuestion(question.type)) return

    const filled = question.options.filter((option) => option.trim() !== '')
    if (filled.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Add at least 2 options',
      })
    }
  })

export type VacancyQuestion = z.infer<typeof vacancyQuestionSchema>

export const createEmptyQuestion = (order: number): VacancyQuestion => ({
  id: crypto.randomUUID(),
  label: '',
  type: 'TEXT',
  required: false,
  helpText: '',
  options: [],
  order,
})

/* -------------------------------------------------------------------------- */
/*                                Vacancy form                                 */
/* -------------------------------------------------------------------------- */

export const vacancyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  openings: z.coerce.number().min(1, 'At least 1 opening required'),
  duration: z.string().optional(),
  hoursPerWeek: z.string().optional(),
  overview: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  location: z.string().optional(),
  type: z.string().optional(),
  deadline: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isDraft: z.boolean().default(false),
  questions: z.array(vacancyQuestionSchema).default([]),
})

export type VacancyFormValues = z.infer<typeof vacancyFormSchema>

/* -------------------------------------------------------------------------- */
/*                              Application form                               */
/* -------------------------------------------------------------------------- */

/** Value shapes an answer can carry, keyed by question type. */
export type VacancyAnswerValue = string | string[] | number | boolean | null

export const vacancyAnswerSchema = z.object({
  questionId: z.string().min(1),
  // Label/type are snapshotted so past applications stay readable after the
  // vacancy's questions are edited or removed.
  label: z.string(),
  type: z.enum(QUESTION_TYPES),
  value: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
    z.boolean(),
    z.null(),
  ]),
  fileId: z.string().optional().nullable(),
})

export type VacancyAnswer = z.infer<typeof vacancyAnswerSchema>

const vacancyApplyBaseSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  confirmEmail: z.string().min(1, 'Please confirm your email'),
  contact: z.string().min(1, 'Contact number is required'),
  currentAddress: z.string().min(1, 'Current address is required'),
  cvUrl: z.string().min(1, 'CV upload is required'),
  cvFileId: z.string().optional().nullable(),
  answers: z.array(vacancyAnswerSchema).default([]),
})

const isBlank = (value: VacancyAnswerValue) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

const refineEmailMatch = (
  data: { email: string; confirmEmail: string },
  ctx: z.RefinementCtx
) => {
  if (data.email.trim().toLowerCase() !== data.confirmEmail.trim().toLowerCase()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmEmail'],
      message: 'Emails do not match',
    })
  }
}

/**
 * Builds the apply-form validator for one vacancy. Common fields are fixed;
 * per-answer rules come from that vacancy's question list.
 */
export const buildVacancyApplySchema = (questions: VacancyQuestion[] = []) =>
  vacancyApplyBaseSchema.superRefine((data, ctx) => {
    refineEmailMatch(data, ctx)

    questions.forEach((question) => {
      const index = data.answers.findIndex(
        (answer) => answer.questionId === question.id
      )
      if (index === -1) return

      const value = data.answers[index].value
      const path = ['answers', index, 'value'] as (string | number)[]

      if (question.required && isBlank(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'This field is required',
        })
        return
      }

      if (isBlank(value)) return

      if (question.type === 'NUMBER' && Number.isNaN(Number(value))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'Enter a valid number',
        })
      }

      if (question.type === 'URL' && !z.string().url().safeParse(value).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'Enter a valid URL',
        })
      }
    })
  })

/** Fallback schema (no dynamic questions) — keeps types resolvable. */
export const vacancyApplyFormSchema = buildVacancyApplySchema([])

export type VacancyApplyFormValues = z.infer<typeof vacancyApplyBaseSchema>

/** Seeds one empty answer per question, typed for its input widget. */
export const buildDefaultAnswers = (
  questions: VacancyQuestion[] = []
): VacancyAnswer[] =>
  questions.map((question) => ({
    questionId: question.id,
    label: question.label,
    type: question.type,
    value:
      question.type === 'MULTI_CHOICE'
        ? []
        : question.type === 'BOOLEAN'
          ? null
          : '',
    fileId: null,
  }))
