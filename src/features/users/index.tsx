import { useMemo } from 'react'
import { useGetUsers } from '@/query/users/use-users'
import { Header } from '@/ui/layouts/header'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import { Search } from '@/ui/search'
import { ThemeSwitch } from '@/ui/theme-switch'
import { UserOutput } from '@/api/types.gen'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { User } from './data/schema'

// Map API UserOutput to table User schema
const mapUserOutputToUser = (user: UserOutput): User => {
  const nameParts = user.fullName.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  const username =
    user.email.split('@')[0] || user.fullName.toLowerCase().replace(/\s+/g, '')

  // Map phoneNumber object to string
  let phoneNumber = ''
  if (user.phoneNumber) {
    if (typeof user.phoneNumber === 'string') {
      phoneNumber = user.phoneNumber
    } else if (
      typeof user.phoneNumber === 'object' &&
      user.phoneNumber !== null
    ) {
      // Handle object case - try common property names
      phoneNumber = String(
        (
          user.phoneNumber as {
            value?: string
            number?: string
            phone?: string
          }
        ).value ||
          (
            user.phoneNumber as {
              value?: string
              number?: string
              phone?: string
            }
          ).number ||
          (
            user.phoneNumber as {
              value?: string
              number?: string
              phone?: string
            }
          ).phone ||
          ''
      )
    }
  }

  // Map status based on isAccountVerified
  const status = user.isAccountVerified ? 'active' : 'inactive'

  // Map role based on isSuperAdmin and userType (keep for backward compatibility)
  let role: 'superadmin' | 'admin' | 'cashier' | 'manager' = 'admin'
  if (user.isSuperAdmin) {
    role = 'superadmin'
  } else if (user.userType === 'ADMIN') {
    role = 'admin'
  } else if (user.userType === 'ORGANIZATION') {
    role = 'manager'
  } else {
    role = 'cashier'
  }

  return {
    id: user.id,
    firstName,
    lastName,
    username,
    email: user.email,
    phoneNumber,
    status: status as 'active' | 'inactive' | 'invited' | 'suspended',
    role,
    userType: user.userType,
    isSuperAdmin: user.isSuperAdmin,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }
}

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
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
