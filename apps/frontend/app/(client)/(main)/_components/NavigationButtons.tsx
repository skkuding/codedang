import filledfile from '@/public/icons/file_blue.svg'
import graduation from '@/public/icons/graduation_blue.svg'
import notification from '@/public/icons/notification.svg'
import prize from '@/public/icons/prize_blue.svg'
import Image from 'next/image'
import Link from 'next/link'

export function NavigationButtons() {
  return (
    <div className="flex w-full justify-center gap-[5px]">
      <Link href={'/notice'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <Image src={notification} alt="Notification" width={27} height={33} />
          <p className="text-color-neutral-40 text-sm font-medium">NOTICE</p>
        </div>
      </Link>
      <Link href={'/contest'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <Image src={prize} alt="Prize" width={36} height={36} />
          <p className="text-color-neutral-40 text-sm font-medium">CONTEST</p>
        </div>
      </Link>
      <Link href={'/problem'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <Image src={filledfile} alt="filledfile" width={36} height={36} />
          <p className="text-color-neutral-40 text-sm font-medium">PROBLEM</p>
        </div>
      </Link>
      <Link href={'/course'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <Image src={graduation} alt="Graduation" width={36} height={36} />
          <p className="text-color-neutral-40 text-sm font-medium">COURSE</p>
        </div>
      </Link>
    </div>
  )
}
