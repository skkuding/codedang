export const handleSearch = (text: string) => {
  alert(`검색할래요 ${text}를.`)
}

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
