import { useDeferredValue, useMemo, useState } from 'react'
import {
  AiDocument,
  DocumentStatus,
  openAiDocument,
  useAiDocumentChunks,
  useAiAssistantSettings,
  useAiDocuments,
  useAiDocumentSummary,
  useDeleteAiDocument,
  useRebuildAiIndex,
  useReindexAiDocument,
  useRetryAiDocument,
  useUpdateAiAssistantSettings,
  useUploadAiDocument,
  useClimateDataStatus,
  useSyncClimateData,
} from '@/query/ask-ai/document-management'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/shadcn/alert-dialog'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover'
import { Switch } from '@/ui/shadcn/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/shadcn/table'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  DatabaseBackup,
  FileText,
  Info,
  ListTree,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
  MapPinned,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { isSuperAdmin } from '@/utils/role-check.util'
import { toast } from '@/hooks/use-toast'

const activeStatuses: DocumentStatus[] = [
  'QUEUED',
  'INDEXING',
  'DELETE_QUEUED',
  'DELETING',
]

type ConfirmationAction = 'FULL_REBUILD' | 'BACKFILL' | 'INCREMENTAL'

const confirmationContent: Record<
  ConfirmationAction,
  { title: string; description: string; confirmLabel: string }
> = {
  FULL_REBUILD: {
    title: 'Full rebuild AI index?',
    description:
      'This will rebuild the complete AI index from all ready PDFs and may take some time.',
    confirmLabel: 'Start Full Rebuild',
  },
  BACKFILL: {
    title: 'Backfill climate data?',
    description:
      'This will import all historical climate data from the configured start year through the last completed month and may take a long time.',
    confirmLabel: 'Start Backfill',
  },
  INCREMENTAL: {
    title: 'Sync climate data now?',
    description:
      'This will import recent climate data through the last completed month.',
    confirmLabel: 'Start Sync',
  },
}

const statusStyles: Record<DocumentStatus, string> = {
  UPLOADED: 'bg-slate-500',
  QUEUED: 'bg-amber-500',
  INDEXING: 'bg-blue-500',
  READY: 'bg-emerald-600',
  FAILED: 'bg-red-600',
  DELETE_QUEUED: 'bg-orange-500',
  DELETING: 'bg-orange-600',
  DELETE_CLEANUP_FAILED: 'bg-red-700',
  DELETED: 'bg-slate-600',
}

