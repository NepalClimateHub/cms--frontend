import { FC, JSX } from 'react'
import { ArrowLeft } from 'lucide-react'
import useGoBack from '@/hooks/use-goback'
import { Button } from '../ui/shadcn/button'

type PageHeaderProps = {
  title: string
  description?: string
  showBackButton?: boolean
  actions?: JSX.Element
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  showBackButton = false,
}) => {
  const goBack = useGoBack()
  return (
    <div>
      <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
        <div className='flex items-center justify-start gap-2'>
          {showBackButton && (
            <Button variant={'ghost'} onClick={goBack}>
              <ArrowLeft />
            </Button>
          )}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
            {description && (
              <p className='text-muted-foreground'>{description}</p>
            )}
          </div>
        </div>
        <div>{actions}</div>
      </div>
    </div>
  )
}

export default PageHeader
