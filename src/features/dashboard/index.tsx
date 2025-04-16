import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import Analytics from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

export default function Dashboard() {
  return (
    <>
      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex flex-col items-start justify-start space-y-10 p-5'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <Analytics />
        </div>
      </Main>
    </>
  )
}
