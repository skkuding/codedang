'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useApolloClient } from '@apollo/client'
import { useParams } from 'next/navigation'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { InviteByCode } from './InviteByCode'
import { InviteManually } from './InviteManually'

export function InviteUserButton() {
  const client = useApolloClient()
  const { courseId } = useParams<{ courseId: string }>()

  const refetchGroupMembers = () => {
    client.refetchQueries({
      include: [GET_GROUP_MEMBERS]
    })
  }

  return (
    <Modal
      size="lg"
      type="custom"
      title="Invite Member"
      headerDescription="Invite members to your course by email or invite code."
      onOpenChange={refetchGroupMembers}
      trigger={
        <Button type="button" variant="default" className="w-[120px]">
          <HiMiniPlusCircle className="mr-2 h-5 w-5" />
          <span className="text-lg">Invite</span>
        </Button>
      }
    >
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col gap-6">
          <InviteByCode courseId={courseId} />
          <InviteManually courseId={courseId} />
        </div>
      </ScrollArea>
    </Modal>
  )
}
