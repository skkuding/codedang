/**
 * TEMPORARY DEMO-ONLY MSW handlers for the course enrollment security
 * feature (roster names + student ID verification). See
 * enrollment-demo-store.ts for why this exists and when to delete it.
 *
 * Everything not matched here (login, course list, existing whitelist
 * REST/GraphQL calls, etc.) passes through untouched to the real backend.
 */
import { graphql, http, HttpResponse } from 'msw'
import {
  MAX_ATTEMPTS,
  getRoster,
  isLocked,
  isWhitelisted,
  recordFailedAttempt,
  setRoster
} from './enrollment-demo-store'

// Lockout must be scoped to whoever is asking, not just the course — read
// the userId out of the JWT the real auth flow already attaches. No need
// to verify the signature here, this is a demo mock, not a security check.
const getUserKey = (request: Request): string => {
  const auth = request.headers.get('Authorization')
  const token = auth?.replace(/^Bearer\s+/i, '')
  const payload = token?.split('.')[1]
  if (!payload) {
    return 'anonymous'
  }
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const { userId } = JSON.parse(atob(base64)) as { userId?: number }
    return userId !== undefined ? String(userId) : 'anonymous'
  } catch {
    return 'anonymous'
  }
}

export const enrollmentDemoHandlers = [
  http.post('*/course/:groupId/join', ({ request, params }) => {
    const groupId = Number(params.groupId)
    const userKey = getUserKey(request)
    const url = new URL(request.url)
    const stage = url.searchParams.get('stage')
    const studentId = url.searchParams.get('studentId')

    if (stage !== 'manual') {
      // First (auto) attempt: only force manual verification when the
      // instructor actually configured a roster for this course.
      if (getRoster(groupId).length > 0) {
        return HttpResponse.json(
          { reason: 'WHITELIST_VIOLATION' },
          { status: 403 }
        )
      }
      return new HttpResponse(null, { status: 201 })
    }

    if (isLocked(groupId, userKey)) {
      return HttpResponse.json({ reason: 'ENROLLMENT_LOCKED' }, { status: 403 })
    }

    if (studentId && isWhitelisted(groupId, studentId)) {
      return new HttpResponse(null, { status: 201 })
    }

    const attempts = recordFailedAttempt(groupId, userKey)
    if (attempts >= MAX_ATTEMPTS) {
      return HttpResponse.json({ reason: 'ENROLLMENT_LOCKED' }, { status: 403 })
    }
    return HttpResponse.json(
      {
        reason: 'WHITELIST_VIOLATION',
        attemptsRemaining: MAX_ATTEMPTS - attempts
      },
      { status: 403 }
    )
  }),

  graphql.mutation('createWhitelist', ({ variables }) => {
    const { groupId, studentIds, names } = variables as {
      groupId: number
      studentIds: string[]
      names?: (string | null)[]
    }
    setRoster(
      groupId,
      studentIds.map((studentId, i) => ({
        studentId,
        name: names?.[i] ?? null
      }))
    )
    return HttpResponse.json({ data: { createWhitelist: studentIds.length } })
  }),

  graphql.query('getWhitelistEntries', ({ variables }) => {
    const { groupId } = variables as { groupId: number }
    return HttpResponse.json({
      data: { getWhitelistEntries: getRoster(groupId) }
    })
  })
]
