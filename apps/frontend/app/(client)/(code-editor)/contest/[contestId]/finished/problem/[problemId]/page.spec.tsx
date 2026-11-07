// @vitest-environment node
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'
import { redirect } from 'next/navigation'
import { Children } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ContestFinishedPage from './page'

vi.mock('@/app/(client)/(code-editor)/_components/EditorSkeleton', () => ({
  EditorSkeleton: () => null
}))

vi.mock('@/app/(client)/(code-editor)/_components/FinishedNoticePanel', () => ({
  FinishedNoticePanel: () => null
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect: ${url}`)
  })
}))

describe('ContestFinishedPage', () => {
  const props = {
    params: Promise.resolve({ contestId: '17', problemId: '1' })
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-17T12:00:00.000Z'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    { status: 'upcoming', startTime: '2026-09-17T13:00:00.000Z' },
    { status: 'ongoing', startTime: '2026-09-17T11:00:00.000Z' }
  ])(
    'redirects $status contests to the problem list',
    async ({ startTime }) => {
      server.use(
        http.get('https://test.com/api/contest/17', () =>
          HttpResponse.json({
            startTime,
            endTime: '2026-09-17T14:00:00.000Z'
          })
        )
      )

      await expect(ContestFinishedPage(props)).rejects.toThrow(
        'Redirect: /contest/17/problem'
      )
      expect(redirect).toHaveBeenCalledWith('/contest/17/problem')
    }
  )

  it('keeps the finished notice for a finished contest', async () => {
    server.use(
      http.get('https://test.com/api/contest/17', () =>
        HttpResponse.json({
          startTime: '2026-09-17T10:00:00.000Z',
          endTime: '2026-09-17T11:00:00.000Z'
        })
      )
    )

    const page = await ContestFinishedPage(props)

    expect(redirect).not.toHaveBeenCalled()
    expect(Children.toArray(page.props.children)).toContainEqual(
      expect.objectContaining({
        type: FinishedNoticePanel,
        props: { target: 'contest', contestId: '17', problemId: '1' }
      })
    )
  })
})
