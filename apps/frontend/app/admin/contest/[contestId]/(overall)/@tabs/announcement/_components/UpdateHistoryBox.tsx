'use client'

import { Button } from '@/components/shadcn/button'
import { GET_CONTEST_UPDATE_HISTORIES } from '@/graphql/contest/queries'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import arrowBlueIcon from '@/public/icons/arrow_blue_top.svg'
import arrowThinIcon from '@/public/icons/arrow_bottom_thin.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import { useState } from 'react'

export function UpdateHistoryBox({ contestId }: { contestId: number }) {
  const [openHistory, setOpenHistory] = useState<boolean>(false)
  const [seemore, setSeemore] = useState<string>('See More')
  const onClickSeemore = () => {
    setOpenHistory(!openHistory)
    setSeemore(openHistory ? 'See More' : 'Close')
  }
  const { data: updateHistory } = useQuery(GET_CONTEST_UPDATE_HISTORIES, {
    variables: { contestId }
  })
  const updateHistories =
    updateHistory?.getContestUpdateHistories.updateHistories

  const showHistories =
    (updateHistories?.length ?? 0) > 3
      ? updateHistories?.slice(0, 3)
      : updateHistories

  const disableFlag = !((updateHistories?.length ?? 0) > 3)

  return (
    <div className="flex flex-col">
      <div className="mb-5 text-2xl font-semibold leading-[33.6px] tracking-[-0.72px] text-black">
        Update History
      </div>
      <div
        id="historyBox"
        className={cn(
          'border-line mb-[12px] flex w-full flex-col gap-2 space-x-2 overflow-hidden rounded-2xl border bg-white px-6 py-5',
          openHistory && (updateHistories?.length ?? 0) > 3
            ? 'h-auto'
            : 'h-[128px]'
        )}
      >
        {updateHistories?.length === 0 && (
          <p className="text-base font-normal leading-[24px] tracking-[-0.48px] text-black">
            no result.
          </p>
        )}
        {!openHistory &&
          showHistories?.map((history, index) => (
            <div
              key={history.updatedAt}
              className={
                index === 0
                  ? 'text-primary flex w-full flex-wrap text-base font-normal leading-[24px] tracking-[-0.48px]'
                  : 'text-color-neutral-50 flex w-full flex-wrap text-base font-normal leading-[24px] tracking-[-0.48px]'
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
        {openHistory &&
          updateHistories?.map((history, index) => (
            <div
              key={history.updatedAt}
              className={
                index === 0
                  ? 'text-primary flex w-full flex-wrap text-base font-normal leading-[24px] tracking-[-0.48px]'
                  : 'text-color-neutral-50 flex w-full flex-wrap text-base font-normal leading-[24px] tracking-[-0.48px]'
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
      {!disableFlag && (
        <Button
          className="border-primary flex h-10 items-center justify-center rounded-[1000px] border bg-white px-5 py-[9px] hover:bg-white"
          onClick={() => {
            onClickSeemore()
          }}
        >
          <Image
            src={arrowBlueIcon}
            alt="arrow_top"
            width={18}
            className={cn(!openHistory && 'rotate-180')}
          />
          <p className="text-primary ml-[6px] text-base font-medium leading-[22.4px] tracking-[0.48px]">
            {seemore}
          </p>
        </Button>
      )}
      {disableFlag && (
        <Button
          className="border-line bg-color-neutral-99 pointer-events-none flex h-10 items-center justify-center rounded-[1000px] border px-5 py-[9px] hover:bg-white"
          onClick={() => {
            onClickSeemore()
          }}
        >
          <Image src={arrowThinIcon} alt="arrow_bottom_thin" width={18} />
          <p className="text-color-neutral-70 ml-[6px] text-base font-medium leading-[22.4px] tracking-[0.48px]">
            {seemore}
          </p>
        </Button>
      )}
    </div>
  )
}
