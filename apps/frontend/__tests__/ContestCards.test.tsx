// __tests__/ContestCards.test.tsx
import ContestCards from '@/app/(main)/_components/ContestCards'
import { fetcher } from '@/lib/utils'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { test, expect } from 'vitest'

// Mocking the fetcher.get function
vi.mock('@/lib/utils', () => ({
  fetcher: {
    get: vi.fn()
  }
}))

test('ContestCards renders the contests correctly', async () => {
  // Mock the ongoing-upcoming contests fetch

  fetcher.get = {
    ...fetcher.get,
    json: vi.fn((url) => {
      if (url === 'contest/ongoing-upcoming') {
        return new Promise({
          json: async () => ({
            ongoing: [
              {
                id: 10,
                title: 'Ongoing Contest',
                startTime: '2024-08-12T15:00:00.000Z',
                endTime: '2024-08-13T13:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Open Space'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 0
              },
              {
                id: 11,
                title: 'Ongoing Contest',
                startTime: '2024-08-12T15:00:00.000Z',
                endTime: '2024-08-13T15:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Open Space'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 1
              },
              {
                id: 12,
                title: 'Ongoing Contest',
                startTime: '2024-08-12T15:00:00.000Z',
                endTime: '2024-08-13T15:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Open Space'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 1
              }
            ],
            upcoming: [
              {
                id: 9,
                title: 'Upcoming Contest',
                startTime: '2024-08-13T15:00:00.000Z',
                endTime: '2024-08-14T15:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Open Space'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 0
              },
              {
                id: 13,
                title: 'upcoming contest',
                startTime: '2024-08-30T15:00:00.000Z',
                endTime: '2024-09-03T15:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Open Space'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 0
              },
              {
                id: 14,
                title: 'upcoming contest',
                startTime: '2024-09-04T15:00:00.000Z',
                endTime: '2024-09-05T15:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Open Space'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 0
              }
            ]
          })
        })
      }

      if (url === 'contest/finished') {
        return new Promise({
          json: async () => ({
            data: [
              {
                id: 26,
                title: 'contest 만들기 테스트',
                startTime: '2024-08-06T15:00:00.000Z',
                endTime: '2024-08-10T15:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Example Group'
                },
                invitationCode: '123454',
                enableCopyPaste: true,
                participants: 1,
                isRegistered: false
              },
              {
                id: 29,
                title: '곧 끝날 Contest',
                startTime: '2024-08-08T06:00:00.000Z',
                endTime: '2024-08-08T15:34:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Example Group'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 1,
                isRegistered: false
              },
              {
                id: 28,
                title: '곧 시작할 Contest',
                startTime: '2024-08-08T13:00:00.000Z',
                endTime: '2024-08-08T14:00:00.000Z',
                group: {
                  id: 1,
                  groupName: 'Example Group'
                },
                invitationCode: null,
                enableCopyPaste: true,
                participants: 0,
                isRegistered: false
              }
            ],
            total: 9
          })
        })
      }
    })
  }

  render(<ContestCards />)

  // Assert that the contests are rendered
  expect(await screen.findByText('Ongoing Contest')).toBeInTheDocument()
  expect(await screen.findByText('Upcoming Contest')).toBeInTheDocument()
  expect(await screen.findByText('contest 만들기 테스트')).toBeInTheDocument()
})
