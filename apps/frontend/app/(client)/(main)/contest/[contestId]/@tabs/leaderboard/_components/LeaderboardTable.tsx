'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  solvedList.forEach((solved) => {
    solvedCount[solved]++
  })
  return solvedCount
}

export function LeaderboardTable() {
  const problemSize = 15
  const solvedList = [9, 9, 8, 8, 8, 7, 5, 2]
  const countSolvedList = countSolved({
    solvedList,
    numProblems: problemSize
  })
  countSolvedList.reverse()

  const [dx, setDx] = useState(0)
  const [colHeaderSize, setColHeaderSize] = useState(
    DEFAULT_COL_HEADER_SIZE + problemSize * 114
  )
  const [resizableRowSize, setResizableRowSize] = useState(
    DEFAULT_ROW_SIZE + problemSize * 114
  )

  const move = useCallback(
    (amount: number) => {
      if (dx > 20) {
        setDx(0)
        setColHeaderSize(DEFAULT_COL_HEADER_SIZE + problemSize * 114)
        setResizableRowSize(DEFAULT_ROW_SIZE + problemSize * 114)
        return
      }
      // 밑에 있는 스크롤 크기 조정하는거 윈도우 크기 기준으로 바꿔야함! 지금 상태면 작은 화면에서 정보가 끝까지 안보임
      if (dx < -(DEFAULT_COL_HEADER_SIZE + problemSize * 114 - 1000)) {
        setDx(-(DEFAULT_COL_HEADER_SIZE + problemSize * 114 - 1000))
        setColHeaderSize(DEFAULT_COL_HEADER_SIZE + 959)
        setResizableRowSize(DEFAULT_ROW_SIZE + 959)
        return
      }

      setDx((prev) => {
        return prev + amount
      })
      setColHeaderSize((prev) => prev + amount)
      setResizableRowSize((prev) => prev + amount)
    },
    [dx]
  )

  // 스크롤 이벤트를 감지할 div에 사용할 ref
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) {
        e.preventDefault()
        if (Math.abs(e.deltaX) > 2) {
          move(-e.deltaX)
        }
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [move])

  return (
    <div className="flex flex-col">
      <div className="inline-block" ref={scrollContainerRef}>
        <LeaderboardTableHeader dx={dx} colHeaderSize={colHeaderSize} />
      </div>
      <div className="flex flex-row">
        <LeaderboardSolvedList
          solvedList={countSolvedList}
          problemSize={problemSize}
        />
        {/* onWheel 대신 ref를 부여하여 native 이벤트로 처리 */}
        <div className="space-y-3" ref={scrollContainerRef}>
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
