import {
  IconShield,
  IconUser,
  IconUsersGroup,
  IconUserShield,
} from '@tabler/icons-react'
import { UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const userTypes = [
  {
    label: 'Superadmin',
    value: 'superadmin',
    icon: IconShield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    label: 'Content Admin',
    value: 'content_admin',
    icon: IconUserShield,
  },
  {
    label: 'Individual',
    value: 'individual',
    icon: IconUser,
  },
  {
    label: 'Organization',
    value: 'organization',
    icon: IconUsersGroup,
  },
] as const

export const userTypeOptions = [
  {
    label: 'Super Admin',
    value: 'SUPER_ADMIN',
    icon: IconShield,
  },
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: IconUserShield,
  },
  {
    label: 'Content Admin',
    value: 'CONTENT_ADMIN',
    icon: IconUserShield,
  },
  {
    label: 'Organization',
    value: 'ORGANIZATION',
    icon: IconUsersGroup,
  },
  {
    label: 'Individual',
    value: 'INDIVIDUAL',
    icon: IconUser,
  },
] as const
