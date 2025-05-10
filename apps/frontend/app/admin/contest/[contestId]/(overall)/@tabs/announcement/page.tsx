'use client'

import { ConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { CreateContestAnnouncement } from './_components/CreateContestAnnouncement'
import { UpdateHistoryBox } from './_components/UpdateHistoryBox'

export default function AdminAnnouncementPage({
  params
}: {
  params: { contestId: string }
}) {
  const contestId = Number(params.contestId)
  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col">
          <UpdateHistoryBox contestId={contestId} />
          <CreateContestAnnouncement contestId={contestId} />
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
