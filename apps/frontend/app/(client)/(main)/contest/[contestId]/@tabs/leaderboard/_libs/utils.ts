interface CountSolvedProps {
  solvedList: number[]
  numProblems: number
}
export function countSolved({ solvedList, numProblems }: CountSolvedProps) {
  const solvedCount = [...Array(numProblems + 1).fill(0)]
  solvedList.forEach((solved) => {
    solvedCount[solved]++
  })
  return solvedCount
}
