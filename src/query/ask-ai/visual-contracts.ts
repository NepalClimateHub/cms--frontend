import { z } from 'zod'

const titleSchema = z.string().trim().min(1).max(80).optional()
const labelSchema = z.string().trim().min(1).max(60)
const sourceIndexV1Schema = z.number().int().min(1).max(3)
const sourceIndexV2Schema = z.number().int().min(1).max(8)

const visualBaseItemV1Schema = z
  .object({
    label: labelSchema,
    sourceIndex: sourceIndexV1Schema,
  })
  .strict()

const visualBaseItemV2Schema = z
  .object({
    label: labelSchema,
    sourceIndex: sourceIndexV2Schema,
  })
  .strict()

const emissionsProjectionItemV1Schema = visualBaseItemV1Schema
  .extend({
    year: z.string().regex(/^\d{4}$/),
    value: z.number(),
    unit: z.string().trim().min(1).max(24).optional(),
  })
  .strict()

const emissionsProjectionItemV2Schema = visualBaseItemV2Schema
  .extend({
    year: z.string().regex(/^\d{4}$/),
    value: z.number(),
    unit: z.string().trim().min(1).max(24).optional(),
  })
  .strict()

const visualSpecV1Schema = z.discriminatedUnion('type', [
  z
    .object({
      version: z.literal(1),
      type: z.literal('metric_strip'),
      title: titleSchema,
      items: z
        .array(
          visualBaseItemV1Schema
            .extend({
              value: z.string().trim().min(1).max(32),
            })
            .strict()
        )
        .min(2)
        .max(5),
    })
    .strict(),
  z
    .object({
      version: z.literal(1),
      type: z.literal('policy_timeline'),
      title: titleSchema,
      items: z
        .array(
          visualBaseItemV1Schema
            .extend({
              year: z.string().regex(/^\d{4}$/),
            })
            .strict()
        )
        .min(2)
        .max(5),
    })
    .strict(),
  z
    .object({
      version: z.literal(1),
      type: z.literal('sector_grid'),
      title: titleSchema,
      items: z.array(visualBaseItemV1Schema).min(2).max(8),
    })
    .strict(),
  z
    .object({
      version: z.literal(1),
      type: z.literal('document_comparison'),
      title: titleSchema,
      columns: z
        .array(
          z
            .object({
              label: labelSchema,
              sourceIndex: sourceIndexV1Schema,
            })
            .strict()
        )
        .length(2),
      rows: z
        .array(
          z
            .object({
              label: labelSchema,
              values: z
                .array(z.string().trim().min(1).max(100))
                .length(2),
            })
            .strict()
        )
        .min(2)
        .max(5),
    })
    .strict(),
  z
    .object({
      version: z.literal(1),
      type: z.literal('process_stepper'),
      title: titleSchema,
      items: z
        .array(
          z
            .object({
              step: z.number().int().min(1).max(6),
              label: z.string().trim().min(1).max(100),
              sourceIndex: sourceIndexV1Schema,
            })
            .strict()
        )
        .min(2)
        .max(6),
    })
    .strict(),
  z
    .object({
      version: z.literal(1),
      type: z.literal('emissions_projection'),
      title: titleSchema,
      yAxisLabel: z.string().trim().min(1).max(60).optional(),
      items: z.array(emissionsProjectionItemV1Schema).min(2).max(8),
    })
    .strict(),
])

