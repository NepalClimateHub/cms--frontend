import React, { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { emailSubscriptionControllerFindAll } from '@/api'

export const Route = createFileRoute('/_authenticated/subscribed-emails/')({
  component: SubscribedEmailsPage,
})

export default function SubscribedEmailsPage() {
  return (
    <div className='p-6'>
      <h1 className='mb-4 text-xl font-semibold'>Subscribed Emails</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscribedEmailsList />
      </Suspense>
    </div>
  )
}

function SubscribedEmailsList() {
  const [emails, setEmails] = React.useState<
    Array<{ id?: string; email?: string }>
  >([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    emailSubscriptionControllerFindAll()
      .then((res) => {
        const data =
          res &&
          typeof res === 'object' &&
          'data' in res &&
          Array.isArray((res as unknown as { data: unknown }).data)
            ? (res as { data: Array<{ id?: string; email?: string }> }).data
            : []
        setEmails(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load emails')
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className='text-red-500'>{error}</div>
  if (!emails.length) return <div>No subscribed emails found.</div>

  return (
    <div className='overflow-x-auto rounded-lg border bg-background p-4 shadow'>
      <table className='min-w-full text-sm'>
        <thead>
          <tr className='border-b'>
            <th className='px-4 py-2 text-left font-medium'>Email</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((item, idx) => (
            <tr key={item.id || idx} className='border-b last:border-0'>
              <td className='px-4 py-2'>{item.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
