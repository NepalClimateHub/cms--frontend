import { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useLogout } from '@/query/auth/use-auth'
import { Button } from '@/ui/shadcn/button'
import { cn } from '@/ui/shadcn/lib/utils'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { adminNavItems } from '@/constants/adminMenuList'

interface AdminDashboardLayoutProps {
  children: ReactNode
  className?: string
}

export default function AdminDashboardLayout({
  children,
  className,
}: AdminDashboardLayoutProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const logout = useLogout()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: '/sign-in' })
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex h-16 items-center justify-between border-b border-gray-200 px-6'>
            <div className='flex items-center space-x-3'>
              <div className='h-8 w-8 rounded-lg bg-blue-600'></div>
              <span className='text-lg font-semibold text-gray-900'>
                NCH Admin
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSidebarOpen(false)}
              className='lg:hidden'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Navigation */}
          <nav className='flex-1 space-y-1 px-4 py-6'>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className='h-5 w-5' />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className='border-t border-gray-200 p-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-300'>
                <span className='text-sm font-medium text-gray-700'>
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-gray-900'>
                  {user?.fullName || 'Admin User'}
                </p>
                <p className='truncate text-xs text-gray-500'>
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='mt-3 w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            >
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Top Bar */}
        <header className='flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setSidebarOpen(true)}
            className='lg:hidden'
          >
            <Menu className='h-5 w-5' />
          </Button>
          <div className='flex items-center space-x-4'>
            <h1 className='text-lg font-semibold text-gray-900'>
              Admin Dashboard
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto'>
          <div className={cn('h-full', className)}>{children}</div>
        </main>
      </div>
    </div>
  )
}
