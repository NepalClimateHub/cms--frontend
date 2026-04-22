import { HeaderNotifications } from '@/features/notifications/dashboard-notifications'
import { Header } from './layouts/header'
import { Search } from './search'
import { ThemeSwitch } from './theme-switch'

const TopHeader = () => {
  return (
    <Header>
      <Search />
      <div className='ml-auto flex items-center gap-4'>
        <HeaderNotifications />
        <ThemeSwitch />
      </div>
    </Header>
  )
}

export default TopHeader
