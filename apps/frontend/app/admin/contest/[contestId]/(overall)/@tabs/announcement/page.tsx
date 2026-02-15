'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { use } from 'react'
import { CreateContestAnnouncement } from './_components/CreateContestAnnouncement'
import { UpdateHistoryBox } from './_components/UpdateHistoryBox'

export default function AdminAnnouncementPage(props: {
  params: Promise<{ contestId: string }>
}) {
  const params = use(props.params)
  const contestId = Number(params.contestId)
  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col">
          <CreateContestAnnouncement contestId={contestId} />
          <UpdateHistoryBox contestId={contestId} />
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
