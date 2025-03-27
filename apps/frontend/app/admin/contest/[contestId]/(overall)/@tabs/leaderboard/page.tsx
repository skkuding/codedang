'use client'

import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import { UPDATE_CONTEST } from '@/graphql/contest/mutations'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { GET_CONTEST_LEADERBOARD } from '@/graphql/leaderboard/queries'
import searchIcon from '@/public/icons/search.svg'
import { useSuspenseQuery, useMutation } from '@apollo/client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LeaderboardTable } from './_components/LeaderboardTable'
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
  if (fetchedContest.getContest.endTime > now) {
    setDisableLeaderboard(true)
  }

  const isFrozen = contestLeaderboard.getContestLeaderboard.isFrozen

  const [problemSize, setProblemSize] = useState(0)
  const [leaderboardUsers, setLeaderboardUsers] = useState([
    BaseLeaderboardUser
  ])

  useEffect(() => {
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
  }

  return (
    <div className="relative mt-9 w-screen pb-[120px]">
      {disableLeaderboard ? (
        <UnfreezeLeaderboardToggle
          contestId={contestId}
          isUnFrozen={!isFrozen}
          activated={false}
        />
      ) : (
        <UnfreezeLeaderboardToggle
          contestId={contestId}
          isUnFrozen={!isFrozen}
          activated={true}
        />
      )}
      <div className="mb-[62px] mt-[60px] flex flex-row">
        <div className="mr-[167px] flex flex-row text-2xl font-semibold text-black">
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
  const [isUnfrozen, setIsUnfrozen] = useState<boolean>(isUnFrozen)
  const [updateContest] = useMutation(UPDATE_CONTEST)

  const toggleUnfreeze = async () => {
    try {
      // 콘테스트가 끝난다음 기능하는 부분임 -> 콘테스트 끝난다음 동작하는지 확인해야함
      console.log('contestId: ', contestId, ' unfreeze?: ', isUnfrozen)
      const res = await updateContest({
        variables: {
          input: {
            id: contestId,
            unfreeze: !isUnfrozen
          }
        }
      })
      console.log('res: ', res)
    } catch (err) {
      console.error('Error updating contest:', err)
    }
  }
  return (
    <div
      className={`h-[93px] w-[1002px] rounded-xl border border-[#619CFB] pl-[30px] pt-[21px] ${
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
        <Switch
          checked={!isUnfrozen}
          onCheckedChange={(checked) => {
            // 여기서 API 요청 보내기
            toggleUnfreeze()
            setIsUnfrozen(!checked)
          }}
          className={`h-[24px] w-[46px] ${!activated ? 'data-[state=unchecked]:bg-[#C4C4C4]' : ''}`}
          thumbClassName="w-[18px] h-[18px] data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
        />
      </div>
      <div className="mt-1 font-[14px] font-normal text-[#9B9B9B]">
        The leaderboard can only be unfrozen after the contest has finished.
      </div>
    </div>
  )
}
