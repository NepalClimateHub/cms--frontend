import { Header } from './layout/header'
import { Search } from './search'
import { ThemeSwitch } from './theme-switch'
import { ProfileDropdown } from './profile-dropdown'

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