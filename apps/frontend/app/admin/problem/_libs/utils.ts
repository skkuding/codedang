import type { Testcase } from '@generated/graphql'

type Invalid = null | undefined | '' | number

export const isInvalid = (value: Invalid) => {
  return value === null || value === undefined || value === '' || isNaN(value)
}

export const validateScoreWeight = (testcases: Testcase[]): boolean => {
  const totalScore = testcases
    .map((tc: Testcase) => tc.scoreWeight)
    .filter((score): score is number => score !== null && score !== undefined)
    .reduce((acc: number, score) => acc + score, 0)

  return totalScore === 100
}
