import type { Testcase } from '@generated/graphql'

type Invalid = null | undefined | '' | number

export const isInvalid = (value: Invalid) => {
  return value === null || value === undefined || value === '' || isNaN(value)
}

export const validateScoreWeight = (testcases: Testcase[]): boolean => {
  const totalScore = testcases.reduce((acc, tc) => {
    if (typeof tc.scoreWeight === 'number') {
      return acc + tc.scoreWeight
    }
    if (tc.scoreWeightNumerator && tc.scoreWeightDenominator) {
      const percentage =
        (tc.scoreWeightNumerator / tc.scoreWeightDenominator) * 100
      return acc + percentage
    }
    return acc
  }, 0)

  const tolerance = 0.001
  return Math.abs(totalScore - 100) < tolerance
}
