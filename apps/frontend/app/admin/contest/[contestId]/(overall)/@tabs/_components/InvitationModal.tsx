'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import bulletIcon from '@/public/icons/bullet.svg'
import copyWhiteIcon from '@/public/icons/copy_white.svg'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

interface InvitationModalProps {
  invitationCode: string | null | undefined
  disabled: boolean
  createdByUsername: string | undefined
}

export function InvitationModal({
  invitationCode,
  disabled,
  createdByUsername
}: InvitationModalProps) {
  const [open, setOpen] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode ?? '')
      toast.success('Invitation code successfully copied to clipboard!')
    } catch {
      toast.error('Failed to copy invitation code')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`border-primary text-primary ml-5 h-[46px] w-[111px] border bg-white px-6 py-3 text-base font-medium leading-[22.4px] tracking-[-0.48px] hover:bg-white ${disabled ? 'pointer-events-none' : ''}`}
          type="button"
        >
          Invitation
        </Button>
      </DialogTrigger>
      <DialogContent className="flex !h-[280px] !w-[424px] flex-col !gap-0 !p-10">
        <DialogHeader>
          <DialogTitle className="text-head5_sb_24 text-center text-black">
            Invitation Code
          </DialogTitle>
        </DialogHeader>

        <div className="bg-color-neutral-99 mt-4 flex w-full items-center justify-center rounded-[1000px] px-6 py-3">
          <span className="text-body3_r_16 text-black">{invitationCode}</span>
        </div>

        <div className="mt-2 flex items-center justify-center text-center">
          <Image src={bulletIcon} alt="bullet" width={20} />
          <span className="text-primary text-body2_m_14">Contest Admin</span>
          <span className="text-color-neutral-30 text-body4_r_14 mx-1">:</span>
          <span className="text-color-neutral-30 text-body4_r_14">
            {createdByUsername}
          </span>
        </div>

        <Button
          onClick={handleCopy}
          className="bg-primary mt-[22px] flex h-[46px] w-[344px] items-center justify-center gap-[6px] rounded-[1000px] px-[22px] pb-[11px] pt-[10px]"
          type="button"
        >
          <Image src={copyWhiteIcon} alt="copyWhite" width={20} />
          <span className="text-sub2_m_18 text-white">Copy</span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
