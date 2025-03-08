export const auth = {
  profile: {
    path: '/users/me',
    key: 'my-profile',
  },
  login: {
    path: '/auth/login',
    key: 'login',
  },
}

export const permissions = {
  getall: {
    path: '/roles/permissions/all',
    key: 'permissions',
  },
}

export const roles = {
  getall: {
    path: '/roles',
    key: 'roles'
  },
  add: {
    path: '/roles',
    key: 'add-role'
  }
}

export const organizations = {
  getall: {
    path: '/organizations',
    key: 'organizations'
  }
}