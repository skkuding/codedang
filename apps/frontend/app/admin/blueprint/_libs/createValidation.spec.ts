import { describe, expect, it } from 'vitest'
import {
  createTestOptions,
  createTestProblems,
  createTestSchedule,
  createTestSection
} from '../_test/createFixtures'
import {
  emptyBlueprintCreateDraft,
  type BlueprintCreateDraft
} from './createTypes'
import {
  applyBlueprintScheduleToSelected,
  parseBlueprintScheduleDateTime,
  validateBlueprintCreateDraft
} from './createValidation'

const options = createTestOptions({
  courseTitle: 'Programming',
  sections: [createTestSection(42), createTestSection(43, { memberCount: 0 })]
})

function draft(): BlueprintCreateDraft {
  return {
    ...emptyBlueprintCreateDraft(),
    title: 'Week 1',
    week: 1,
    description: '<p>Read the instructions.</p>',
    sections: [createTestSchedule(42)]
  }
}

describe('Blueprint creation UI date and timezone validation', () => {
  it('converts Seoul input into UTC without using the browser timezone', () => {
    expect(
      parseBlueprintScheduleDateTime('2026-11-15T09:00')?.toISOString()
    ).toBe('2026-11-15T00:00:00.000Z')
    expect(
      parseBlueprintScheduleDateTime('2026-01-01T00:00:30')?.toISOString()
    ).toBe('2025-12-31T15:00:30.000Z')
  })

  it('accepts leap days and rejects rolled calendar dates', () => {
    expect(parseBlueprintScheduleDateTime('2028-02-29T12:00')).not.toBeNull()
    expect(parseBlueprintScheduleDateTime('2026-02-29T12:00')).toBeNull()
    expect(parseBlueprintScheduleDateTime('2026-04-31T12:00')).toBeNull()
  })

  it.each([
    '',
    '2026-00-15T09:00',
    '2026-13-15T09:00',
    '2026-11-00T09:00',
    '2026-11-15T24:00',
    '2026-11-15T09:60',
    '2026-11-15T09:00:60',
    '2026-11-15 09:00',
    '2026-11-15T09:00Z',
    '2026-11-15T09:00+09:00',
    '0000-11-15T09:00'
  ])('rejects invalid datetime-local input: %s', (value) => {
    expect(parseBlueprintScheduleDateTime(value)).toBeNull()
  })

  it('requires start and end while allowing an omitted due time', () => {
    expect(validateBlueprintCreateDraft(draft(), options, false)).toEqual({})
    const invalid = draft()
    invalid.sections = [{ ...invalid.sections[0], startTime: '', endTime: '' }]
    expect(validateBlueprintCreateDraft(invalid, options, false)).toEqual({
      'sections.42.startTime': expect.any(String),
      'sections.42.endTime': expect.any(String)
    })
  })

  it('applies the provisional Course date-order policy: start < due <= end', () => {
    const input = draft()
    const schedule = input.sections[0]
    input.sections = [{ ...schedule, endTime: schedule.startTime }]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'sections.42.endTime'
    )
    input.sections = [{ ...schedule, dueTime: schedule.startTime }]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'sections.42.dueTime'
    )
    input.sections = [{ ...schedule, dueTime: '2026-11-21T00:00' }]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'sections.42.dueTime'
    )
    input.sections = [{ ...schedule, dueTime: schedule.endTime }]
    expect(validateBlueprintCreateDraft(input, options, false)).toEqual({})
  })

  it('rejects an invalid optional due date without silently omitting it', () => {
    const input = draft()
    input.sections = [{ ...input.sections[0], dueTime: '2026-02-30T12:00' }]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'sections.42.dueTime'
    )
  })
})

