import { Header } from '../ui/layouts/header'
import { ProfileDropdown } from './profile-dropdown'
import { Search } from './search'
import { ThemeSwitch } from './theme-switch'

const TopHeader = () => {
  return (
    <Header>
      <Search />
      <div className='ml-auto flex items-center gap-4'>
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </Header>
  )
}

export default TopHeader
