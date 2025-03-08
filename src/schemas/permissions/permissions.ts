export type Permission = {
  id: string
  action: string
  description: string
}

export type PermissionModule = {
  id: string
  key: string
  name: string
  description: string
  permissions: Permission[]
}