describe('Blueprint creation content and section validation', () => {
  it('uses the existing Course client problem limit without treating it as a server contract', () => {
    const problems = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      title: `Problem ${index + 1}`,
      level: 'Level1',
      hasSolution: false
    }))
    const value = draft()
    value.problems = problems.map(({ id }) => ({
      problemId: id,
      score: 0,
      solution: 'hidden'
    }))
    expect(
      validateBlueprintCreateDraft(value, options, false, problems).problems
    ).toBe('Select up to 20 problems.')
    value.problems = value.problems.slice(0, 20)
    expect(
      validateBlueprintCreateDraft(value, options, false, problems)
    ).toEqual({})
  })

  it('starts with independent empty selections and no invented dates', () => {
    const first = emptyBlueprintCreateDraft()
    const second = emptyBlueprintCreateDraft()
    expect(first.sections).toEqual([])
    expect(first.problems).toEqual([])
    expect(first.sections).not.toBe(second.sections)
  })

  it('validates a trimmed 1–120 character title and an available week', () => {
    expect(
      validateBlueprintCreateDraft({ ...draft(), title: '   ' }, options, false)
    ).toHaveProperty('title')
    expect(
      validateBlueprintCreateDraft(
        { ...draft(), title: 'a'.repeat(121) },
        options,
        false
      )
    ).toHaveProperty('title')
    expect(
      validateBlueprintCreateDraft({ ...draft(), week: 4 }, options, false)
    ).toHaveProperty('week')
    expect(
      validateBlueprintCreateDraft({ ...draft(), week: 0 }, options, false)
    ).toHaveProperty('week')
  })

  it.each([
    '',
    '   ',
    '<p><br></p>',
    '<p>&nbsp; &#160; &#xA0;</p>',
    '<p>\u200b&#8203;&#x200b;</p>',
    '<!-- hidden --><script>alert(1)</script>'
  ])('rejects an empty rich text description: %s', (description) => {
    expect(
      validateBlueprintCreateDraft({ ...draft(), description }, options, false)
    ).toHaveProperty('description')
  })

  it('accepts meaningful text or image-only rich text', () => {
    for (const description of [
      '<p>Instructions</p>',
      '<img src="/image.png">'
    ]) {
      expect(
        validateBlueprintCreateDraft(
          { ...draft(), description },
          options,
          false
        )
      ).not.toHaveProperty('description')
    }
  })

  it('requires a nonempty, unique selection belonging to this Blueprint', () => {
    expect(
      validateBlueprintCreateDraft({ ...draft(), sections: [] }, options, false)
    ).toHaveProperty('sections')
    const input = draft()
    const section = input.sections[0]
    input.sections = [section, section]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'sections'
    )
    input.sections = [{ ...section, groupId: 99 }]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'sections'
    )
  })

  it('applies the provisional selected-only bulk policy without mutation', () => {
    const input = draft()
    const updated = applyBlueprintScheduleToSelected(
      input,
      'dueTime',
      '2026-11-19T12:00'
    )
    expect(updated.sections).toEqual([
      { ...input.sections[0], dueTime: '2026-11-19T12:00' }
    ])
    expect(updated.sections.some((section) => section.groupId === 43)).toBe(
      false
    )
    expect(input.sections[0].dueTime).toBe('')
    expect(updated.sections[0].startTime).toBe(input.sections[0].startTime)
  })

  it('requires unique known problem IDs and Assignment integer scores', () => {
    const input = draft()
    const problems = createTestProblems()
    input.problems = [{ problemId: 11, score: 10, solution: 'hidden' }]
    expect(
      validateBlueprintCreateDraft(input, options, false, problems)
    ).toEqual({})
    input.problems = [...input.problems, input.problems[0]]
    expect(
      validateBlueprintCreateDraft(input, options, false, problems)
    ).toHaveProperty('problems')
    for (const score of [-1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
      input.problems = [{ problemId: 11, score, solution: 'hidden' }]
      expect(
        validateBlueprintCreateDraft(input, options, false, problems)
      ).toHaveProperty('problems')
      expect(
        validateBlueprintCreateDraft(input, options, true, problems)
      ).toEqual({})
    }
    input.problems = [{ problemId: 99, score: 0, solution: 'hidden' }]
    expect(
      validateBlueprintCreateDraft(input, options, false, problems)
    ).toHaveProperty('problems')
  })

  it('blocks selected problems when the catalogue is unknown', () => {
    const input = draft()
    input.problems = [{ problemId: 11, score: 10, solution: 'hidden' }]
    expect(validateBlueprintCreateDraft(input, options, false)).toHaveProperty(
      'problems'
    )
  })

  it('does not publish solutions for problems without a solution', () => {
    const input = draft()
    const problems = createTestProblems()
    input.problems = [{ problemId: 12, score: 0, solution: 'after-due' }]
    expect(
      validateBlueprintCreateDraft(input, options, false, problems)
    ).toHaveProperty('problems')
    input.problems = [{ ...input.problems[0], solution: 'hidden' }]
    expect(
      validateBlueprintCreateDraft(input, options, false, problems)
    ).toEqual({})
  })

  it.each([undefined, '', '2026-02-30T12:00', '2026-11-20T12:00Z'])(
    'rejects a missing or invalid selected manual release: %s',
    (manualReleaseTime) => {
      const input = draft()
      input.problems = [
        { problemId: 11, score: 10, solution: 'manual', manualReleaseTime }
      ]
      const errors = validateBlueprintCreateDraft(
        input,
        options,
        false,
        createTestProblems()
      )
      expect(errors).toHaveProperty('problems')
      expect(errors).toHaveProperty('problems.11.manualReleaseTime')
    }
  )

  it('accepts a selected manual release without changing the input', () => {
    const input = draft()
    input.problems = [
      {
        problemId: 11,
        score: 10,
        solution: 'manual',
        manualReleaseTime: '2026-11-20T12:30'
      }
    ]
    expect(
      validateBlueprintCreateDraft(input, options, false, createTestProblems())
    ).toEqual({})
    expect(input.problems[0].manualReleaseTime).toBe('2026-11-20T12:30')
  })

  it.each(['hidden', 'after-due'] as const)(
    'preserves but does not validate inactive manual input when %s is selected',
    (solution) => {
      const input = draft()
      input.problems = [
        { problemId: 11, score: 10, solution, manualReleaseTime: 'not a date' }
      ]
      expect(
        validateBlueprintCreateDraft(
          input,
          options,
          false,
          createTestProblems()
        )
      ).toEqual({})
      expect(input.problems[0].manualReleaseTime).toBe('not a date')
    }
  )
})
