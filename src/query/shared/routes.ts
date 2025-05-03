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

export const tags = {
  getall: {
    path: '/tags',
    key: 'alltags',
  },
  add: {
    path: '/tags',
    key: 'tags',
  },
}

export const imagekit = {
  getauthparams: {
    path: '/imagekit',
    key: 'authparams',
  },
}

export const events = {
  getall: {
    path: '/api/v1/events',
    key: 'alltags',
  },
  add: {
    path: '/api/v1/events',
    key: 'events',
  },
  update: {
    path: '/api/v1/events',
    key: 'update-events',
  },
  delete: {
    path: '/api/v1/events',
    key: 'delete-events',
  },
}
