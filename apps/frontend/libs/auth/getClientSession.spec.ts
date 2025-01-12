import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClientSession } from './getClientSession'

describe('getClientSession', () => {
  const auth = getClientSession()

  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return session and return same session when called again with in expiry time', async () => {
    const firstSession = await auth()
    expect(firstSession).toBeDefined()

    setTimeout(async () => {
      expect(await auth()).toBe(firstSession)
    }, 500)

    vi.runAllTimers()
  })

  it('should return diff session when called after expiry time', async () => {
    const firstSession = await auth()

    setTimeout(async () => {
      expect(await auth()).not.toBe(firstSession)
    }, 1100)

    vi.runAllTimers()
  })

  it('should return diff session when called getClientSession again', async () => {
    const diffAuth = getClientSession()

    expect(await auth()).not.toBe(await diffAuth())
  })
})
