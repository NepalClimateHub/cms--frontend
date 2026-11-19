import type { FormStatus } from '../blog-status'
import type { AutosaveStatus } from './autosave-scheduler'

const pad = (value: number) => String(value).padStart(2, '0')

export const formatClock = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const getAutosaveStatusView = ({
  phase,
  scope,
  savedAt,
}: AutosaveStatus): FormStatus | null => {
  switch (phase) {
    case 'saving':
      return { tone: 'info', text: 'Saving…' }
    case 'saved': {
      const time = savedAt === null ? '' : ` ${formatClock(savedAt)}`
      const prefix = scope === 'local' ? 'Saved locally' : 'Saved'
      return { tone: 'info', text: `${prefix}${time}` }
    }
    case 'failed':
      return {
        tone: 'error',
        text: 'Autosave failed — retry',
        action: 'retry',
      }
    case 'conflict':
      return { tone: 'error', text: 'Conflict — autosave paused' }
    default:
      return null
  }
}
