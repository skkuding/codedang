import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import GrayUploadIcon from '@/public/icons/upload-gray.svg'
import WhiteUploadIcon from '@/public/icons/upload-white.svg'
import { XIcon } from 'lucide-react'
import Image from 'next/image'

export function UploadButton({ disabled }: { disabled: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={!disabled}
          className="itmes-center border-primary-light bg-primary! hover:bg-primary-strong! disabled:border-color-neutral-95 disabled:bg-color-neutral-95! flex h-12 gap-[6px] rounded-lg border-[1.4px] bg-white px-5 py-[13px]"
        >
          <Image
            src={disabled ? WhiteUploadIcon : GrayUploadIcon}
            alt="upload icon"
            width={20}
            height={20}
          />
          <p
            className={cn(
              'text-sub3_sb_16',
              !disabled ? 'text-color-neutral-70' : 'text-white'
            )}
          >
            문제 업로드
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent hideCloseButton={true} className="w-[800px] px-7 py-10">
        <DialogHeader>
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-head3_sb_28">문제를 업로드 하시겠습니까?</p>
              <p className="text-color-cool-neutral-40 text-body2_m_14">
                작성한 문제와 테스트 데이터를 서버로 전송하여 문제를 공개합니다
              </p>
            </div>
            <Button type="button" variant={'ghost'} className="h-fit p-1">
              <XIcon />
            </Button>
          </div>
          <Separator className="my-5" />
        </DialogHeader>
        <div className="text-body4_r_14">contents</div>
        <DialogFooter>footer</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
