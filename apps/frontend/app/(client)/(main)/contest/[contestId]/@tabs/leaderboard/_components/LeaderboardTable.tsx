'use client'

import { useWindowSize } from '@/libs/hooks/useWindowSize'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useInterval } from 'react-use'
import type { LeaderboardUser } from '../_libs/apis/getContestLeaderboard'
import { countSolved } from '../_libs/utils'
import { LeaderboardRow } from './LeaderboardRow'
import { LeaderboardSolvedList } from './LeaderboardSolvedList'
import { LeaderboardTableHeader } from './LeaderboardTableHeader'

const DEFAULT_COL_HEADER_SIZE = 41
const DEFAULT_ROW_SIZE = 313

interface LeaderboardTableProps {
  problemSize: number
  leaderboardUsers: LeaderboardUser[]
  matchedIndices: number[]
}

export function LeaderboardTable({
  problemSize,
  leaderboardUsers,
  matchedIndices
}: LeaderboardTableProps) {
  const solvedList = leaderboardUsers.map((user) => {
    let solved = 0
    user.problemRecords.forEach((problem) => {
      if (problem.score !== 0) {
        solved++
      }
    })
    return solved
  })

  const [orders, setOrders] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  const problemRecord = leaderboardUsers[0].problemRecords
  useEffect(() => {
    const newOrders = problemRecord.map((problem) => problem.order)
    const sortedOrders = [...newOrders].sort((a, b) => a - b)
    setOrders(sortedOrders)
  }, [problemRecord])

  const windowSize = useWindowSize()

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

  const scrollLimit = DEFAULT_COL_HEADER_SIZE + problemSize * 114 - 300
  const [resizableScrollLimit, setResizableScrollLimit] = useState(
    DEFAULT_COL_HEADER_SIZE + problemSize * 114 - windowSize.width + 500
  )

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  useEffect(() => {
    setDx(0)
    setColHeaderSize(DEFAULT_COL_HEADER_SIZE + problemSize * 114)
    setResizableRowSize(DEFAULT_ROW_SIZE + problemSize * 114)
    setResizableScrollLimit(
      DEFAULT_COL_HEADER_SIZE + problemSize * 114 - windowSize.width + 500
    )
  }, [problemSize, windowSize.width])

  const horizontalScroll = useCallback(
    (amount: number) => {
      if (resizableScrollLimit < 0) {
        return
      }
      // 가로 스크롤 중 처음 위치에서 오른쪽으로의 이동을 막는 코드
      if (dx > 20) {
        setDx(0)
        setColHeaderSize(DEFAULT_COL_HEADER_SIZE + problemSize * 114)
        setResizableRowSize(DEFAULT_ROW_SIZE + problemSize * 114)
        return
      }

      // 가로 스크롤 중 마지막 위치에서 왼쪽으로의 이동을 막는 코드
      if (resizableScrollLimit < scrollLimit && -dx > resizableScrollLimit) {
        setDx(-resizableScrollLimit)
        setColHeaderSize(DEFAULT_COL_HEADER_SIZE + windowSize.width - 541)
        setResizableRowSize(DEFAULT_ROW_SIZE + windowSize.width - 541)
        return
      }
      if (-dx > scrollLimit) {
        setDx(-scrollLimit)
        setColHeaderSize(DEFAULT_COL_HEADER_SIZE + 259)
        setResizableRowSize(DEFAULT_ROW_SIZE + 259)
        return
      }

      setDx((prev) => {
        return prev + amount
      })
      setColHeaderSize((prev) => prev + amount)
      setResizableRowSize((prev) => prev + amount)
    },
    [dx, problemSize, resizableScrollLimit, windowSize.width]
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
          horizontalScroll(-e.deltaX)
        }
      }
    }
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [horizontalScroll])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) {
      return
    }
    setStartX(e.pageX)
    setIsDragging(true)
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) {
      return
    }
    const deltaX = e.pageX - startX
    horizontalScroll(1.5 * deltaX)
    setStartX(e.pageX)
  }
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const lastScrollY = localStorage.getItem('leaderboardScrollY') ?? '0'
    window.scrollTo({ top: parseInt(lastScrollY) })
  }, [])

  useInterval(() => {
    const scrollY = window.scrollY
    localStorage.setItem('leaderboardScrollY', scrollY.toString())
  }, 1000)

  return (
    <div className="flex flex-col">
      <div className="inline-block">
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
        <div
          className="space-y-3"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <Tooltip.Provider>
            {leaderboardUsers.map((user, index) => {
              const problemRecords = user?.problemRecords
              const search = matchedIndices.includes(index)
              return (
                <LeaderboardRow
                  username={user.username}
                  totalPenalty={user.totalPenalty}
                  rank={user.rank}
                  dx={dx}
                  resizableRowSize={resizableRowSize}
                  problemRecords={problemRecords}
                  key={index}
                  search={search}
                />
              )
            })}
          </Tooltip.Provider>
        </div>
      </div>
      {/* 밑에 있는 내용은 스크롤 바입니다. 언젠가 만들거임*/}
      {/* <div className="ml-[358px] flex h-[10px] flex-row">
        <div className="h-[10px] w-[226px] rounded-full bg-[#D9D9D9]" />
      </div> */}
    </div>
  )
}
