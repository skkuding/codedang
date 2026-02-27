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
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationCode ?? '')
      toast.success(t('copy_success_toast'))
    } catch {
      toast.error(t('copy_fail_toast'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`border-primary text-primary ml-5 h-[46px] w-[111px] border bg-white px-6 py-3 text-base font-medium leading-[22.4px] tracking-[-0.48px] hover:bg-white ${disabled ? 'pointer-events-none' : ''}`}
          type="button"
        >
          {t('invitation_button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex !h-[280px] !w-[424px] flex-col !gap-0 !p-10">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold leading-[33.6px] tracking-[-0.72px] text-black">
            {t('invitation_code_title')}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-color-neutral-99 mt-4 flex w-full items-center justify-center rounded-[1000px] px-6 py-3">
          <span className="text-base font-normal leading-[24px] tracking-[-0.48px] text-black">
            {invitationCode}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center text-center">
          <Image src={bulletIcon} alt={t('bullet_icon_alt')} width={20} />
          <span className="text-primary text-sm font-medium leading-[19.6px] tracking-[-0.42px]">
            {t('contest_admin')}
          </span>
          <span className="text-color-neutral-30 mx-1 text-sm font-normal leading-[21px] tracking-[-0.42px]">
            :
          </span>
          <span className="text-color-neutral-30 text-sm font-normal leading-[21px] tracking-[-0.42px]">
            {createdByUsername}
          </span>
        </div>

        <Button
          onClick={handleCopy}
          className="bg-primary mt-[22px] flex h-[46px] w-[344px] items-center justify-center gap-[6px] rounded-[1000px] px-[22px] pb-[11px] pt-[10px]"
          type="button"
        >
          <Image src={copyWhiteIcon} alt={t('copy_button')} width={20} />
          <span className="text-lg font-medium leading-[25.2px] tracking-[-0.54px] text-white">
            {t('copy_button')}
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
