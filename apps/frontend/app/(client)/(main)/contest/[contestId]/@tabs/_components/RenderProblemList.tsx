import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import type { ProblemDataTop } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { RenderProblemColumn } from './RenderProblemColumn'

interface RenderProblemListProps {
  state: string
  isRegistered: boolean
  problemData: ProblemDataTop
  isPrivilegedRole: boolean
  linked?: boolean
}

export function RenderProblemList({
  state,
  isRegistered,
  problemData,
  isPrivilegedRole,
  linked = true
}: RenderProblemListProps) {
  const { t } = useTranslate()
  const renderProblemColumn = RenderProblemColumn({ t })

  if (state === 'Upcoming' && !isPrivilegedRole) {
    return (
      <div className="flex h-[608px] w-[1208px] flex-col items-center justify-center rounded-[20px] bg-[#d9d9d940]">
        <Image
          src={'/logos/welcomeNobg.png'}
          alt="No context"
          width={454}
          height={262}
        />
        <p className="mt-[50px] text-center text-2xl font-semibold tracking-[-0.72px] text-[#000000]">
          {t('contest_has_not_started')}
        </p>
        <p className="mt-2 text-center text-base font-normal text-[#00000080]">
          {t('problem_list_released_after_contest_starts')}
        </p>
      </div>
    )
  } else if (state === 'Ongoing' && !isRegistered && !isPrivilegedRole) {
    return (
      <div className="flex h-[608px] w-[1208px] flex-col items-center justify-center rounded-[20px] bg-[#d9d9d940]">
        <Image
          src={'/logos/welcomeNobg.png'}
          alt="No context"
          width={454}
          height={262}
        />
        <p className="mt-[50px] text-center text-2xl font-semibold tracking-[-0.72px] text-[#000000]">
          {t('register_for_contest_first')}
        </p>
        <p className="mt-2 text-center text-base font-normal text-[#00000080]">
          {t('problem_list_revealed_to_participants_only')}
        </p>
      </div>
    )
  } else {
    if (problemData.total === 0) {
      return <div>{t('no_result')}</div>
    } else {
      const transformedProblemData = problemData.data.map((problem) => {
        return {
          ...problem,
          id: `/problem/${problem.id}`
        }
      })
      return (
        <DataTable
          data={transformedProblemData}
          columns={renderProblemColumn}
          headerStyle={{
            order: 'text-[#8A8A8A] w-[10px] p-0 md:w-16 px-4',
            title: 'text-[#8A8A8A] text-left w-[100px] p-0 md:w-[832px] px-6',
            score: 'text-[#8A8A8A] w-4/10 p-0 md:w-[296px] px-4'
          }}
          linked={linked}
        />
      )
    }
  }
}
