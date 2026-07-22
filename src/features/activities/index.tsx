import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useGetActivities } from '@/query/activities/use-activities'
import { useGetUsers } from '@/query/users/use-users'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent } from '@/ui/shadcn/card'
import { Input } from '@/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/shadcn/table'
import { RefreshCw, FilterX, Calendar } from 'lucide-react'
import { usePagination } from '@/hooks/use-pagination'

const ACTIONS = [
  'LOGIN',
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
] as const
const ENTITIES = [
  'AUTH',
  'BLOG',
  'EVENT',
  'NEWS',
  'OPPORTUNITY',
  'PROJECT',
  'RESOURCE',
  'MEMBER',
  'CLIMATE_CHAMPION',
] as const

export default function ActivitiesFeature() {
  const paginationOptions = usePagination({ limit: 15, offset: 0 })
  const { pagination, setPage, currentPage, setLimit } = paginationOptions

  // Filter states
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedEntity, setSelectedEntity] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: pagination.limit,
    }
    if (selectedUser !== 'all') params.userId = selectedUser
    if (selectedAction !== 'all') params.action = selectedAction
    if (selectedEntity !== 'all') params.entity = selectedEntity
    if (startDate) params.startDate = new Date(startDate).toISOString()
    if (endDate) params.endDate = new Date(endDate).toISOString()
    return params
  }, [
    currentPage,
    pagination.limit,
    selectedUser,
    selectedAction,
    selectedEntity,
    startDate,
    endDate,
  ])

  // Queries
  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    refetch,
    isFetching,
  } = useGetActivities(queryParams)
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers({
    limit: 1000,
  })

  const activities = activitiesData?.data || []
  const totalCount = activitiesData?.meta?.count || 0
  const totalPages = Math.ceil(totalCount / pagination.limit) || 1

  const users = usersData?.data || []

  // Filter out individuals and organizations from list for selection
  const adminUsers = useMemo(() => {
    return users.filter((u) =>
      ['SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'].includes(u.role)
    )
  }, [users])

  const handleResetFilters = () => {
    setSelectedUser('all')
    setSelectedAction('all')
    setSelectedEntity('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  // Formatting helpers
  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'APPROVE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'REJECT':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'ADMIN':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
      case 'CONTENT_ADMIN':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Main>
      <div className='flex items-center justify-between'>
        <PageHeader
          title='Activities'
          description='Track and review administrative and content logs.'
        />
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          disabled={isLoadingActivities || isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters Card */}
      <Card className='my-6 border-dashed bg-card/50 backdrop-blur-sm'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5'>
            {/* User Filter */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>
                User
              </label>
              <Select
                value={selectedUser}
                onValueChange={(val) => {
                  setSelectedUser(val)
                  setPage(1)
                }}
                disabled={isLoadingUsers}
              >
                <SelectTrigger className='h-9 bg-background'>
                  <SelectValue placeholder='All Users' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Users</SelectItem>
                  {adminUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>
                Action
              </label>
              <Select
                value={selectedAction}
                onValueChange={(val) => {
                  setSelectedAction(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className='h-9 bg-background'>
                  <SelectValue placeholder='All Actions' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Actions</SelectItem>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Filter */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>
                Entity Type
              </label>
              <Select
                value={selectedEntity}
                onValueChange={(val) => {
                  setSelectedEntity(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className='h-9 bg-background'>
                  <SelectValue placeholder='All Entities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Entities</SelectItem>
                  {ENTITIES.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>
                Start Date
              </label>
              <div className='relative'>
                <Input
                  type='date'
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPage(1)
                  }}
                  className='h-9 pl-8 pr-3'
                />
                <Calendar className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              </div>
            </div>

            {/* End Date */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>
                End Date
              </label>
              <div className='relative'>
                <Input
                  type='date'
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPage(1)
                  }}
                  className='h-9 pl-8 pr-3'
                />
                <Calendar className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              </div>
            </div>
          </div>

          {(selectedUser !== 'all' ||
            selectedAction !== 'all' ||
            selectedEntity !== 'all' ||
            startDate ||
            endDate) && (
            <div className='mt-4 flex justify-end'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleResetFilters}
                className='h-8 text-xs text-muted-foreground hover:text-foreground'
              >
                <FilterX className='mr-2 h-4 w-4' />
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities Table */}
      {isLoadingActivities ? (
        <BoxLoader />
      ) : (
        <div className='rounded-md border bg-card'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[200px]'>User</TableHead>
                <TableHead className='w-[120px]'>Role</TableHead>
                <TableHead className='w-[100px]'>Action</TableHead>
                <TableHead className='w-[150px]'>Entity Type</TableHead>
                <TableHead>Target Title / Name</TableHead>
                <TableHead className='w-[180px] text-right'>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='h-24 text-center text-muted-foreground'
                  >
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-medium text-foreground'>
                          {log.userName}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {log.userEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={getRoleBadgeColor(log.userRole)}
                      >
                        {log.userRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                        {log.entity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.entityName ? (
                        <span className='font-medium text-foreground'>
                          {log.entityName}
                        </span>
                      ) : log.entityId ? (
                        <span className='font-mono text-xs text-muted-foreground'>
                          {log.entityId}
                        </span>
                      ) : (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right text-xs text-muted-foreground'>
                      {format(new Date(log.createdAt), 'PPP p')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Simple Pagination Footer */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between border-t p-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  Page {currentPage} of {totalPages} ({totalCount} total logs)
                </span>
                <Select
                  value={String(pagination.limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className='h-8 w-16 bg-background p-0 px-2 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='15'>15</SelectItem>
                    <SelectItem value='25'>25</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Main>
  )
}
