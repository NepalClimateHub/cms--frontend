import { FC, useState } from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { useGetOrganizations } from '@/query/organizations/use-organization'
import { Values } from 'nuqs'
import { cn } from '@/lib/utils'
import { FilterValues, InitFilters } from '@/hooks/use-filters'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { Spinner } from '../ui/spinner'

type OrganizationFilterProps = {
  filters: Values<InitFilters>
  filterKey: string
  setFilterValue: (key: string, value: FilterValues) => void
  removeFilter: (key: string) => void
}

const OrganizationFilter: FC<OrganizationFilterProps> = ({
  filters,
  filterKey,
  setFilterValue,
  removeFilter,
}) => {
  const [orgName, setOrgName] = useState<string>('')
  const { data, isLoading } = useGetOrganizations({
    businessName: orgName,
  })
  // @ts-expect-error - TODO: check type
  const formattedOrgData = data?.data?.map(
    (org: { businessName: string; id: string }) => ({
      label: org.businessName,
      value: org.id,
    })
  )

  const selectedValue = filters[filterKey]
  const selectedLabel = selectedValue
    ? formattedOrgData?.find(
        (org: { value: string; label: string }) => org.value === selectedValue
      )?.label
    : null

  const handleSearch = (value: string) => {
    setOrgName(value)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='mr-2 h-4 w-4' />
          {'Organizations'}
          {selectedValue && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal'
              >
                {selectedLabel}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <Input
            className='rounded-none border-none focus:outline-none focus:ring-0'
            onChange={(e) => {
              handleSearch(String(e.target.value))
            }}
            value={orgName}
            placeholder={'Search...'}
          />
          <Separator />
          <CommandList>
            {isLoading ? (
              <CommandEmpty>
                {' '}
                <Spinner size={'small'} show={true} />
              </CommandEmpty>
            ) : // @ts-expect-error - TODO: check type
            data?.meta?.count === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {formattedOrgData?.map(
                  (org: { value: string; label: string }) => {
                    const isSelected = org.value === selectedValue
                    return (
                      <CommandItem
                        key={org.label}
                        onSelect={() => {
                          if (isSelected) {
                            removeFilter(filterKey)
                          } else {
                            setFilterValue(filterKey, org.value)
                          }
                        }}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className={cn('h-4 w-4')} />
                        </div>
                        <span>{org.label}</span>
                      </CommandItem>
                    )
                  }
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default OrganizationFilter