function formatBytes(value?: number) {
  if (!value) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = value
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(unit ? 1 : 0)} ${units[unit]}`
}

function latestStage(document: AiDocument) {
  return document.index_jobs[0]?.stage?.replace(/_/g, ' ') || '-'
}

function formatDuration(job?: AiDocument['index_jobs'][0]) {
  if (!job?.started_at) return '-'
  const end = job.completed_at ? new Date(job.completed_at) : new Date()
  const ms = end.getTime() - new Date(job.started_at).getTime()
  if (ms < 0) return '-'
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatChunkPages(pageStart?: number | null, pageEnd?: number | null) {
  if (pageStart == null && pageEnd == null) return 'Page unavailable'
  const start = pageStart ?? pageEnd
  const end = pageEnd ?? pageStart
  return start === end ? `Page ${start}` : `Pages ${start}-${end}`
}

const stageProgress: Record<string, number> = {
  queued: 5,
  extracting: 25,
  embedding: 60,
  publishing: 85,
  completed: 100,
}

function IndexingProgress({ stage }: { stage: string }) {
  const pct = stageProgress[stage.toLowerCase()] ?? 10
  return (
    <div className='flex min-w-28 flex-col gap-1'>
      <div className='flex justify-between text-xs'>
        <span className='capitalize text-muted-foreground'>{stage}</span>
        <span className='text-muted-foreground'>{pct}%</span>
      </div>
      <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full bg-blue-500 transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function AiDocumentManagement() {
  const userRole = useAuthStore((state) => state.user?.role ?? null)
  const isSuperAdminUser = isSuperAdmin(userRole)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<AiDocument | null>(null)
  const [confirmationAction, setConfirmationAction] =
    useState<ConfirmationAction | null>(null)
  const [chunkTarget, setChunkTarget] = useState<AiDocument | null>(null)
  const [chunkPage, setChunkPage] = useState(1)
  const [chunkSearch, setChunkSearch] = useState('')
  const deferredChunkSearch = useDeferredValue(chunkSearch)
  const documentsQuery = useAiDocuments(search, status)
  const chunksQuery = useAiDocumentChunks(
    chunkTarget?.id,
    chunkPage,
    deferredChunkSearch,
    Boolean(chunkTarget)
  )
  const summaryQuery = useAiDocumentSummary()
  const upload = useUploadAiDocument()
  const reindex = useReindexAiDocument()
  const retry = useRetryAiDocument()
  const remove = useDeleteAiDocument()
  const rebuild = useRebuildAiIndex()
  const settingsQuery = useAiAssistantSettings(isSuperAdminUser)
  const updateSettings = useUpdateAiAssistantSettings()
  const climateStatus = useClimateDataStatus()
  const syncClimate = useSyncClimateData()
  const climateSyncActive =
    syncClimate.isPending ||
    ['QUEUED', 'RUNNING'].includes(climateStatus.data?.latestRun?.status || '')
  const chunkPageCount = Math.max(
    1,
    Math.ceil((chunksQuery.data?.total || 0) / 25)
  )

  const counts = useMemo(
    () =>
      Object.fromEntries(
        (summaryQuery.data?.documents || []).map((item) => [
          item.status,
          item._count,
        ])
      ),
    [summaryQuery.data]
  )

  const reportError = (error: unknown) => {
    toast({
      variant: 'destructive',
      title: 'Operation failed',
      description: error instanceof Error ? error.message : 'Please try again.',
    })
  }

  const submitUpload = async () => {
    if (!files.length) return
    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i)
        setUploadProgress(0)
        await upload.mutateAsync({
          file: files[i],
          title: files.length === 1 ? title : '',
          onProgress: setUploadProgress,
        })
      }
      setUploadOpen(false)
      setFiles([])
      setTitle('')
      setUploadProgress(0)
      setCurrentFileIndex(0)
      toast({
        title: 'Upload accepted',
        description: `${files.length} file(s) queued for indexing.`,
      })
    } catch (error) {
      reportError(error)
    }
  }

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      toast({ title: success })
    } catch (error) {
      reportError(error)
    }
  }

  const runConfirmedAction = () => {
    const action = confirmationAction
    setConfirmationAction(null)

    if (action === 'FULL_REBUILD') {
      void runAction(() => rebuild.mutateAsync(), 'Full rebuild queued')
    } else if (action === 'BACKFILL') {
      void runAction(
        () => syncClimate.mutateAsync('BACKFILL'),
        'Climate backfill queued'
      )
    } else if (action === 'INCREMENTAL') {
      void runAction(
        () => syncClimate.mutateAsync('INCREMENTAL'),
        'Climate sync queued'
      )
    }
  }

  return (
    <Main>
      <PageHeader
        title='AI Documents'
        description='Manage the PDFs used by the NCH Climate Assistant.'
        actions={
          <div className='flex flex-wrap items-center justify-end gap-2'>
            {isSuperAdminUser && (
              <div className='flex h-10 items-center gap-3 rounded-md border px-3'>
                <label
                  htmlFor='visual-responses'
                  className='text-sm font-medium'
                >
                  Visual responses
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-muted-foreground'
                      aria-label='How visual responses work'
                      title='How visual responses work'
                    >
                      <Info className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align='end'
                    className='w-80 max-w-[calc(100vw-2rem)] space-y-4'
                  >
                    <div className='space-y-1'>
                      <h4 className='text-sm font-semibold'>
                        Visual responses
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        This global setting applies to all chat users.
                      </p>
                    </div>

                    <ul className='list-disc space-y-1 pl-4 text-sm text-muted-foreground'>
                      <li>
                        Shows key figures, policy timelines, sector grids,
                        document comparisons, process steps, or emissions
                        charts.
                      </li>
                      <li>Requires document-supported facts and values.</li>
                      <li>Selects one best-fit visual for each answer.</li>
                      <li>Unsupported answers remain text-only.</li>
                      <li>
                        Turning it off hides saved visuals without deleting
                        them.
                      </li>
                    </ul>

                    <div className='space-y-2'>
                      <p className='text-xs font-semibold uppercase text-muted-foreground'>
                        Example questions
                      </p>
                      <ul className='space-y-2 text-sm'>
                        <li>
                          &quot;Show the key targets in Nepal's NDC.&quot;
                        </li>
                        <li>
                          &quot;Create a timeline of Nepal's climate
                          policies.&quot;
                        </li>
                        <li>
                          &quot;Which sectors are prioritized in the National
                          Adaptation Plan?&quot;
                        </li>
                        <li>
                          &quot;Compare Nepal&apos;s adaptation plan with its
                          climate policy.&quot;
                        </li>
                        <li>
                          &quot;What are the steps in the adaptation planning
                          process?&quot;
                        </li>
                        <li>
                          &quot;How could Nepal's emissions change toward
                          2050?&quot;
                        </li>
                      </ul>
                    </div>
                  </PopoverContent>
                </Popover>
                <Switch
                  id='visual-responses'
                  aria-label='Enable visual responses'
                  checked={settingsQuery.data?.visualResponsesEnabled ?? false}
                  disabled={settingsQuery.isLoading || updateSettings.isPending}
                  onCheckedChange={(checked) => {
                    updateSettings.mutate(
                      { visualResponsesEnabled: checked },
                      {
                        onSuccess: () => {
                          toast({
                            title: checked
                              ? 'Visual responses enabled'
                              : 'Visual responses disabled',
                          })
                        },
                        onError: reportError,
                      }
                    )
                  }}
                />
              </div>
            )}
            <Button
              variant='outline'
              disabled={rebuild.isPending}
              onClick={() => setConfirmationAction('FULL_REBUILD')}
            >
              {rebuild.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              Full Rebuild
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className='mr-2 h-4 w-4' /> Upload PDF
            </Button>
          </div>
        }
      />

      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Ready documents
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>
            {counts.READY || 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Processing/Indexing
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>
            {activeStatuses.reduce(
              (total, item) => total + (counts[item] || 0),
              0
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Indexed chunks
            </CardTitle>
          </CardHeader>
          <CardContent className='text-2xl font-bold'>
            {summaryQuery.data?.totalChunks || 0}
          </CardContent>
        </Card>
      </div>

      <section
        className='mt-6 border-y py-4'
        aria-labelledby='climate-data-heading'
      >
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <Database className='h-4 w-4 text-emerald-700' />
              <h2 id='climate-data-heading' className='text-sm font-semibold'>
                Climate Data
              </h2>
              {climateStatus.data?.latestRun && (
                <Badge
                  className={
                    climateStatus.data.latestRun.status === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : climateStatus.data.latestRun.status === 'SUCCEEDED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }
                >
                  {climateStatus.data.latestRun.status}
                </Badge>
              )}
              {climateStatus.data?.stale && (
                <Badge className='bg-amber-100 text-amber-900'>
                  Stale data
                </Badge>
              )}
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              NOAA GSOM: {climateStatus.data?.stationCount ?? 0} stations,{' '}
              {(climateStatus.data?.observationCount ?? 0).toLocaleString()}{' '}
              monthly observations
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Last 24 hours: {climateStatus.data?.operational?.queries24h ?? 0}{' '}
              queries, {climateStatus.data?.operational?.failures24h ?? 0}{' '}
              failures, {climateStatus.data?.operational?.cacheHits24h ?? 0}{' '}
              cache hits,{' '}
              {climateStatus.data?.operational?.mapFallbacks24h ?? 0} map
              fallbacks
              {climateStatus.data?.operational?.p95QueryLatencyMs != null
                ? `, p95 ${climateStatus.data.operational.p95QueryLatencyMs} ms`
                : ''}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Last successful sync:{' '}
              {climateStatus.data?.latestSuccessfulSync
                ? new Date(
                    climateStatus.data.latestSuccessfulSync
                  ).toLocaleString()
                : 'Not synchronized'}
            </p>
            {climateStatus.data?.latestRun?.error && (
              <p className='mt-2 max-w-2xl text-xs text-red-600'>
                {climateStatus.data.latestRun.error}
              </p>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            {isSuperAdminUser && (
              <>
                <label className='flex h-9 items-center gap-2 border px-3 text-xs font-medium'>
                  Rollout
                  <select
                    value={
                      settingsQuery.data?.climateRolloutStage ?? 'DISABLED'
                    }
                    disabled={
                      settingsQuery.isLoading || updateSettings.isPending
                    }
                    onChange={(event) =>
                      updateSettings.mutate(
                        {
                          climateRolloutStage: event.target.value as
                            | 'DISABLED'
                            | 'ADMIN'
                            | 'INTERNAL'
                            | 'LIMITED'
                            | 'ALL',
                        },
                        { onError: reportError }
                      )
                    }
                    className='bg-background text-xs'
                    aria-label='Climate data rollout stage'
                  >
                    <option value='DISABLED'>Disabled</option>
                    <option value='ADMIN'>Administrators</option>
                    <option value='INTERNAL'>Internal testers</option>
                    <option value='LIMITED'>Limited users</option>
                    <option value='ALL'>All users</option>
                  </select>
                </label>
                <label className='flex h-9 items-center gap-2 border px-3 text-xs font-medium'>
                  Structured data
                  <Switch
                    checked={settingsQuery.data?.climateDataEnabled ?? false}
                    disabled={
                      settingsQuery.isLoading || updateSettings.isPending
                    }
                    onCheckedChange={(checked) =>
                      updateSettings.mutate(
                        { climateDataEnabled: checked },
                        { onError: reportError }
                      )
                    }
                    aria-label='Enable structured climate data'
                  />
                </label>
                <label className='flex h-9 items-center gap-2 border px-3 text-xs font-medium'>
                  <MapPinned className='h-3.5 w-3.5' /> Maps
                  <Switch
                    checked={settingsQuery.data?.climateMapsEnabled ?? false}
                    disabled={
                      settingsQuery.isLoading || updateSettings.isPending
                    }
                    onCheckedChange={(checked) =>
                      updateSettings.mutate(
                        { climateMapsEnabled: checked },
                        { onError: reportError }
                      )
                    }
                    aria-label='Enable climate maps'
                  />
                </label>
              </>
            )}
            {isSuperAdminUser && (
              <Button
                variant='outline'
                size='sm'
                disabled={climateSyncActive}
                onClick={() => setConfirmationAction('BACKFILL')}
              >
                {syncClimate.isPending &&
                syncClimate.variables === 'BACKFILL' ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <DatabaseBackup className='mr-2 h-4 w-4' />
                )}
                Backfill
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              disabled={climateSyncActive}
              onClick={() => setConfirmationAction('INCREMENTAL')}
            >
              {syncClimate.isPending &&
              syncClimate.variables === 'INCREMENTAL' ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 h-4 w-4' />
              )}
              Sync Now
            </Button>
          </div>
        </div>
      </section>

      <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search documents...'
          className='sm:max-w-sm'
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className='h-10 rounded-md border bg-background px-3 text-sm'
        >
          <option value=''>All statuses</option>
          {(['READY', 'QUEUED', 'INDEXING', 'FAILED'] as DocumentStatus[]).map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            )
          )}
        </select>
      </div>

      <div className='mt-4 rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Chunks</TableHead>
              <TableHead>Time Taken</TableHead>
              <TableHead>Indexed</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className='h-32 text-center'>
                  <Loader2 className='mx-auto h-5 w-5 animate-spin' />
                </TableCell>
              </TableRow>
            ) : !documentsQuery.data?.documents.length ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='h-32 text-center text-muted-foreground'
                >
                  No AI documents found.
                </TableCell>
              </TableRow>
            ) : (
              documentsQuery.data.documents.map((document) => {
                const active = activeStatuses.includes(document.status)
                return (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <button
                            className='text-left font-medium hover:underline'
                            onClick={() =>
                              openAiDocument(document.id).catch(reportError)
                            }
                          >
                            {document.title}
                          </button>
                          {document.index_error && (
                            <div className='mt-1 max-w-md text-xs text-red-600'>
                              {document.index_error}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[document.status]}>
                        {document.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {document.status === 'INDEXING' ? (
                        <IndexingProgress stage={latestStage(document)} />
                      ) : ['READY', 'UPLOADED'].includes(document.status) ? (
                        <span className='text-muted-foreground'>-</span>
                      ) : (
                        <span className='capitalize'>
                          {latestStage(document)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatBytes(document.file_size)}</TableCell>
                    <TableCell>{document.chunk_count}</TableCell>
                    <TableCell>
                      {formatDuration(document.index_jobs[0])}
                    </TableCell>
                    <TableCell>
                      {document.indexed_at
                        ? new Date(document.indexed_at).toLocaleString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className='flex justify-end gap-1'>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='whitespace-nowrap'
                          title='View chunks'
                          disabled={!document.chunk_count}
                          onClick={() => {
                            setChunkTarget(document)
                            setChunkPage(1)
                            setChunkSearch('')
                          }}
                        >
                          <ListTree className='mr-2 h-4 w-4' />
                          View Chunks
                        </Button>
                        {document.status === 'FAILED' ||
                        document.status === 'DELETE_CLEANUP_FAILED' ? (
                          <Button
                            size='icon'
                            variant='ghost'
                            title='Retry'
                            disabled={retry.isPending}
                            onClick={() =>
                              runAction(
                                () => retry.mutateAsync(document.id),
                                'Retry queued'
                              )
                            }
                          >
                            <RotateCcw className='h-4 w-4' />
                          </Button>
                        ) : (
                          <Button
                            size='icon'
                            variant='ghost'
                            title='Reindex'
                            disabled={active || reindex.isPending}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Re-index "${document.title}"? This will re-process and re-embed the PDF.`
                                )
                              ) {
                                runAction(
                                  () => reindex.mutateAsync(document.id),
                                  'Reindex queued'
                                )
                              }
                            }}
                          >
                            <RefreshCw className='h-4 w-4' />
                          </Button>
                        )}
                        <Button
                          size='icon'
                          variant='ghost'
                          title='Delete'
                          disabled={active || remove.isPending}
                          onClick={() => setDeleteTarget(document)}
                        >
                          <Trash2 className='h-4 w-4 text-red-600' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(chunkTarget)}
        onOpenChange={(open) => {
          if (!open) setChunkTarget(null)
        }}
      >
        <DialogContent className='flex h-[85vh] w-[calc(100vw-2rem)] max-w-5xl flex-col overflow-hidden sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>Document chunks</DialogTitle>
            <DialogDescription>
              {chunkTarget?.title} - active version{' '}
              {chunksQuery.data?.document.version ??
                chunkTarget?.active_version}
            </DialogDescription>
          </DialogHeader>

          <Input
            value={chunkSearch}
            onChange={(event) => {
              setChunkSearch(event.target.value)
              setChunkPage(1)
            }}
            placeholder='Search extracted chunk text...'
            aria-label='Search document chunks'
          />

          <div className='min-h-0 flex-1 overflow-y-auto rounded-md border'>
            {chunksQuery.isLoading || chunksQuery.isFetching ? (
              <div className='flex h-full min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Loading chunks...
              </div>
            ) : chunksQuery.isError ? (
              <div className='flex h-full min-h-48 items-center justify-center px-6 text-center text-sm text-destructive'>
                {chunksQuery.error instanceof Error
                  ? chunksQuery.error.message
                  : 'Unable to load document chunks.'}
              </div>
            ) : !chunksQuery.data?.chunks.length ? (
              <div className='flex h-full min-h-48 items-center justify-center px-6 text-center text-sm text-muted-foreground'>
                No chunks match this search.
              </div>
            ) : (
              <ol className='divide-y'>
                {chunksQuery.data.chunks.map((chunk) => (
                  <li key={chunk.id} className='space-y-3 p-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex min-w-0 flex-wrap items-center gap-2'>
                        <Badge variant='secondary'>
                          Chunk {chunk.chunkIndex + 1}
                        </Badge>
                        <span className='text-xs text-muted-foreground'>
                          {formatChunkPages(chunk.pageStart, chunk.pageEnd)}
                        </span>
                      </div>
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        className='h-8 w-8 flex-shrink-0'
                        title='Copy chunk text'
                        aria-label={`Copy chunk ${chunk.chunkIndex + 1} text`}
                        onClick={() => {
                          navigator.clipboard
                            .writeText(chunk.text)
                            .then(
                              () => toast({ title: 'Chunk text copied' }),
                              reportError
                            )
                        }}
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                    </div>
                    <p className='max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6'>
                      {chunk.text}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground'>
            <span>
              {chunksQuery.data?.total
                ? `Showing ${(chunkPage - 1) * 25 + 1}-${Math.min(
                    chunkPage * 25,
                    chunksQuery.data.total
                  )} of ${chunksQuery.data.total}`
                : '0 chunks'}
            </span>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={chunkPage <= 1 || chunksQuery.isFetching}
                onClick={() => setChunkPage((page) => page - 1)}
              >
                <ChevronLeft className='mr-1 h-4 w-4' />
                Previous
              </Button>
              <span className='min-w-20 text-center'>
                Page {chunkPage} of {chunkPageCount}
              </span>
              <Button
                type='button'
                size='sm'
                variant='outline'
                disabled={chunkPage >= chunkPageCount || chunksQuery.isFetching}
                onClick={() => setChunkPage((page) => page + 1)}
              >
                Next
                <ChevronRight className='ml-1 h-4 w-4' />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmationAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmationAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationAction
                ? confirmationContent[confirmationAction].title
                : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction
                ? confirmationContent[confirmationAction].description
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runConfirmedAction}>
              {confirmationAction
                ? confirmationContent[confirmationAction].confirmLabel
                : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document</DialogTitle>
            <DialogDescription>
              This will permanently remove{' '}
              <span className='font-medium text-foreground'>
                "{deleteTarget?.title}"
              </span>{' '}
              from storage and the AI index. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              disabled={remove.isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              disabled={remove.isPending}
              onClick={async () => {
                if (!deleteTarget) return
                setDeleteTarget(null)
                await runAction(
                  () => remove.mutateAsync(deleteTarget.id),
                  'Document deleted'
                )
              }}
            >
              {remove.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Trash2 className='mr-2 h-4 w-4' />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open)
          if (!open && !upload.isPending) setUploadProgress(0)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload AI document</DialogTitle>
            <DialogDescription>
              The PDF will be stored on the server and indexed in the
              background.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder='Display title (optional)'
            />
            <Input
              type='file'
              accept='application/pdf,.pdf'
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files || []))
              }
            />
            {upload.isPending && (
              <div className='space-y-1'>
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span className='truncate'>
                    {files.length > 1
                      ? `Uploading ${currentFileIndex + 1} of ${files.length}: ${files[currentFileIndex]?.name}`
                      : `Uploading: ${files[0]?.name}`}
                  </span>
                  <span className='ml-2 shrink-0'>{uploadProgress}%</span>
                </div>
                <div className='h-2 overflow-hidden rounded-full bg-muted'>
                  <div
                    className='h-full bg-primary transition-all'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {files.length > 1 && (
                  <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full bg-primary/40 transition-all'
                      style={{
                        width: `${Math.round((currentFileIndex / files.length) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <p className='text-xs text-muted-foreground'>
              Maximum file size: 50 MB.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              disabled={upload.isPending}
              onClick={() => setUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!files.length || upload.isPending}
              onClick={submitUpload}
            >
              {upload.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Upload and Index
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Main>
  )
}
