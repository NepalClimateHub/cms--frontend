import { useMemo, useState } from 'react'
import {
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  AiDocument,
  DocumentStatus,
  openAiDocument,
  useAiDocuments,
  useAiDocumentSummary,
  useDeleteAiDocument,
  useRebuildAiIndex,
  useReindexAiDocument,
  useRetryAiDocument,
  useUploadAiDocument,
} from '@/query/ask-ai/document-management'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/shadcn/table'

const activeStatuses: DocumentStatus[] = ['QUEUED', 'INDEXING', 'DELETE_QUEUED', 'DELETING']


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
        <div className='h-full bg-blue-500 transition-all duration-500' style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AiDocumentManagement() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<AiDocument | null>(null)
  const documentsQuery = useAiDocuments(search, status)
  const summaryQuery = useAiDocumentSummary()
  const upload = useUploadAiDocument()
  const reindex = useReindexAiDocument()
  const retry = useRetryAiDocument()
  const remove = useDeleteAiDocument()
  const rebuild = useRebuildAiIndex()

  const counts = useMemo(
    () => Object.fromEntries((summaryQuery.data?.documents || []).map((item) => [item.status, item._count])),
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
        await upload.mutateAsync({ file: files[i], title: files.length === 1 ? title : '', onProgress: setUploadProgress })
      }
      setUploadOpen(false)
      setFiles([])
      setTitle('')
      setUploadProgress(0)
      setCurrentFileIndex(0)
      toast({ title: 'Upload accepted', description: `${files.length} file(s) queued for indexing.` })
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

  return (
    <Main>
      <PageHeader
        title='AI Documents'
        description='Manage the PDFs used by the NCH Climate Assistant.'
        actions={
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={rebuild.isPending}
              onClick={() => {
                if (window.confirm('Rebuild the complete AI index from all ready PDFs?')) {
                  runAction(() => rebuild.mutateAsync(), 'Full rebuild queued')
                }
              }}
            >
              {rebuild.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <RefreshCw className='mr-2 h-4 w-4' />}
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
          <CardHeader className='pb-2'><CardTitle className='text-sm font-medium'>Ready documents</CardTitle></CardHeader>
          <CardContent className='text-2xl font-bold'>{counts.READY || 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'><CardTitle className='text-sm font-medium'>Processing/Indexing</CardTitle></CardHeader>
          <CardContent className='text-2xl font-bold'>
            {activeStatuses.reduce((total, item) => total + (counts[item] || 0), 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'><CardTitle className='text-sm font-medium'>Indexed chunks</CardTitle></CardHeader>
          <CardContent className='text-2xl font-bold'>{summaryQuery.data?.totalChunks || 0}</CardContent>
        </Card>
      </div>

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
          {(['READY', 'QUEUED', 'INDEXING', 'FAILED'] as DocumentStatus[]).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
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
              <TableRow><TableCell colSpan={8} className='h-32 text-center'><Loader2 className='mx-auto h-5 w-5 animate-spin' /></TableCell></TableRow>
            ) : !documentsQuery.data?.documents.length ? (
              <TableRow><TableCell colSpan={8} className='h-32 text-center text-muted-foreground'>No AI documents found.</TableCell></TableRow>
            ) : documentsQuery.data.documents.map((document) => {
              const active = activeStatuses.includes(document.status)
              return (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <button
                          className='font-medium hover:underline text-left'
                          onClick={() => openAiDocument(document.id).catch(reportError)}
                        >
                          {document.title}
                        </button>
                        {document.index_error && <div className='mt-1 max-w-md text-xs text-red-600'>{document.index_error}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={statusStyles[document.status]}>{document.status.replace(/_/g, ' ')}</Badge></TableCell>
                  <TableCell>
                    {document.status === 'INDEXING' ? (
                      <IndexingProgress stage={latestStage(document)} />
                    ) : ['READY', 'UPLOADED'].includes(document.status) ? (
                      <span className='text-muted-foreground'>-</span>
                    ) : (
                      <span className='capitalize'>{latestStage(document)}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatBytes(document.file_size)}</TableCell>
                  <TableCell>{document.chunk_count}</TableCell>
                  <TableCell>{formatDuration(document.index_jobs[0])}</TableCell>
                  <TableCell>{document.indexed_at ? new Date(document.indexed_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <div className='flex justify-end gap-1'>
                      {document.status === 'FAILED' || document.status === 'DELETE_CLEANUP_FAILED' ? (
                        <Button size='icon' variant='ghost' title='Retry' disabled={retry.isPending} onClick={() => runAction(() => retry.mutateAsync(document.id), 'Retry queued')}>
                          <RotateCcw className='h-4 w-4' />
                        </Button>
                      ) : (
                        <Button size='icon' variant='ghost' title='Reindex' disabled={active || reindex.isPending} onClick={() => {
                          if (window.confirm(`Re-index "${document.title}"? This will re-process and re-embed the PDF.`)) {
                            runAction(() => reindex.mutateAsync(document.id), 'Reindex queued')
                          }
                        }}>
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
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document</DialogTitle>
            <DialogDescription>
              This will permanently remove <span className='font-medium text-foreground'>"{deleteTarget?.title}"</span> from storage and the AI index. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' disabled={remove.isPending} onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant='destructive'
              disabled={remove.isPending}
              onClick={async () => {
                if (!deleteTarget) return
                setDeleteTarget(null)
                await runAction(() => remove.mutateAsync(deleteTarget.id), 'Document deleted')
              }}
            >
              {remove.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Trash2 className='mr-2 h-4 w-4' />}
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
            <DialogDescription>The PDF will be stored on the server and indexed in the background.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Display title (optional)' />
            <Input type='file' accept='application/pdf,.pdf' multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
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
                  <div className='h-full bg-primary transition-all' style={{ width: `${uploadProgress}%` }} />
                </div>
                {files.length > 1 && (
                  <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full bg-primary/40 transition-all'
                      style={{ width: `${Math.round((currentFileIndex / files.length) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}
            <p className='text-xs text-muted-foreground'>Maximum file size: 50 MB.</p>
          </div>
          <DialogFooter>
            <Button variant='outline' disabled={upload.isPending} onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button disabled={!files.length || upload.isPending} onClick={submitUpload}>
              {upload.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Upload and Index
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Main>
  )
}
