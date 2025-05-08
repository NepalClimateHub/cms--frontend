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
    path: '/api/v1/tags',
    key: 'alltags',
  },
  add: {
    path: '/api/v1/tags',
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
  getbyid: {
    path: '/api/v1/events',
    key: 'get-event-by-id',
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

export const organizations = {
  getall: {
    path: '/api/v1/organizations',
    key: 'all-organizations',
  },
  add: {
    path: '/api/v1/organizations',
    key: 'organizations',
  },
  update: {
    path: '/api/v1/organizations',
    key: 'update-organizations',
  },
  delete: {
    path: '/api/v1/organizations',
    key: 'delete-organizations',
  },
}