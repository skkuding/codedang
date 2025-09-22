'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { safeFetcherWithAuth } from '@/libs/utils'
import warningIcon from '@/public/icons/info.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

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
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent className="flex h-[300px] w-[424px] flex-col items-center justify-center rounded-2xl p-[40px]">
          <AlertDialogHeader className="flex flex-col items-center justify-center">
            <Image src={warningIcon} alt="warning" width={42} height={42} />
            <AlertDialogTitle className="w-full text-center text-2xl font-semibold">
              Cancel Registration?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <p className="w-full whitespace-pre-wrap text-center text-sm font-normal text-[#737373]">
              Do you really want to cancel your registration?
              <br />
              You’ll need to register again if you change your mind.
            </p>
          </AlertDialogDescription>
          <AlertDialogFooter className="flex w-full justify-center gap-[4px]">
            <AlertDialogCancel className="h-[46px] w-full">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={() => clickUnregister(id)}
                className="bg-error h-[46px] w-full hover:bg-red-500/90"
                variant="default"
              >
                Cancel
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
