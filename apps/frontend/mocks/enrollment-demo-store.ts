/**
 * TEMPORARY DEMO-ONLY mock state for the course enrollment security feature
 * (roster names + student ID verification). The real backend contract
 * (GroupWhitelist.name, getWhitelistEntries, createWhitelist(names), and
 * the join endpoint's stage/WHITELIST_VIOLATION/ENROLLMENT_LOCKED
 * response shape) isn't implemented yet — see mock-schema.graphql.
 *
 * Backed by localStorage (not just an in-memory Map) because switching
 * between instructor and student accounts to demo the flow means a full
 * page reload/login in between, which would otherwise wipe the roster.
 *
 * DELETE this whole `mocks/enrollment-demo-*` set + `instrumentation-client.ts`
 * once the backend ships and the frontend is reconnected for real.
 */

export interface RosterEntry {
  studentId: string
  name: string | null
}

interface Persisted {
  roster: Record<number, RosterEntry[]>
  // keyed by `${groupId}:${userKey}` — lockout is per user, not per course,
  // otherwise one user's failed attempts would lock out everyone else too.
  attempts: Record<string, number>
}

const STORAGE_KEY = 'enrollment-demo-store'

const attemptsKey = (groupId: number, userKey: string) =>
  `${groupId}:${userKey}`

export const MAX_ATTEMPTS = 3

const load = (): Persisted => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as Persisted
    }
  } catch {
    // ignore corrupt/missing storage, fall through to a fresh store
  }
  return { roster: {}, attempts: {} }
}

const save = (data: Persisted) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const getRoster = (groupId: number): RosterEntry[] =>
  load().roster[groupId] ?? []

export const setRoster = (groupId: number, entries: RosterEntry[]) => {
  const data = load()
  data.roster[groupId] = entries
  const prefix = `${groupId}:`
  for (const key of Object.keys(data.attempts)) {
    if (key.startsWith(prefix)) {
      delete data.attempts[key]
    }
  }
  save(data)
}

export const isWhitelisted = (groupId: number, studentId: string) => {
  const roster = getRoster(groupId)
  if (roster.length === 0) {
    // No roster configured for this course: mirrors the real backend's
    // `whitelistExists` check, which lets anyone join freely.
    return true
  }
  return roster.some((entry) => entry.studentId === studentId)
}

export const recordFailedAttempt = (groupId: number, userKey: string) => {
  const data = load()
  const key = attemptsKey(groupId, userKey)
  const next = (data.attempts[key] ?? 0) + 1
  data.attempts[key] = next
  save(data)
  return next
}

export const isLocked = (groupId: number, userKey: string) =>
  (load().attempts[attemptsKey(groupId, userKey)] ?? 0) >= MAX_ATTEMPTS

export const hasRoster = (groupId: number) => getRoster(groupId).length > 0
