import { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { NavCollapsible, NavItem, NavLink, type NavGroup } from './types'

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar()
  const href = useLocation({ select: (location) => location.href })
  return (
    <SidebarGroup className='space-y-1'>
      <SidebarGroupLabel className='px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
        {title}
      </SidebarGroupLabel>
      <SidebarMenu className='space-y-1'>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />

          if (state === 'collapsed')
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
            )

          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20'>
    {children}
  </Badge>
)

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'h-10 rounded-md px-4 transition-all duration-200 hover:bg-accent/50',
          isActive && 'bg-accent font-medium text-accent-foreground shadow-sm'
        )}
      >
        <Link
          to={item.url}
          onClick={() => setOpenMobile(false)}
          className='flex items-center gap-3'
        >
          {item.icon && <item.icon className='h-5 w-5 shrink-0' />}
          <span className='truncate text-sm'>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item, true)

  return (
    <Collapsible asChild defaultOpen={isActive} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={cn(
              'h-10 rounded-md px-4 transition-all duration-200 hover:bg-accent/50',
              isActive &&
                'bg-accent font-medium text-accent-foreground shadow-sm'
            )}
          >
            <div className='flex items-center gap-3'>
              {item.icon && <item.icon className='h-5 w-5 shrink-0' />}
              <span className='truncate text-sm'>{item.title}</span>
              {item.badge && <NavBadge>{item.badge}</NavBadge>}
            </div>
            <ChevronRight className='ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub className='mt-1 space-y-1'>
            {item.items.map((subItem) => {
              const isSubActive = checkIsActive(href, subItem)
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={cn(
                      'h-9 rounded-md px-4 transition-all duration-200 hover:bg-accent/50',
                      isSubActive &&
                        'bg-accent font-medium text-accent-foreground shadow-sm'
                    )}
                  >
                    <Link
                      to={subItem.url}
                      onClick={() => setOpenMobile(false)}
                      className='flex items-center gap-3'
                    >
                      {subItem.icon && (
                        <subItem.icon className='h-4 w-4 shrink-0' />
                      )}
                      <span className='truncate text-sm'>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={cn(
              'h-10 rounded-md px-4 transition-all duration-200 hover:bg-accent/50',
              isActive &&
                'bg-accent font-medium text-accent-foreground shadow-sm'
            )}
          >
            <div className='flex items-center gap-3'>
              {item.icon && <item.icon className='h-5 w-5 shrink-0' />}
              <span className='truncate text-sm'>{item.title}</span>
              {item.badge && <NavBadge>{item.badge}</NavBadge>}
            </div>
            <ChevronRight className='ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side='right'
          align='start'
          sideOffset={4}
          className='w-64'
        >
          <DropdownMenuLabel className='px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const isSubActive = checkIsActive(href, sub)
            return (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                asChild
                className={cn(
                  'h-9 cursor-pointer transition-colors hover:bg-accent/50',
                  isSubActive && 'bg-accent font-medium text-accent-foreground'
                )}
              >
                <Link to={sub.url} className='flex items-center gap-3 px-4'>
                  {sub.icon && <sub.icon className='h-4 w-4 shrink-0' />}
                  <span className='max-w-52 text-wrap text-sm'>
                    {sub.title}
                  </span>
                  {sub.badge && <NavBadge>{sub.badge}</NavBadge>}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url || // /endpint?search=param
    href.split('?')[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}
