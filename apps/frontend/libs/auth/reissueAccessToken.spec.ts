import { afterEach, describe, expect, it, vi } from 'vitest'
import { reissueAccessToken } from './reissueAccessToken'

const accessToken =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjI5NDM3NzB9.signature'
const refreshToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjMwMjgzNzB9.signature'

const createReissueResponse = () =>
  new Response(undefined, {
    headers: {
      authorization: accessToken,
      'set-cookie': `refresh_token=${refreshToken}; Expires=Wed, 07 Aug 2024 10:59:30 GMT`
    }
  })

describe('reissueAccessToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shares one request for concurrent reissues with the same token', async () => {
    let resolveResponse: ((response: Response) => void) | undefined
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve
    })
    const fetchMock = vi.fn(() => response)
    vi.stubGlobal('fetch', fetchMock)

    const first = reissueAccessToken('same-refresh-token')
    const second = reissueAccessToken('same-refresh-token')
    resolveResponse?.(createReissueResponse())

    const [firstResult, secondResult] = await Promise.all([first, second])

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(firstResult).toEqual(secondResult)
  })
})
