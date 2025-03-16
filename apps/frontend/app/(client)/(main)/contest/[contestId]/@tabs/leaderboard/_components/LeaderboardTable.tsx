'use client'

import { useState } from 'react'
import { LeaderboardRow } from './LeaderboardRow'
import { LeaderboardSolvedList } from './LeaderboardSolvedList'
import { LeaderboardTableHeader } from './LeaderboardTableHeader'

const DEFAULT_COL_HEADER_SIZE = 41
const DEFAULT_ROW_SIZE = 313

interface CountSolvedProps {
  solvedList: number[]
  numProblems: number
}
function countSolved({ solvedList, numProblems }: CountSolvedProps) {
  const solvedCount = [...Array(numProblems + 1).fill(0)]
  solvedList.map((solved) => {
    solvedCount[solved]++
  })
  return solvedCount
}

export function LeaderboardTable() {
  const problemSize = 10
  const solvedList = [9, 9, 8, 8, 8, 7, 5, 2]
  const countSolvedList = countSolved({
    solvedList,
    numProblems: problemSize
  })
  countSolvedList.reverse()

  const [dx, setDx] = useState(0)
  const [colHeaderSize, setColHeaderSize] = useState(
    114 * problemSize + DEFAULT_COL_HEADER_SIZE
  )
  const [resizableRowSize, setResizableRowSize] = useState(
    DEFAULT_ROW_SIZE + problemSize * 114
  )

  const move = (dx: number) => {
    setDx((prev) => prev + dx)
    setColHeaderSize(colHeaderSize + dx)
    setResizableRowSize(resizableRowSize + dx)
  }

  return (
    <div className="flex flex-col">
      <div className="absolute bottom-10 flex space-x-4">
        <button className="bg-gray-300 p-2" onClick={() => move(-100)}>
          ←←
        </button>
        <button className="bg-gray-300 p-2" onClick={() => move(100)}>
          →
        </button>
      </div>
      <LeaderboardTableHeader dx={dx} colHeaderSize={colHeaderSize} />
      <div className="flex flex-row">
        <LeaderboardSolvedList
          solvedList={countSolvedList}
          problemSize={problemSize}
        />
        <div className="space-y-3">
          <LeaderboardRow
            rank={1}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={2}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={3}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={4}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={4}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={6}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={7}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
          <LeaderboardRow
            rank={8}
            dx={dx}
            resizableRowSize={resizableRowSize}
          />
        </div>
      </div>
    </div>
  )
}
