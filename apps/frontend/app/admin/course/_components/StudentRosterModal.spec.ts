import { describe, expect, it } from 'vitest'
import { normalizeRoster } from './StudentRosterModal'

describe('normalizeRoster', () => {
  it('drops rows without a Student ID', () => {
    expect(
      normalizeRoster([
        { studentId: '2024310001', name: 'Hong Gil-dong' },
        { studentId: '', name: 'No ID' },
        { studentId: '   ', name: 'Blank ID' }
      ])
    ).toEqual([{ studentId: '2024310001', name: 'Hong Gil-dong' }])
  })

  it('trims cells so a padded ID still matches what students type', () => {
    expect(
      normalizeRoster([{ studentId: ' 2024310001 ', name: ' Hong Gil-dong ' }])
    ).toEqual([{ studentId: '2024310001', name: 'Hong Gil-dong' }])
  })

  it('keeps the first of each duplicate ID, comparing trimmed values', () => {
    expect(
      normalizeRoster([
        { studentId: '2024310001', name: 'First' },
        { studentId: ' 2024310001', name: 'Duplicate' },
        { studentId: '2024310002', name: 'Second' }
      ])
    ).toEqual([
      { studentId: '2024310001', name: 'First' },
      { studentId: '2024310002', name: 'Second' }
    ])
  })
})
