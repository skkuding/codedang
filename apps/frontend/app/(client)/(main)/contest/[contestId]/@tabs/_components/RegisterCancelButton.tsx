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
import type { ContestPreview, ContestTop } from '@/types/type'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface RegisterCancelButtonProps {
  contest: ContestTop | ContestPreview
  state: string
}

export function RegisterCancelButton({
  contest,
  state
}: RegisterCancelButtonProps) {
  const router = useRouter()
  const [deleteModalFlag, setDeleteModalFlag] = useState<boolean>(false)
  const CancelRegister = async () => {
    try {
      await safeFetcherWithAuth.delete(`contest/${contest.id}/participation`)
      toast.success(`Successfully unregistered for ${state} contest!`)
      router.refresh()
      setDeleteModalFlag(false)
    } catch (error) {
      console.error('Registration cancellation failed:', error)
    }
  }

  const OpenDeleteModal = () => setDeleteModalFlag(true)

  return (
    <>
      <Button
        className={`h-[46px] w-[467px] rounded-[1000px] text-base font-medium leading-[22.4px] tracking-[-0.48px] ${state === 'Upcoming' ? 'bg-primary text-white' : 'bg-fill text-color-neutral-70 pointer-events-none'}`}
        onClick={OpenDeleteModal}
      >
        Cancel registration
      </Button>
      <AlertDialog open={deleteModalFlag} onOpenChange={setDeleteModalFlag}>
        <AlertDialogContent
          className={
            'flex !h-[300px] !w-[424px] flex-col items-center justify-center !rounded-2xl !p-[40px]'
          }
          onEscapeKeyDown={() => setDeleteModalFlag(false)}
        >
          <AlertDialogHeader className="mt-[2px] flex flex-col items-center justify-center">
            <Image src={warningIcon} alt={'warning'} width={42} height={42} />
            <AlertDialogTitle
              className={'w-full text-center text-2xl font-semibold'}
            >
              {'Cancel Registration?'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <p
              className={
                'text-color-neutral-50 w-full whitespace-pre-wrap text-center text-sm font-light leading-[21px] tracking-[-0.42px]'
              }
            >
              {`Do you really want to cancel your registration?\nYou can only re-register before the registration deadline.`}
            </p>
          </AlertDialogDescription>
          <AlertDialogFooter className="flex w-full justify-center gap-[4px]">
            <AlertDialogCancel className="text-color-neutral-60 !m-0 h-[46px] w-[170px] text-base font-medium leading-[22.4px] tracking-[-0.48px]">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={CancelRegister}
                className={
                  'bg-error h-[46px] w-[170px] text-base font-medium leading-[22.4px] tracking-[-0.48px] text-white hover:bg-red-500/90'
                }
                variant={'default'}
              >
                {'Cancel'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
