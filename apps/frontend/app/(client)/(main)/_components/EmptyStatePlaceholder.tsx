import { cn } from '@/libs/utils'
import Image from 'next/image'

interface EmptyStatePlaceholderProps {
  title: string
  description: string
  className?: string
  imageWidth?: number
  imageHeight?: number
  titleTopMargin?: string
}

export function EmptyStatePlaceholder({
  title,
  description,
  className,
  imageWidth = 262,
  imageHeight = 262,
  titleTopMargin = 'mt-[50px]'
}: EmptyStatePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded bg-[#d9d9d940]',
        className
      )}
    >
      <Image
        src="/logos/welcomeNobg.png"
        alt="empty state"
        width={imageWidth}
        height={imageHeight}
      />
      <p
        className={cn(
          'text-center text-2xl font-semibold tracking-[-0.72px] text-[#000000]',
          titleTopMargin
        )}
      >
        {title}
      </p>
      <p className="mt-2 text-center text-base font-normal text-[#00000080]">
        {description}
      </p>
    </div>
  )
}
