'use client'

import { Input } from '@/components/shadcn/input'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { GET_CONTEST_LEADERBOARD } from '@/graphql/leaderboard/queries'
import searchIcon from '@/public/icons/search.svg'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LeaderboardTable } from './_components/LeaderboardTable'
import { LeaderboardUnfreezeSwitchDialog } from './_components/LeaderboardUnfreezeSwitchDialog'
import type { LeaderboardUser } from './_libs/types'

const BaseLeaderboardUser = {
  rank: 1,
  userId: 1,
  username: '',
  finalScore: 0,
  finalTotalPenalty: 0,
  problemRecords: [
    {
      order: 0,
      problemId: 1,
      score: 0,
      penalty: 0,
      submissionCount: 0,
      isFirstSolver: false
    }
  ]
}

export default function ContestLeaderBoard() {
  const [searchText, setSearchText] = useState('')
  const pathname = usePathname()
  const contestId = Number(pathname.split('/')[3])

  const { data: contestLeaderboard } = useSuspenseQuery(
    GET_CONTEST_LEADERBOARD,
    {
      variables: { contestId }
    }
  )

  const [disableLeaderboard, setDisableLeaderboard] = useState<boolean>(true)
  const { data: fetchedContest } = useSuspenseQuery(GET_CONTEST, {
    variables: { contestId }
  })

  const now = new Date()
  useEffect(() => {
    const endTime = new Date(fetchedContest.getContest.endTime)
    if (endTime > now) {
      setDisableLeaderboard(true)
    } else {
      setDisableLeaderboard(false)
    }
  }, [fetchedContest])

  const isUnfrozen = !contestLeaderboard.getContestLeaderboard.isFrozen

  const [problemSize, setProblemSize] = useState(0)
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    BaseLeaderboardUser
  ])

  useEffect(() => {
    if (contestLeaderboard.getContestLeaderboard.leaderboard[0] === undefined) {
      const contestStartTime = new Date(fetchedContest.getContest.startTime)
      if (contestStartTime > now) {
        throw new Error(
          'Error(before start): There is no data in leaderboard yet.'
        )
      } else {
        throw new Error('Error(no data): There is no data in leaderboard yet.')
      }
    }
    setProblemSize(
      contestLeaderboard
        ? contestLeaderboard.getContestLeaderboard.leaderboard[0].problemRecords
            .length
        : 0
    )
    setLeaderboardUsers(
      contestLeaderboard
        ? contestLeaderboard.getContestLeaderboard.leaderboard
        : [BaseLeaderboardUser]
    )
  }, [contestLeaderboard])

  const [matchedIndices, setMatchedIndices] = useState<number[]>([])
  interface HandleSearchProps {
    text: string
    leaderboardUsers: LeaderboardUser[]
  }

  const handleSearch = ({ text, leaderboardUsers }: HandleSearchProps) => {
    if (text === '') {
      alert('나는 입력값을 원한다.')
      return
    }
    const regex = new RegExp(text, 'i')
    const matchedIndices = leaderboardUsers
      .map((user, index) => (regex.test(user.username) ? index : -1))
      .filter((index) => index !== -1)
    setMatchedIndices(matchedIndices)
    if (matchedIndices.length === 0) {
      alert('일치하는 거 없음 ㅋ')
      return
    }
  }

  return (
    <div className="relative mt-9 w-full pb-[120px]">
      <UnfreezeLeaderboardToggle
        contestId={contestId}
        isUnFrozen={isUnfrozen}
        activated={!disableLeaderboard}
      />
      <div className="mb-[62px] mt-[60px] flex w-full flex-row justify-between pl-[14px] pr-[9px]">
        <div className="flex flex-row text-2xl font-semibold text-black">
          <div className="text-[#3581FA]">
            {contestLeaderboard.getContestLeaderboard.participatedNum}
          </div>
          /{contestLeaderboard.getContestLeaderboard.registeredNum} Participants
        </div>
        <div className="relative">
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
      </div>

      <div>
        <LeaderboardTable
          problemSize={problemSize}
          leaderboardUsers={leaderboardUsers}
          matchedIndices={matchedIndices}
        />
      </div>
    </div>
  )
}

interface UnfreezeLeaderboardToggleProps {
  contestId: number
  isUnFrozen: boolean
  activated: boolean
}
function UnfreezeLeaderboardToggle({
  contestId,
  isUnFrozen,
  activated
}: UnfreezeLeaderboardToggleProps) {
  return (
    <div
      className={`mr-20 h-[93px] w-full rounded-xl border border-[#619CFB] pl-[30px] pt-[21px] ${
        !activated
          ? 'pointer-events-none border-[#E5E5E5] bg-[#80808014] text-[#9B9B9B]'
          : ''
      }`}
    >
      <div className="flex flex-row">
        <div
          className={`mr-3 text-xl font-semibold ${!activated ? 'text-[#9B9B9B]' : 'text-[#3581FA]'}`}
        >
          Unfreeze Leaderboard
        </div>
        <LeaderboardUnfreezeSwitchDialog
          contestId={contestId}
          isUnFrozen={isUnFrozen}
          activated={activated}
        />
      </div>
      <div className="mt-1 text-[14px] font-normal text-[#9B9B9B]">
        The leaderboard can only be unfrozen after the contest has finished.
      </div>
    </div>
  )
}
