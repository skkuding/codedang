'use client'

import { Input } from '@/components/shadcn/input'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { GET_CONTEST_LEADERBOARD } from '@/graphql/leaderboard/queries'
import searchIcon from '@/public/icons/search.svg'
import { useQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LeaderboardError } from './_components/LeaderboardError'
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
  const [disableLeaderboard, setDisableLeaderboard] = useState<boolean>(true)
  const { t } = useTranslate()

  const {
    data: leaderboardData,
    loading: leaderboardLoading,
    error: leaderboardError
  } = useQuery(GET_CONTEST_LEADERBOARD, {
    variables: { contestId }
  })

  const {
    data: contestData,
    loading: contestLoading,
    error: contestError
  } = useQuery(GET_CONTEST, {
    variables: { contestId }
  })
  const contestLeaderboard = leaderboardData?.getContestLeaderboard
  const fetchedContest = contestData?.getContest

  const isLoading = leaderboardLoading || contestLoading
  const isError = leaderboardError || contestError

  const now = new Date()
  useEffect(() => {
    const endTime = new Date(fetchedContest?.endTime)
    if (endTime > now) {
      setDisableLeaderboard(true)
    } else {
      setDisableLeaderboard(false)
    }
  }, [fetchedContest])

  const isUnfrozen = !contestLeaderboard?.isFrozen
  const [problemSize, setProblemSize] = useState(0)
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    BaseLeaderboardUser
  ])

  useEffect(() => {
    setProblemSize(
      contestLeaderboard?.leaderboard.length
        ? contestLeaderboard.leaderboard[0].problemRecords.length
        : 0
    )
    setLeaderboardUsers(
      contestLeaderboard
        ? contestLeaderboard.leaderboard
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

  if (isLoading) {
    return (
      <div className="flex justify-center pt-[100px] text-xl">
        {t('loading_contest_data')}
      </div>
    )
  }
  if (isError) {
    return <LeaderboardError type="networkError" />
  }
  if (!contestLeaderboard?.leaderboard?.length) {
    const contestStartTime = new Date(fetchedContest?.startTime)
    if (contestStartTime > now) {
      return <LeaderboardError type="beforeStart" />
    } else {
      return <LeaderboardError type="noData" />
    }
  }

  return (
    <div className="relative mt-9 w-full pb-[120px]">
      <UnfreezeLeaderboardToggle
        contestId={contestId}
        isUnFrozen={isUnfrozen}
        activated={!disableLeaderboard}
        t={t}
      />
      <div className="mb-[62px] mt-[60px] flex w-full flex-row justify-between pl-[14px] pr-[9px]">
        <div className="flex flex-row text-2xl font-semibold text-black">
          <div className="text-[#3581FA]">
            {contestLeaderboard?.participatedNum}
          </div>
          /{contestLeaderboard?.registeredNum} {t('participants')}
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
            placeholder={t('search_placeholder')}
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
  t: (key: string) => string
}
function UnfreezeLeaderboardToggle({
  contestId,
  isUnFrozen,
  activated,
  t
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
          {t('unfreeze_leaderboard')}
        </div>
        <LeaderboardUnfreezeSwitchDialog
          contestId={contestId}
          isUnFrozen={isUnFrozen}
          activated={activated}
        />
      </div>
      <div className="mt-1 text-[14px] font-normal text-[#9B9B9B]">
        {t('unfreeze_leaderboard_note')}
      </div>
    </div>
  )
}
