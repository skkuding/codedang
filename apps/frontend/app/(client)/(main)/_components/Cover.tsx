import { cn } from '@/libs/utils'
import Image from 'next/image'

interface CoverProps {
  title: string
  description: string
}

const bgColors: { [key: string]: string } = {
  contest: 'bg-linear-to-r from-white via-white to-[#7EAFFF]',
  problem: 'bg-linear-to-r from-white via-white to-[#D1A9E7]',
  notice: 'bg-linear-to-r from-white via-white to-[#6976FF]',
  course: 'bg-linear-to-r from-white via-white to-[#AD96FF]'
}

const bgImg: { [key: string]: string } = {
  contest: '/banners/contestInnerBanner.png',
  problem: '/banners/problemInnerBanner.png',
  notice: '/banners/noticeInnerBanner.png',
  course: '/banners/courseInnerBanner.png'
}

/**
 * @param title - title text
 * @param description - description text

 */
export function Cover({ title, description }: CoverProps) {
  return (
    <div className="w-screen">
      <div
        className={cn(
          bgColors[title.toLowerCase()],
          'relative z-[-10] flex h-[344px] w-full justify-center'
        )}
      >
        <Image
          src={bgImg[title.toLowerCase()]}
          alt={title}
          className="absolute"
          fill
          priority
        />
        <div className="absolute z-10 justify-self-center pb-[91px] pt-[157px] text-center md:w-[1440px] md:flex-col md:items-center md:pl-[240.12px] md:pr-[838px] md:text-left">
          <Image
            src={'/logos/codedang-rotated.svg'}
            width={92.6}
            height={70.14}
            alt={title}
            className="absolute top-1/3 md:left-[194px] md:top-[115]"
          />
          <div>
            <h2 className="text-[50px] font-bold text-white">{title}</h2>
            <p className="whitespace-nowrap text-xl font-medium text-white/80">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
