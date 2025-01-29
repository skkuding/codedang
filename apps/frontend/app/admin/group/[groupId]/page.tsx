'use client'

import { KatexContent } from '@/components/KatexContent'
import { Button } from '@/components/shadcn/button'
import { GET_GROUP } from '@/graphql/group/queries'
import periodIcon from '@/public/icons/period.svg'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'

export default function Page({ params }: { params: { groupId: string } }) {
  const { groupId } = params

  const { data } = useSuspenseQuery(GET_GROUP, {
    variables: {
      groupId: Number(groupId)
    }
  })
  const group = data.getGroup

  return (
    <main className="flex flex-col gap-6 px-20 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/group">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">{group.groupName}</span>
        </div>
        <Link href={`/admin/group/${groupId}/edit` as Route}>
          <Button variant="default">
            <FaPencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
      <div className="flex justify-between">
        <p className="text-primary font-bold">Invitation code: 000409</p>
        <div className="flex items-center gap-2">
          <Image src={periodIcon} alt="period" width={22} />
          2025 Spring
        </div>
      </div>
      <KatexContent
        content={group.description}
        classname="prose mb-4 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
      />
    </main>
  )
}
