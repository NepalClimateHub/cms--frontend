import type { ReactNode } from 'react'
import type { VisualSpec } from '@/query/ask-ai/climate-api'
import {
  Banknote,
  Building2,
  Construction,
  Droplets,
  HeartPulse,
  Leaf,
  Mountain,
  Sprout,
  Trees,
  TriangleAlert,
  Users,
  Zap,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type RenderCitation = (sourceIndex: number) => ReactNode
type MetricStripSpec = Extract<VisualSpec, { type: 'metric_strip' }>
type PolicyTimelineSpec = Extract<VisualSpec, { type: 'policy_timeline' }>
type SectorGridSpec = Extract<VisualSpec, { type: 'sector_grid' }>
type DocumentComparisonSpec = Extract<
  VisualSpec,
  { type: 'document_comparison' }
>
type ProcessStepperSpec = Extract<VisualSpec, { type: 'process_stepper' }>
type EmissionsProjectionSpec = Extract<
  VisualSpec,
  { type: 'emissions_projection' }
>

const visualTitles: Record<VisualSpec['type'], string> = {
  metric_strip: 'Key figures',
  policy_timeline: 'Policy timeline',
  sector_grid: 'Covered sectors',
  document_comparison: 'Document comparison',
  process_stepper: 'Process',
  emissions_projection: 'Emissions projection',
}

function SectorIcon({ label }: { label: string }) {
  const iconClass = 'h-4 w-4 flex-shrink-0'
  const normalized = label.toLowerCase()
  if (/agric|food/.test(normalized)) return <Sprout className={iconClass} />
  if (/forest|biodiversity|ecosystem/.test(normalized))
    return <Trees className={iconClass} />
  if (/water/.test(normalized)) return <Droplets className={iconClass} />
  if (/energy|electric|power/.test(normalized))
    return <Zap className={iconClass} />
  if (/health/.test(normalized)) return <HeartPulse className={iconClass} />
  if (/settlement|urban|housing/.test(normalized))
    return <Building2 className={iconClass} />
  if (/infrastructure|transport|road/.test(normalized))
    return <Construction className={iconClass} />
  if (/disaster|drr/.test(normalized))
    return <TriangleAlert className={iconClass} />
  if (/tourism/.test(normalized)) return <Mountain className={iconClass} />
  if (/inclusion|gender|social/.test(normalized))
    return <Users className={iconClass} />
  if (/finance|financial/.test(normalized))
    return <Banknote className={iconClass} />
  return <Leaf className={iconClass} />
}

function MetricStrip({
  visual,
  renderCitation,
}: {
  visual: MetricStripSpec
  renderCitation: RenderCitation
}) {
  return (
    <dl className='grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
      {visual.items.map((item) => (
        <div key={`${item.label}-${item.value}`} className='min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <dd className='break-words text-xl font-semibold text-emerald-700 dark:text-emerald-300'>
              {item.value}
            </dd>
            {renderCitation(item.sourceIndex)}
          </div>
          <dt className='mt-1 break-words text-xs text-muted-foreground'>
            {item.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}

function PolicyTimeline({
  visual,
  renderCitation,
}: {
  visual: PolicyTimelineSpec
  renderCitation: RenderCitation
}) {
  return (
    <ol
      className='ml-2 space-y-4 border-l md:ml-0 md:grid md:space-y-0 md:border-l-0 md:border-t'
      style={{
        gridTemplateColumns: `repeat(${visual.items.length}, minmax(0, 1fr))`,
      }}
    >
      {visual.items.map((item) => (
        <li
          key={`${item.year}-${item.label}`}
          className='relative min-w-0 pl-5 md:pl-0 md:pr-4 md:pt-4'
        >
          <span className='absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-600 bg-background md:-top-[5px] md:left-0' />
          <div className='flex items-start gap-2'>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-300'>
                {item.year}
              </p>
              <p className='mt-1 break-words text-xs text-muted-foreground'>
                {item.label}
              </p>
            </div>
            {renderCitation(item.sourceIndex)}
          </div>
        </li>
      ))}
    </ol>
  )
}

function SectorGrid({
  visual,
  renderCitation,
}: {
  visual: SectorGridSpec
  renderCitation: RenderCitation
}) {
  return (
    <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {visual.items.map((item, index) => (
        <li
          key={`${item.label}-${item.sourceIndex}-${index}`}
          className='flex min-h-12 min-w-0 items-center gap-2 border bg-muted/30 px-3 py-2 text-sm'
        >
          <span className='text-emerald-700 dark:text-emerald-300'>
            <SectorIcon label={item.label} />
          </span>
          <span className='min-w-0 flex-1 break-words'>{item.label}</span>
          {renderCitation(item.sourceIndex)}
        </li>
      ))}
    </ul>
  )
}

function DocumentComparison({
  visual,
  renderCitation,
}: {
  visual: DocumentComparisonSpec
  renderCitation: RenderCitation
}) {
  return (
    <div>
      <div className='space-y-4 md:hidden'>
        {visual.rows.map((row, rowIndex) => (
          <section
            key={`${row.label}-${rowIndex}`}
            className='border-t pt-3 first:border-t-0 first:pt-0'
          >
            <h5 className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>
              {row.label}
            </h5>
            <dl className='space-y-2'>
              {visual.columns.map((column, columnIndex) => (
                <div
                  key={`${column.label}-${columnIndex}`}
                  className='grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3'
                >
                  <dt className='break-words text-xs font-medium'>
                    {column.label}
                  </dt>
                  <dd className='flex min-w-0 items-start justify-between gap-2 text-sm'>
                    <span className='break-words'>
                      {row.values[columnIndex]}
                    </span>
                    {renderCitation(column.sourceIndex)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div
        className='hidden overflow-hidden border md:block'
        role='table'
        aria-label={visual.title || 'Document comparison'}
      >
        <div
          className='grid grid-cols-3 bg-muted/40 text-xs font-semibold'
          role='row'
        >
          <div className='p-3' role='columnheader'>
            Topic
          </div>
          {visual.columns.map((column, index) => (
            <div
              key={`${column.label}-${index}`}
              className='min-w-0 border-l p-3'
              role='columnheader'
            >
              <span className='break-words'>{column.label}</span>
            </div>
          ))}
        </div>
        {visual.rows.map((row, rowIndex) => (
          <div
            key={`${row.label}-${rowIndex}`}
            className='grid grid-cols-3 border-t text-sm'
            role='row'
          >
            <div className='min-w-0 p-3 font-medium' role='rowheader'>
              <span className='break-words'>{row.label}</span>
            </div>
            {visual.columns.map((column, columnIndex) => (
              <div
                key={`${column.label}-${columnIndex}`}
                className='flex min-w-0 items-start justify-between gap-2 border-l p-3'
                role='cell'
              >
                <span className='break-words'>{row.values[columnIndex]}</span>
                {renderCitation(column.sourceIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProcessStepper({
  visual,
  renderCitation,
}: {
  visual: ProcessStepperSpec
  renderCitation: RenderCitation
}) {
  return (
    <ol
      className='ml-4 space-y-4 border-l md:ml-0 md:grid md:space-y-0 md:border-l-0 md:border-t'
      style={{
        gridTemplateColumns: `repeat(${visual.items.length}, minmax(0, 1fr))`,
      }}
    >
      {visual.items.map((item) => (
        <li
          key={item.step}
          className='relative min-w-0 pl-7 md:pl-0 md:pr-4 md:pt-6'
        >
          <span className='absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white md:-top-3 md:left-0'>
            {item.step}
          </span>
          <div className='flex items-start justify-between gap-2'>
            <p className='break-words text-sm'>{item.label}</p>
            {renderCitation(item.sourceIndex)}
          </div>
        </li>
      ))}
    </ol>
  )
}

const emissionsChartColors = [
  '#047857',
  '#0369a1',
  '#b45309',
  '#be123c',
  '#6d28d9',
  '#0f766e',
]

function EmissionsProjection({
  visual,
  renderCitation,
}: {
  visual: EmissionsProjectionSpec
  renderCitation: RenderCitation
}) {
  const labels = Array.from(new Set(visual.items.map((item) => item.label)))
  const years = Array.from(
    new Set(visual.items.map((item) => item.year))
  ).sort()
  const unit =
    visual.yAxisLabel || visual.items.find((item) => item.unit)?.unit || ''
  const chartData = years.map((year) => {
    const row: Record<string, string | number | undefined> = { year }
    visual.items
      .filter((item) => item.year === year)
      .forEach((item) => {
        row[item.label] = item.value
      })
    return row
  })

  return (
    <div className='space-y-3'>
      <div className='h-72 w-full min-w-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 14, bottom: 4, left: 0 }}
          >
            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
            <XAxis
              dataKey='year'
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={44}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value}${unit ? ` ${unit}` : ''}`,
                name,
              ]}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {labels.map((label, index) => (
              <Line
                key={label}
                type='monotone'
                dataKey={label}
                connectNulls
                stroke={
                  emissionsChartColors[index % emissionsChartColors.length]
                }
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className='flex flex-wrap gap-2 text-xs'>
        {visual.items.map((item) => (
          <li
            key={`${item.year}-${item.label}-${item.value}`}
            className='inline-flex max-w-full items-center gap-2 border bg-muted/30 px-2 py-1.5'
          >
            <span className='break-words'>
              {item.year} {item.label}: {item.value}
              {item.unit ? ` ${item.unit}` : ''}
            </span>
            {renderCitation(item.sourceIndex)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function VisualBody({
  visual,
  renderCitation,
}: {
  visual: VisualSpec
  renderCitation: RenderCitation
}) {
  switch (visual.type) {
    case 'metric_strip':
      return <MetricStrip visual={visual} renderCitation={renderCitation} />
    case 'policy_timeline':
      return <PolicyTimeline visual={visual} renderCitation={renderCitation} />
    case 'sector_grid':
      return <SectorGrid visual={visual} renderCitation={renderCitation} />
    case 'document_comparison':
      return (
        <DocumentComparison visual={visual} renderCitation={renderCitation} />
      )
    case 'process_stepper':
      return <ProcessStepper visual={visual} renderCitation={renderCitation} />
    case 'emissions_projection':
      return (
        <EmissionsProjection visual={visual} renderCitation={renderCitation} />
      )
  }
}

export function InlineVisual({
  visual,
  renderCitation,
}: {
  visual: VisualSpec
  renderCitation: RenderCitation
}) {
  const title = visual.title || visualTitles[visual.type]

  return (
    <section
      className='mt-4 border-y py-3'
      aria-label={title}
      data-visual-type={visual.type}
    >
      <h4 className='mb-3 text-sm font-semibold'>{title}</h4>
      <VisualBody visual={visual} renderCitation={renderCitation} />
    </section>
  )
}
