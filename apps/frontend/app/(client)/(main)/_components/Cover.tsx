import { cn } from '@/libs/utils'
import Image from 'next/image'

interface CoverProps {
  title: string
  description: string
}

const bgColors: { [key: string]: string } = {
  contest: 'bg-linear-to-b from-[#7BD9D3] to-[#A7A5A1]',
  problem: 'bg-linear-to-b from-[#5861B7] to-[#99978E]',
  notice: 'bg-linear-to-b from-[#2F4672] to-[#4671B3]'
}

const icons: { [key: string]: string } = {
  problem: '/banners/codedang.png',
  notice: '/banners/notice.png',
  contest: '/banners/contest.png'
}

/**
 * @param title - title text
 * @param description - description text

 */
export function Cover({ title, description }: CoverProps) {
  return (
    <div className="w-screen">
      <div className="absolute left-0 top-0 z-10 h-14 w-full bg-white" />
      <div
        className={cn(
          bgColors[title.toLowerCase()],
          'z-[-10] flex h-[200px] w-full items-center justify-center'
        )}
      >
        <Image
          src={icons[title.toLowerCase()]}
          width={280}
          height={280}
          alt={title}
          className="max-md:hidden"
        />
        <div className="flex-col text-center md:px-20">
          <h2 className="py-5 font-mono text-4xl font-bold text-white md:text-[56px]">
            {title}
          </h2>
          <p className="whitespace-nowrap text-sm text-white/80 md:text-base">
            {description}
          </p>
        </div>
        <Image
          src={icons[title.toLowerCase()]}
          width={280}
          height={280}
          alt={title}
          className="rotate-180 max-md:hidden"
        />
      </div>
      <div className="h-16 w-full bg-white" />
    </div>
  )
}
