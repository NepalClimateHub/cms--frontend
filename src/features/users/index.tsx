import { useMemo } from 'react'
import { useGetUsers } from '@/query/users/use-users'
import { Header } from '@/ui/layouts/header'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import { Search } from '@/ui/search'
import { TooltipProvider } from '@/ui/shadcn/tooltip'
import { ThemeSwitch } from '@/ui/theme-switch'
import { UserOutput } from '@/api/types.gen'
import { nullableString } from '@/utils/map-user-output'
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

  // Map status based on isEmailVerified
  const status = user.isEmailVerified ? 'active' : 'inactive'

  let role: User['role']
  if (user.role === 'SUPER_ADMIN') {
    role = 'superadmin'
  } else if (user.role === 'CONTENT_ADMIN') {
    role = 'content_admin'
  } else if (user.role === 'ADMIN') {
    role = 'admin'
  } else if (user.role === 'ORGANIZATION') {
    role = 'organization'
  } else {
    role = 'individual'
  }

  const org = user.organization
  const organization = org
    ? {
        id: org.id,
        name: org.name,
        logoImageUrl:
          typeof org.logoImageUrl === 'string' ? org.logoImageUrl : null,
        logoImageId:
          typeof org.logoImageId === 'string' ? org.logoImageId : null,
        verificationDocumentUrl:
          typeof org.verificationDocumentUrl === 'string'
            ? org.verificationDocumentUrl
            : org.verificationDocumentUrl
              ? String(org.verificationDocumentUrl)
              : null,
        verificationDocumentId:
          typeof org.verificationDocumentId === 'string'
            ? org.verificationDocumentId
            : org.verificationDocumentId
              ? String(org.verificationDocumentId)
              : null,
        verificationRequestRemarks:
          typeof org.verificationRequestRemarks === 'string'
            ? org.verificationRequestRemarks
            : org.verificationRequestRemarks != null
              ? String(org.verificationRequestRemarks)
              : null,
        verificationRequestedAt:
          typeof org.verificationRequestedAt === 'string'
            ? org.verificationRequestedAt
            : org.verificationRequestedAt
              ? String(org.verificationRequestedAt)
              : null,
      }
    : null

  return {
    id: user.id,
    firstName,
    lastName,
    username,
    email: user.email,
    phoneNumber,
    status: status as 'active' | 'inactive' | 'invited' | 'suspended',
    role,
    serverRole: user.role,
    isVerifiedByAdmin: user.isVerifiedByAdmin,
    profilePhotoUrl: nullableString(user.profilePhotoUrl),
    bannerImageUrl: nullableString(user.bannerImageUrl),
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    organization,
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
          <TooltipProvider delayDuration={300}>
            <UsersTable data={userList} columns={columns} />
          </TooltipProvider>
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