const visualSpecV2Schema = z.discriminatedUnion('type', [
  z
    .object({
      version: z.literal(2),
      type: z.literal('metric_strip'),
      title: titleSchema,
      items: z
        .array(
          visualBaseItemV2Schema
            .extend({
              value: z.string().trim().min(1).max(32),
            })
            .strict()
        )
        .min(2)
        .max(6),
    })
    .strict(),
  z
    .object({
      version: z.literal(2),
      type: z.literal('policy_timeline'),
      title: titleSchema,
      items: z
        .array(
          visualBaseItemV2Schema
            .extend({
              year: z.string().regex(/^\d{4}$/),
            })
            .strict()
        )
        .min(2)
        .max(8),
    })
    .strict(),
  z
    .object({
      version: z.literal(2),
      type: z.literal('sector_grid'),
      title: titleSchema,
      items: z.array(visualBaseItemV2Schema).min(2).max(8),
    })
    .strict(),
  z
    .object({
      version: z.literal(2),
      type: z.literal('document_comparison'),
      title: titleSchema,
      columns: z
        .array(
          z
            .object({
              label: labelSchema,
            })
            .strict()
        )
        .length(2),
      rows: z
        .array(
          z
            .object({
              label: labelSchema,
              cells: z
                .array(
                  z
                    .object({
                      value: z.string().trim().min(1).max(100),
                      sourceIndex: sourceIndexV2Schema,
                    })
                    .strict()
                )
                .length(2),
            })
            .strict()
        )
        .min(2)
        .max(5),
    })
    .strict(),
  z
    .object({
      version: z.literal(2),
      type: z.literal('process_stepper'),
      title: titleSchema,
      items: z
        .array(
          z
            .object({
              step: z.number().int().min(1).max(8),
              label: z.string().trim().min(1).max(100),
              sourceIndex: sourceIndexV2Schema,
            })
            .strict()
        )
        .min(2)
        .max(8),
    })
    .strict(),
  z
    .object({
      version: z.literal(2),
      type: z.literal('emissions_projection'),
      title: titleSchema,
      yAxisLabel: z.string().trim().min(1).max(60).optional(),
      items: z.array(emissionsProjectionItemV2Schema).min(2).max(8),
    })
    .strict(),
])

const canonicalVisualSpecSchema = z
  .union([visualSpecV1Schema, visualSpecV2Schema])
  .superRefine((visual, context) => {
    if (visual.type === 'process_stepper') {
      const steps = visual.items.map((item) => item.step)
      if (new Set(steps).size !== steps.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Process steps must be unique',
          path: ['items'],
        })
      }
      if (
        visual.version === 2 &&
        steps.some((step, index) => step !== index + 1)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Process steps must be contiguous and ordered from 1',
          path: ['items'],
        })
      }
    }

    if (visual.version === 2 && visual.type === 'policy_timeline') {
      const years = visual.items.map((item) => Number(item.year))
      if (
        new Set(years).size !== years.length ||
        years.some((year, index) => index > 0 && year < years[index - 1])
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Timeline years must be unique and chronological',
          path: ['items'],
        })
      }
    }

    if (visual.version === 2 && visual.type === 'emissions_projection') {
      const series = new Map<string, Set<string>>()
      visual.items.forEach((item) => {
        const key = `${item.label}\u0000${item.unit || ''}`
        const years = series.get(key) || new Set<string>()
        years.add(item.year)
        series.set(key, years)
      })

      if (![...series.values()].some((years) => years.size >= 2)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Emissions projections require a same-label, same-unit series across at least two years',
          path: ['items'],
        })
      }
    }
  })

export const visualSpecSchema = z.preprocess((value) => {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).type === 'sector_chips'
  ) {
    return { ...(value as Record<string, unknown>), type: 'sector_grid' }
  }
  return value
}, canonicalVisualSpecSchema)

export type VisualSpec = z.infer<typeof visualSpecSchema>

export const visualDecisionStatusSchema = z.enum([
  'generated',
  'not_generated',
  'skipped',
])

export const visualDecisionReasonSchema = z.enum([
  'disabled',
  'not_grounded',
  'insufficient_evidence',
  'no_supported_category',
  'retrieval_gap',
  'validation_failed',
  'planner_error',
])

export const visualDecisionCategorySchema = z.enum([
  'emissions',
  'comparison',
  'process',
  'timeline',
  'sectors',
  'metrics',
])

export const visualDecisionSchema = z
  .object({
    attempted: z.boolean(),
    status: visualDecisionStatusSchema,
    category: visualDecisionCategorySchema.nullable().optional(),
    reason: visualDecisionReasonSchema.nullable().optional(),
    repairAttempted: z.boolean(),
    evidenceCount: z.number().int().min(0).max(8),
  })
  .strict()

export type VisualDecision = z.infer<typeof visualDecisionSchema>

export function parseVisualSpec(
  metadata?: Record<string, unknown>
): VisualSpec | undefined {
  const parsed = visualSpecSchema.safeParse(metadata?.visual)
  return parsed.success ? parsed.data : undefined
}

export function parseVisualDecision(
  metadata?: Record<string, unknown>
): VisualDecision | undefined {
  const parsed = visualDecisionSchema.safeParse(metadata?.visualDecision)
  return parsed.success ? parsed.data : undefined
}

export function parseVisualMetadata(metadata?: Record<string, unknown>) {
  return {
    visual: parseVisualSpec(metadata),
    visualDecision: parseVisualDecision(metadata),
  }
}
