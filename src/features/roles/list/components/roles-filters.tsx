import OrganizationFilter from "@/components/filters/organization-filter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFilters } from "@/hooks/use-filters"
import { useIsFirstRender } from "@/hooks/use-first-render"
import { useAuthStore } from "@/stores/authStore"
import { cleanObj } from "@/utils/obj-utils"
import { Cross2Icon } from "@radix-ui/react-icons"
import { FC, useEffect, useState } from "react"

type RoleFiltersProps = {
    setPage: (page: number | string) => void
    filterOptions: ReturnType<typeof useFilters>
}

const RoleFilters: FC<RoleFiltersProps> = ({
    setPage,
    filterOptions
}) => {
    const { user } = useAuthStore();
    const isFirstRender = useIsFirstRender()
    const [search, setSearch] = useState<string>('')

    const isSuperAdmin = user?.isSuperAdmin!;

    const {
        filters,
        setFilterValue,
        setFilterDebounce,
        removeFilter,
        resetFilters
    } = filterOptions;

    const isFilterApplied = !!(Object.keys(cleanObj(filters)).length);

    useEffect(() => {
        if (!isFirstRender) {
            setPage(1);
        }
    }, [filters]);


    useEffect(() => {
        setSearch((filters?.name as string) ?? '');
    }, [filters]);

    const handleSearch = (value: string) => {
        setSearch(value);
        if (value) {
            setFilterDebounce('name', value);
        } else {
            removeFilter('name');
        }
    };

    return (
        <div className='flex items-center justify-between'>
            <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                <Input
                    placeholder='Search roles...'
                    value={search}
                    onChange={(event) =>
                        handleSearch(event.target.value)
                    }
                    className='h-8 w-[150px] lg:w-[250px]'
                />
                {
                    isSuperAdmin && (
                        <OrganizationFilter
                            filters={filters}
                            filterKey={'organizationId'}
                            setFilterValue={setFilterValue}
                            removeFilter={removeFilter}
                        />
                    )
                }
                {
                    isFilterApplied && (
                        <Button
                            variant='ghost'
                            onClick={resetFilters}
                            className='h-8 px-2 lg:px-3'
                        >
                            Reset
                            <Cross2Icon className='ml-2 h-4 w-4' />
                        </Button>
                    )
                }
            </div>
        </div>
    )
}

export default RoleFilters