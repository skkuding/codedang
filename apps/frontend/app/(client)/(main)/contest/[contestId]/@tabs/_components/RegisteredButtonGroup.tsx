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
      <Button className="text pointer-events-none h-[48px] w-full rounded-[1000px] bg-[#F0F0F0] font-medium text-[#9B9B9B]">
        Registered
      </Button>
      <Button
        className="bg-primary border-primary h-[46px] w-full rounded-full px-12 py-6 text-[16px] font-bold text-white"
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
