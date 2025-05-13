'use client'

import { Button } from '@/components/shadcn/button'
import { GET_CONTEST_UPDATE_HISTORIES } from '@/graphql/contest/queries'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function UpdateHistoryBox({ contestId }: { contestId: number }) {
  const [openHistory, setOpenHistory] = useState<boolean>(false)
  const [seemore, setSeemore] = useState<string>('see more')
  const onClickSeemore = () => {
    setOpenHistory(!openHistory)
    setSeemore(openHistory ? 'see more' : 'close')
  }
  const { data: updateHistory } = useQuery(GET_CONTEST_UPDATE_HISTORIES, {
    variables: { contestId }
  })
  const updateHistories =
    updateHistory?.getContestUpdateHistories.updateHistories
  return (
    <>
      <div className="mb-6 text-2xl font-semibold">Update History</div>
      <div
        id="historyBox"
        className={cn(
          'w-100% mb-[14px] overflow-hidden rounded-xl border bg-white px-10 pb-[20px] pt-[18px]',
          openHistory && (updateHistories?.length ?? 0) > 3
            ? 'h-auto'
            : 'h-[149px]'
        )}
      >
        {updateHistories?.length === 0 && <p>no result.</p>}
        {updateHistories?.map((history, index) => (
          <div
            key={history.updatedAt}
            className={
              index === 0
                ? 'text-primary flex w-full flex-wrap py-[6px] text-lg'
                : 'flex w-full flex-wrap py-[6px] text-lg'
            }
          >
            <p>
              {`[`}
              {dateFormatter(history.updatedAt, 'YYYY-MM-DD HH:mm:ss')}
              {`] `}
            </p>
            &nbsp;
            <p>
              Problem{' '}
              {history.order !== null
                ? convertToLetter(Number(history.order))
                : ''}
              &nbsp;
              {':'}
            </p>
            &nbsp;
            <div className="flex">
              {history.updatedInfo
                .map((current) => current.current)
                .join(' & ')}
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mb-16 h-[42px] bg-[#80808014] text-lg hover:bg-[#80808039]"
        onClick={() => {
          onClickSeemore()
        }}
      >
        <p className="text-[#8A8A8A]">{seemore}</p>
        &nbsp;
        <ChevronDown
          className={cn('w-4 text-[#8A8A8A]', openHistory && 'rotate-180')}
        />
      </Button>
    </>
  )
}
