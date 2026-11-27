import { describe, expect, it } from 'vitest'
import {
  PROBLEM_IMPORT_FILTER,
  PROBLEM_IMPORT_LIMIT,
  hasProblemSolution,
  uniqueProblems
} from './problemImport'

describe('Course and Blueprint problem import data', () => {
  it('shares the existing Course scope and selection limit', () => {
    expect(PROBLEM_IMPORT_FILTER).toEqual({
      difficulty: ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'],
      languages: ['C', 'Cpp', 'Java', 'Python3']
    })
    expect(PROBLEM_IMPORT_LIMIT).toBe(20)
  })

  it.each([null, [], [{ code: '' }], [{ code: 2 }], [null, {}]])(
    'rejects missing solution code: %j',
    (solution) => {
      expect(hasProblemSolution(solution)).toBe(false)
    }
  )

  it('recognizes nonempty solution code and keeps unique IDs with fresh metadata in their original order', () => {
    expect(hasProblemSolution([{ code: 'answer' }])).toBe(true)
    const first = { id: '1', title: 'My problem' }
    const input = [
      first,
      { id: 2, title: 'Second' },
      { id: 1, title: 'Shared problem' }
    ]
    expect(uniqueProblems(input)).toEqual([
      { id: 1, title: 'Shared problem' },
      { id: 2, title: 'Second' }
    ])
    expect(first.title).toBe('My problem')
  })
})
