'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/shadcn/dialog'
import infoIcon from '@/public/icons/info-icon.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface WelcomeModalProps {
  open: boolean
  onClose: () => void
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const router = useRouter()

  const handleLater = () => {
    onClose()
    router.push('/login')
  }

  const handleLinkSns = () => {
    onClose()
    router.push('/settings')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleLater()}>
      <DialogContent className="flex w-[408px] flex-col gap-6 rounded-2xl p-8 pt-8">
        <div className="flex flex-col gap-2">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-full">
            <Image src={infoIcon} alt="info" width={20} height={20} />
          </div>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-head5_sb_24 text-color-neutral-0">
              어서오세요, 코드당에!
            </DialogTitle>
            <DialogDescription className="text-body1_m_16 text-color-neutral-30">
              설정에서 SNS를 연동해서 간편하게 로그인 할 수 있어요
            </DialogDescription>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLater}
            className="border-primary-light text-primary text-sub3_sb_16 h-[46px] flex-1 rounded-xl border-[1.4px] bg-white px-5 py-[13px]"
          >
            나중에 하기
          </button>
          <button
            type="button"
            onClick={handleLinkSns}
            className="bg-primary text-sub3_sb_16 h-[46px] flex-1 rounded-xl px-5 py-[13px] text-white"
          >
            SNS 연동하러 가기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
