import assert from 'node:assert/strict'
import { test } from 'node:test'
import { acquireExecutionLock } from './execution-lock.mjs'
import { buildActivityLogs, eventDate } from './notion-activity-backup.mjs'

test('partitions deduplicated and enriched activity events by Korean calendar day', () => {
  const first = {
    event_id: 'event-2',
    timestamp: '2026-08-26T00:02:00.000Z',
    entity_id: 'page-1',
    authors: [{ id: 'user-1' }]
  }
  const replacement = { ...first, timestamp: '2026-08-26T00:03:00.000Z' }
  const earlier = {
    event_id: 'event-1',
    timestamp: '2026-08-26T00:01:00.000Z',
    authors: []
  }
  const result = buildActivityLogs(
    [
      JSON.stringify(first),
      JSON.stringify(earlier),
      JSON.stringify(replacement),
      ''
    ].join('\n'),
    new Map([['user-1', 'Example User']]),
    { pages: { 'page-1': { title: 'Example Page' } } }
  )

  assert.deepEqual([...result.keys()], ['log/2026-08/2026-08-26.jsonl'])
  const events = result
    .get('log/2026-08/2026-08-26.jsonl')
    .trim()
    .split('\n')
    .map(JSON.parse)
  assert.equal(events.length, 2)
  assert.equal(events[0].event_id, 'event-1')
  assert.deepEqual(events[1].author_names, ['Example User'])
  assert.equal(events[1].entity_title, 'Example Page')
  assert.equal(events[1].timestamp, replacement.timestamp)
})

test('uses Asia/Seoul boundaries for daily files', () => {
  assert.equal(eventDate('2026-08-25T14:59:59.999Z'), '2026-08-25')
  assert.equal(eventDate('2026-08-25T15:00:00.000Z'), '2026-08-26')
})

test('prevents overlapping executions', async () => {
  const path = `/tmp/notion-backup-test-lock-${process.pid}`
  const release = await acquireExecutionLock(path)
  try {
    assert.equal(await acquireExecutionLock(path), null)
  } finally {
    await release()
  }

  const releaseAgain = await acquireExecutionLock(path)
  await releaseAgain()
})
