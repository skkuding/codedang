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
          <div className="flex size-9 items-center justify-center">
            <Image
              src={notification}
              alt="Notification"
              width={27}
              height={33}
            />
          </div>
          <p className="text-caption3_r_13 text-color-neutral-40">NOTICE</p>
        </div>
      </Link>
      <Link href={'/contest'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <div className="flex size-9 items-center justify-center">
            <Image src={prize} alt="Prize" width={36} height={36} />
          </div>
          <p className="text-caption3_r_13 text-color-neutral-40">CONTEST</p>
        </div>
      </Link>
      <Link href={'/problem'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <div className="flex size-9 items-center justify-center">
            <Image src={filledfile} alt="filledfile" width={36} height={36} />
          </div>
          <p className="text-caption3_r_13 text-color-neutral-40">PROBLEM</p>
        </div>
      </Link>
      <Link href={'/course'}>
        <div className="flex h-[98px] w-[80px] flex-col items-center justify-center gap-[2px] rounded-sm bg-white hover:shadow-md">
          <div className="flex size-9 items-center justify-center">
            <Image src={graduation} alt="Graduation" width={36} height={36} />
          </div>
          <p className="text-caption3_r_13 text-color-neutral-40">COURSE</p>
        </div>
      </Link>
    </div>
  )
}
