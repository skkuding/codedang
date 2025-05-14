export const isOptionAfterDeadline = (solutionReleaseTime: Date | null) => {
  const dummyReleaseTime = new Date('2025-01-01')
  if (!solutionReleaseTime) {
    return false
  }
  return solutionReleaseTime.toString() === dummyReleaseTime.toString()
}
