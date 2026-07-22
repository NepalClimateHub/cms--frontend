import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useGetMembers,
  useReorderMembers,
  MemberResponseDto,
} from '@/query/members/use-members'
import { MEMBER_TEAMS, MEMBER_STATUSES } from '@/schemas/member'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import { DataTablePagination } from '@/ui/molecules/data-table/data-table-pagination'
import PageHeader from '@/ui/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import { PlusIcon, GripVertical, Users } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import MemberRowActions from './components/member-row-actions'

const MemberList = () => {
  const navigate = useNavigate()
  const paginationOptions = usePagination()
  const filterOptions = useFilters({
    search: parseAsString,
    team: parseAsString,
    status: parseAsString,
  })

  const { pagination } = paginationOptions
  const { filters, setFilterDebounce, setFilterValue } = filterOptions

  const [searchTerm, setSearchTerm] = useState((filters.search as string) ?? '')

  useEffect(() => {
    setSearchTerm((filters.search as string) ?? '')
  }, [filters.search])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilterDebounce('search', value)
  }

  const { data: membersList, isLoading } = useGetMembers({
    ...pagination,
    ...filters,
  })

  const membersData = useMemo(() => {
    return (membersList?.data ?? []) as MemberResponseDto[]
  }, [membersList?.data])
  const totalCount = membersList?.meta?.count ?? 0

  const [localMembers, setLocalMembers] = useState<MemberResponseDto[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const reorderMembersMutation = useReorderMembers()

  useEffect(() => {
    if (membersData) {
      setLocalMembers(membersData)
    }
  }, [membersData])

  const localMembersRef = useRef(localMembers)
  useEffect(() => {
    localMembersRef.current = localMembers
  }, [localMembers])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[role="button"]')
    ) {
      e.preventDefault()
      return
    }
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...localMembers]
    const [draggedItem] = updated.splice(draggedIndex, 1)
    updated.splice(index, 0, draggedItem)
    setLocalMembers(updated)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)

    const finalMembers = localMembersRef.current
    const offset = pagination.offset ?? 0
    const reorderedOrders = finalMembers.map((member, idx) => ({
      id: member.id,
      order: offset + idx,
    }))

    reorderMembersMutation.mutate(reorderedOrders)
  }

  return (
    <Main className='flex flex-col gap-4 pb-12 md:px-8'>
      <PageHeader
        title='Members'
        description='Manage NCH Team Members'
        actions={
          <Button
            onClick={() => {
              navigate({
                to: '/members/add',
              })
            }}
          >
            <PlusIcon className='mr-2 h-4 w-4' /> Add Member
          </Button>
        }
      />

      <div className='mb-2 mt-4 flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Search members...'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='h-9 w-[180px] lg:w-[280px]'
          />

          <Select
            value={(filters.team as string) ?? 'ALL'}
            onValueChange={(value) =>
              setFilterValue('team', value === 'ALL' ? null : value)
            }
          >
            <SelectTrigger className='h-9 w-[160px]'>
              <SelectValue placeholder='Team' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Teams</SelectItem>
              {MEMBER_TEAMS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(filters.status as string) ?? 'ALL'}
            onValueChange={(value) =>
              setFilterValue('status', value === 'ALL' ? null : value)
            }
          >
            <SelectTrigger className='h-9 w-[160px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Statuses</SelectItem>
              {MEMBER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto py-2'>
        {isLoading ? (
          <BoxLoader />
        ) : localMembers.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {localMembers.map((member, index) => (
              <div
                key={member.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group flex cursor-grab items-center gap-4 rounded-xl border border-border/50 bg-card/45 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:border-primary/45 hover:shadow-md active:cursor-grabbing ${
                  draggedIndex === index
                    ? 'scale-[0.99] border-dashed border-primary bg-accent/20 opacity-30'
                    : ''
                }`}
              >
                {/* Drag Handle */}
                <div className='flex-shrink-0 text-muted-foreground/40 transition-colors duration-200 group-hover:text-muted-foreground'>
                  <GripVertical className='h-4 w-4' />
                </div>

                <div className='flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4'>
                  {/* Left Section: Avatar, Name, Role, Email */}
                  <div className='flex min-w-0 items-center gap-3 md:w-1/3'>
                    <Avatar className='h-12 w-12 flex-shrink-0 border border-border/60 bg-muted shadow-inner transition-transform duration-300 group-hover:scale-105'>
                      {member.photoUrl ? (
                        <AvatarImage
                          src={member.photoUrl}
                          alt={member.name}
                          className='object-cover'
                        />
                      ) : null}
                      <AvatarFallback className='bg-primary/5 text-sm font-bold text-primary'>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-baseline gap-1.5'>
                        <h3 className='truncate text-sm font-bold text-foreground transition-colors duration-200 group-hover:text-primary'>
                          {member.name}
                        </h3>
                        <span className='truncate text-xs font-medium text-muted-foreground'>
                          ({member.role})
                        </span>
                      </div>
                      <p className='mt-0.5 truncate text-xs text-muted-foreground/85'>
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Middle Section: Badges & Bio snippet */}
                  <div className='flex min-w-0 flex-wrap items-center gap-4 md:flex-1 md:justify-between'>
                    {/* Badges */}
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='border-border/80 px-2 py-0 text-[10px] font-normal'
                      >
                        {member.team}
                      </Badge>
                      <Badge
                        variant='secondary'
                        className='px-2 py-0 text-[10px] font-normal'
                      >
                        {member.status}
                      </Badge>
                      <Badge
                        variant={member.isActive ? 'default' : 'destructive'}
                        className={
                          member.isActive
                            ? 'border-green-500/20 bg-green-500/10 text-[10px] font-normal text-green-500 hover:bg-green-500/20'
                            : 'text-[10px] font-normal'
                        }
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Right Section: Actions */}
                  <div className='mt-2 flex flex-shrink-0 items-center justify-end md:mt-0 md:w-auto'>
                    <MemberRowActions member={member} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20'>
            <Users className='h-10 w-10 text-muted-foreground/60' />
            <div className='text-sm font-medium text-muted-foreground'>
              No members found.
            </div>
          </div>
        )}
      </div>

      <div className='mt-4'>
        <DataTablePagination
          totalCount={totalCount}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}

export default MemberList
