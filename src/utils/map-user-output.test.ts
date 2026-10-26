import { describe, expect, it } from 'vitest'
import { mapOrganizationProfileDto } from './map-user-output'

describe('mapOrganizationProfileDto', () => {
  it('retains only valid persisted verification messages', () => {
    const organization = mapOrganizationProfileDto({
      id: 'org-1',
      name: 'Example organization',
      description: '',
      logoImageUrl: '',
      verificationMessages: [
        { id: 'org-message', senderType: 'ORGANIZATION', message: 'First', createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'admin-message', senderType: 'ADMIN', senderUserId: 'admin-1', message: 'Please update this', createdAt: '2026-01-02T00:00:00.000Z' },
        { id: 'invalid', senderType: 'UNKNOWN', message: 'Ignored', createdAt: '2026-01-03T00:00:00.000Z' },
      ],
    } as never)

    expect(organization?.verificationMessages).toEqual([
      { id: 'org-message', senderType: 'ORGANIZATION', message: 'First', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'admin-message', senderType: 'ADMIN', senderUserId: 'admin-1', message: 'Please update this', createdAt: '2026-01-02T00:00:00.000Z' },
    ])
  })
})
