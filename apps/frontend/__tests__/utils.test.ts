import { convertToLetter, dateFormatter } from '@/libs/utils'
import { test, expect } from 'vitest'

test('convertToLetter', () => {
  expect(convertToLetter(0)).toBe('A')
  expect(convertToLetter(1)).toBe('B')
  expect(convertToLetter(2)).toBe('C')
  expect(convertToLetter(25)).toBe('Z')
})

test('dateFormatter', () => {
  expect(dateFormatter('2022-01-01', 'YYYY-MM-DD')).toBe('2022-01-01')
  expect(dateFormatter('2022-01-01', 'DD/MM/YYYY')).toBe('01/01/2022')
  expect(dateFormatter('2022-01-01', 'DD MMM YYYY')).toBe('01 Jan 2022')
})
