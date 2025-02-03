import { cn } from '@/libs/utils'
import codedangBannerBottom from '@/public/logos/codedang-banner-bottom.svg'
import codedangBannerMiddle from '@/public/logos/codedang-banner-middle.svg'
import codedangBannerTop from '@/public/logos/codedang-banner-top.svg'
import Image from 'next/image'

interface CoverProps {
  title: string
  description: string
}

const bgColors: { [key: string]: string } = {
  course: 'bg-gradient-to-r from-[#7460C5] to-[#CAC1EE]'
}

const textColors: { [key: string]: string } = {
  course: 'text-[#7460C5]'
}

const icons: { [key: string]: string } = {
  problem: '/banners/codedang.png',
  notice: '/banners/notice.png',
  contest: '/banners/contest.png',
  course: '/banners/course.png'
}

export function Cover({ title, description }: CoverProps) {
  return (
    <div className="w-screen">
      <div className="absolute left-0 top-0 z-[10] h-14 w-full bg-white" />
      <div
        className={cn(
          bgColors[title.toLowerCase()],
          'z-[-10] flex h-[440px] w-full items-center justify-center'
        )}
      >
        <div className="flex h-full flex-col justify-between">
          <Image src={codedangBannerTop} alt="코드당" width={64} />
          <Image src={codedangBannerBottom} alt="코드당" width={224} />
        </div>
        <div className="flex flex-col">
          <Image src={codedangBannerMiddle} alt="코드당" width={70} />
          <div className="flex-col text-center">
            <h2 className="py-5 font-mono text-4xl font-bold text-white md:text-[56px]">
              {title}
            </h2>
            <div className="rounded-full bg-white px-16 py-1">
              <span className={cn(textColors[title.toLowerCase()])}>
                {description}
              </span>
            </div>
          </div>
        </div>
        <div className="px-32" />

        <div className="relative flex h-screen items-center justify-center max-md:hidden">
          <Image
            src={icons[title.toLowerCase()]}
            width={208}
            height={247}
            alt={title}
            className="absolute right-[50%] top-[40%] flex-shrink-0 rotate-[19.478deg] max-md:hidden"
          />

          <div className="relative z-10 text-center">
            <h1 className="text-6xl font-extrabold text-white">CODEDANG</h1>
            <p className="mt-4 text-2xl text-white">
              SKKU Educational Coding Website
            </p>
          </div>

          <Image
            src={icons[title.toLowerCase()]}
            width={249}
            height={242}
            alt={title}
            className="absolute bottom-[40%] left-[50%] h-[15.13494rem] w-[15.60438rem] flex-shrink-0 rotate-[124.899deg] max-md:hidden"
          />
        </div>
      </div>
    </div>
  )
}
