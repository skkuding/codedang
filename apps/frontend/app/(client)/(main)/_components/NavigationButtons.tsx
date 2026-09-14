import FileIcon from '@/public/icons/file_blue.svg'
import GraduationIcon from '@/public/icons/graduation_blue.svg'
import NotiIcon from '@/public/icons/notification.svg'
import PrizeIcon from '@/public/icons/prize_blue.svg'
import Link from 'next/link'

export function NavigationButtons() {
  return (
    <div className="flex w-full justify-center gap-[5px]">
      <Link href={'/notice'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <NotiIcon className="text-primary h-[33px] w-[27px]" />
          <p className="text-color-neutral-40 text-sm font-medium">NOTICE</p>
        </div>
      </Link>
      <Link href={'/contest'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <PrizeIcon className="text-primary h-9 w-9" />
          <p className="text-color-neutral-40 text-sm font-medium">CONTEST</p>
        </div>
      </Link>
      <Link href={'/problem'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <FileIcon className="text-primary h-9 w-9" />
          <p className="text-color-neutral-40 text-sm font-medium">PROBLEM</p>
        </div>
      </Link>
      <Link href={'/course'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <GraduationIcon className="text-primary h-9 w-9" />
          <p className="text-color-neutral-40 text-sm font-medium">COURSE</p>
        </div>
      </Link>
    </div>
  )
}
