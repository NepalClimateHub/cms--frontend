import { useMemo } from 'react'
import { useGetUsers } from '@/query/users/use-users'
import { Header } from '@/ui/layouts/header'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import { Search } from '@/ui/search'
import { TooltipProvider } from '@/ui/shadcn/tooltip'
import { ThemeSwitch } from '@/ui/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { mapUserOutputToUser } from './utils/mapping'

export default function Users() {
  const { data, isLoading, error } = useGetUsers()

  // Map API data to table schema
  const userList = useMemo(() => {
    if (!data?.data) return []
    return data.data.map(mapUserOutputToUser)
  }, [data])

  if (isLoading) {
    return (
      <UsersProvider>
        <Main>
          <BoxLoader />
        </Main>
      </UsersProvider>
    )
  }

  if (error) {
    return (
      <UsersProvider>
        <Main>
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Error loading users
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                Failed to load users. Please try again later.
              </p>
            </div>
          </div>
        </Main>
      </UsersProvider>
    )
  }

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <TooltipProvider delayDuration={300}>
            <UsersTable data={userList} columns={columns} />
          </TooltipProvider>
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
