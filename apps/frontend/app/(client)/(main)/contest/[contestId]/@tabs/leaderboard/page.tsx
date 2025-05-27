'use client'

import { Input } from '@/components/shadcn/input'
import searchIcon from '@/public/icons/search.svg'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LeaderboardModalDialog } from './_components/LeaderboardModalDialog'
import { LeaderboardTable } from './_components/LeaderboardTable'
import { getContest } from './_libs/apis/getContest'
import type { LeaderboardUser } from './_libs/apis/getContestLeaderboard'
import { getContestLeaderboard } from './_libs/apis/getContestLeaderboard'

const BaseLeaderboardUser = {
  username: '',
  totalScore: 0,
  totalPenalty: 0,
  problemRecords: [
    {
      order: 0,
      problemId: 1,
      penalty: 0,
      submissionCount: 0,
      score: 0,
      isFrozen: false,
      isFirstSolver: false
    }
  ],
  rank: 1
}
const BaseContestLeaderboardData = {
  maxScore: 0,
  leaderboard: [BaseLeaderboardUser],
  contestRole: null
}

const BaseFetchedContest = {
  id: 1,
  title: 'base contest',
  startTime: new Date(),
  endTime: new Date(),
  freezeTime: new Date()
}

export default function ContestLeaderBoard() {
  const [searchText, setSearchText] = useState('')
  const pathname = usePathname()
  const contestId = Number(pathname.split('/')[2])

  // eslint-disable-next-line prefer-const
  const { data, isLoading, isError } = useQuery({
    queryKey: ['contest leaderboard', contestId],
    queryFn: () => getContestLeaderboard({ contestId })
  })
  const contestLeaderboard = data ? data : BaseContestLeaderboardData
  const [problemSize, setProblemSize] = useState(0)
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    BaseLeaderboardUser
  ])
  const {
    data: fetchedContestQuery,
    isLoading: isContestLoading,
    isError: isContestError
  } = useQuery({
    queryKey: ['fetched contest', contestId],
    queryFn: () => getContest({ contestId })
  })
  const fetchedContest = fetchedContestQuery
    ? fetchedContestQuery
    : BaseFetchedContest

  useEffect(() => {
    if (isLoading || contestLeaderboard === BaseContestLeaderboardData) {
      return
    }

    const now = new Date()
    if (!isLoading && !isError) {
      const contestEndTime = new Date(fetchedContest?.endTime)
      const contestStartTime = new Date(fetchedContest?.startTime)

      const hasContestAuth =
        contestLeaderboard.contestRole === 'Admin' ||
        contestLeaderboard.contestRole === 'Manager'

      if (!hasContestAuth && contestEndTime > now && contestStartTime < now) {
        throw new Error('Error(ongoing): The contest has not ended yet.')
      }
      if (contestStartTime > now) {
        throw new Error(
          'Error(before start): There is no data in leaderboard yet.'
        )
      }

      if (contestLeaderboard.leaderboard.length === 0) {
        throw new Error('Error(no data): There is no data in leaderboard yet.')
      }

      setProblemSize(contestLeaderboard.leaderboard[0].problemRecords.length)
      setLeaderboardUsers(contestLeaderboard.leaderboard)

      // requestAnimationFrame(() => {
      //   window.scrollTo({ top: 420, behavior: 'auto' })
      // })
    }
  }, [data, isLoading, isError, isContestLoading, isContestError])

  const [matchedIndices, setMatchedIndices] = useState<number[]>([])
  interface HandleSearchProps {
    text: string
    leaderboardUsers: LeaderboardUser[]
  }

  const handleSearch = ({ text, leaderboardUsers }: HandleSearchProps) => {
    if (text === '') {
      alert('제발 입력값을 넣어주세요. 이렇게 부탁드립니다.')
      return
    }
    const regex = new RegExp(text, 'i')
    const matchedIndices = leaderboardUsers
      .map((user, index) => (regex.test(user.username) ? index : -1))
      .filter((index) => index !== -1)
    setMatchedIndices(matchedIndices)
    if (matchedIndices.length === 0) {
      alert('일치하는 유저 없음 ㅋ')
      return
    }
  }

  return (
    <div className="relative ml-[116px] w-screen pb-[120px]">
      <div className="mt-[96px] flex flex-row">
        <div className="h-[34px] text-[24px] font-bold">
          CHECK YOUR RANKING!
        </div>
        <LeaderboardModalDialog />
      </div>
      <div className="relative mb-[62px] mt-[30px]">
        <Image
          src={searchIcon}
          alt="search"
          className="absolute left-5 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => {
            handleSearch({ text: searchText, leaderboardUsers })
          }}
        />
        <Input
          placeholder="Search"
          className="w-[600px] pl-[52px] text-[18px] font-normal"
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch({ text: searchText, leaderboardUsers })
            }
          }}
        />
      </div>
      <div>
        {!isLoading && (
          <LeaderboardTable
            problemSize={problemSize}
            leaderboardUsers={leaderboardUsers}
            matchedIndices={matchedIndices}
          />
        )}
      </div>
    </div>
  )
}
