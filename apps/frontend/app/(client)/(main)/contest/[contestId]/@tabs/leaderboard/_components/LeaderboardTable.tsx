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

// 주의! 본 페이지는 상당부분 하드코딩 되어있습니다! %%%%%
export function LeaderboardTable() {
  const problemSize = 15
  const solvedList = [9, 9, 8, 8, 8, 7, 5, 2]
  const problemPenalties = [
    123, 1, 32, 424, 412321, 3213, 342, 34342, 423, -1, 4343, 5, 105, 5, 77
  ]
  const orders = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  const ranks = [1, 2, 3, 4, 4, 6, 7, 8]

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
      // TODO 방승현: 밑에 있는 스크롤 크기 조정하는거 윈도우 크기 기준으로 바꿔야함! 지금 상태면 작은 화면에서 정보가 끝까지 안보임
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
        <LeaderboardTableHeader
          dx={dx}
          colHeaderSize={colHeaderSize}
          orders={orders}
        />
      </div>
      <div className="flex flex-row">
        <LeaderboardSolvedList
          solvedList={countSolvedList}
          problemSize={problemSize}
        />
        <div className="space-y-3" ref={scrollContainerRef}>
          {ranks.map((rank, index) => {
            return (
              <LeaderboardRow
                rank={rank}
                dx={dx}
                resizableRowSize={resizableRowSize}
                problemPenalties={problemPenalties}
                key={index}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
