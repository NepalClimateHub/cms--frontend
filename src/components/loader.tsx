import { Spinner } from '../ui/shadcn/spinner'

export const BoxLoader = ({ height = 'h-screen' }: { height?: string }) => {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <Spinner show={true} />
    </div>
  )
}

export const BoxLoaderWrapper = ({
  isLoading,
  children,
}: {
  isLoading: boolean
  children: React.ReactNode
}) => {
  return isLoading ? <BoxLoader height={'h-72'} /> : <>{children}</>
}

export const TableLoader = () => {
  return (
    <div className={'flex h-56 w-full items-center justify-center'}>
      <Spinner show={true} />
    </div>
  )
}

export const MiniLoader = ({
  isLoading,
  children,
}: {
  isLoading: boolean
  children: React.ReactNode
}) => {
  if (isLoading) {
    return (
      <div className={'flex h-28 items-center justify-center'}>
        <Spinner show={true} />
      </div>
    )
  }
  return <>{children}</>
}
