'use client'

import { Button } from '@/components/shadcn/button'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertModal } from './AlertModal'

interface UnregisteredButtonGroupProps {
  id: string
  state: string
}

export function RegisteredButtonGroup({
  id,
  state
}: UnregisteredButtonGroupProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const clickUnregister = async (contestId: string) => {
    try {
      await safeFetcherWithAuth.delete(`contest/${contestId}/participation`)
      toast.success(`Unregistered ${state} contest successfully`)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(
        state === 'Upcoming'
          ? 'Failed to unregister'
          : `Cannot unregister ${state} contest`
      )
    }
  }

  return (
    <div className="flex gap-[10px]">
      <Button className="pointer-events-none h-[46px] flex-1 rounded-full bg-[#F0F0F0] text-base font-medium tracking-[-0.03em] text-[#9B9B9B]">
        Registered
      </Button>
      <Button
        className="bg-primary border-primary h-[46px] flex-1 rounded-full text-base font-medium tracking-[-0.03em] text-white"
        onClick={() => setModalOpen(true)}
      >
        Cancel Registration
      </Button>
      <AlertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Cancel Registration?"
        description={
          'Do you really want to cancel your registration?\nYou’ll need to register again if you change your mind.'
        }
        primaryButton={{
          text: 'Confirm',
          onClick: () => clickUnregister(id)
        }}
      />
    </div>
  )
}
