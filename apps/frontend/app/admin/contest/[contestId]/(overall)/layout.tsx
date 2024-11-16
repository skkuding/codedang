'use client'

import KatexContent from '@/components/KatexContent'
import { Button } from '@/components/shadcn/button'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { dateFormatter } from '@/lib/utils'
import periodIcon from '@/public/icons/period.svg'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import Link from 'next/link'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'
import ContestOverallTabs from '../_components/ContestOverallTabs'

export default function Layout({
  params,
  tabs,
  userId
}: {
  params: { contestId: string }
  tabs: React.ReactNode
  userId: number
}) {
  const { contestId } = params

  const contestData = useQuery(GET_CONTEST, {
    variables: {
      contestId: Number(contestId)
    }
  }).data?.getContest

  return (
    <main className="flex flex-col gap-6 px-20 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/contest">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">{contestData?.title}</span>
        </div>
        <Link href={`/admin/contest/${contestId}/edit`}>
          <Button variant="default">
            <FaPencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
      <div className="flex justify-between">
        <p className="text-primary font-bold">
          Invitation code: {contestData?.invitationCode}
        </p>
        <div className="flex items-center gap-2">
          <Image src={periodIcon} alt="period" width={22} />
          <p className="font-semibold">
            {dateFormatter(contestData?.startTime, 'YY-MM-DD HH:mm')} ~{' '}
            {dateFormatter(contestData?.endTime, 'YY-MM-DD HH:mm')}
          </p>
        </div>
      </div>
      <KatexContent
        content={contestData?.description}
        classname="prose mb-4 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
      />
      <ContestOverallTabs contestId={contestId} userId={userId} />
      {tabs}
    </main>
  )
}
