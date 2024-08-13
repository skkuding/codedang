import { cn } from '@/lib/utils'
import Image from 'next/image'

interface CoverProps {
  title: string
  description: string
}

const bgColors: { [key: string]: string } = {
  contest: 'bg-gradient-to-b from-[#7BD9D3] to-[#A7A5A1]',
  problem: 'bg-gradient-to-b from-[#5861B7] to-[#6A8E8C]',
  notice: 'bg-gradient-to-b from-[#2F4672] to-[#4671B3]'
}

const icons: { [key: string]: string } = {
  problem: '/codedang-icon.png',
  notice: '/notice-icon.png',
  contest: '/contest-icon.png'
}

/**
 * @param title - title text
 * @param description - description text

 */
export default function Cover({ title, description }: CoverProps) {
  return (
    <div className="flex-col">
      <div className="absolute top-0 z-[10] h-16 w-full bg-white" />
      <div
        className={cn(
          bgColors[title.toLowerCase()],
          'z-[-10] flex h-[200px] w-screen items-center justify-center'
        )}
      >
        <Image
          src={icons[title.toLowerCase()]}
          width={280}
          height={280}
          alt={title}
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
          className="rotate-180"
        />
      </div>
      <div className="h-16 w-full bg-white" />
    </div>
  )
}
