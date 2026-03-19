import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import GrayFileIcon from '@/public/icons/file_gray.svg'
import GrayUploadIcon from '@/public/icons/upload-gray.svg'
import WhiteUploadIcon from '@/public/icons/upload-white.svg'
import XIcon from '@/public/icons/x.svg'
import Image from 'next/image'
import styles from '../style.module.css'

export function UploadButton({
  disabled,
  upload_target_texts
}: {
  disabled: boolean
  upload_target_texts: string[]
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
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
      <DialogContent
        hideCloseButton={true}
        className="w-[800px] gap-0 px-7 py-10"
      >
        <DialogHeader>
          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-head3_sb_28">
                문제를 업로드 하시겠습니까?
              </DialogTitle>
              <DialogDescription className="text-color-cool-neutral-40 text-body2_m_14">
                작성한 문제와 테스트 데이터를 서버로 전송하여 문제를 공개합니다
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button type="button" variant={'ghost'} className="h-fit p-1">
                <Image src={XIcon} alt="x icon" width={32} />
              </Button>
            </DialogClose>
          </div>
          <Separator className="my-5" />
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sub1_sb_18">최종 업로드 대상</p>
          <div className="border-1 border-color-cool-neutral-90 bg-color-neutral-99 h-[190px] rounded-lg px-4">
            <div
              className={cn(
                styles.container,
                'flex max-h-full flex-col gap-2 overflow-auto py-4'
              )}
            >
              {upload_target_texts.map((v, idx) => (
                <div className="flex items-center gap-2" key={idx}>
                  <Image
                    src={GrayFileIcon}
                    alt="gray file icon"
                    height={20}
                    width={20}
                  />
                  <p className="text-color-neutral-30 text-body3_r_16">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-7 flex">
          <DialogClose asChild>
            <Button
              type="button"
              className="itmes-center border-primary-light hover:bg-color-blue-95 h-12 w-[160px] rounded-lg border-[1.4px] bg-white px-5 py-[13px]"
            >
              <p className="text-sub3_sb_16 text-primary">취소하기</p>
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="itmes-center border-primary hover:bg-primary-strong bg-primary h-12 w-[160px] rounded-lg border-[1.4px] px-5 py-[13px]"
          >
            <p className="text-sub3_sb_16 text-white">업로드하기</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
