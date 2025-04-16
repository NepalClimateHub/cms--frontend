import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'

const ListOpportunity = () => {
  const navigate = useNavigate()
  return (
    <Main>
      <div className='mb-2 flex items-center justify-between space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>Opportunities</h1>
        <div className='flex items-center space-x-2'>
          <Button
            onClick={() => {
              navigate({
                to: '/opportunities/add',
              })
            }}
          >
            {' '}
            <PlusIcon /> Add Opportunity
          </Button>
        </div>
      </div>
    </Main>
  )
}

export default ListOpportunity
