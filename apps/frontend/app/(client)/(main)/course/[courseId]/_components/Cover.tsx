import { cn } from '@/libs/utils'
import Codedang from '@/public/logos/codedang-rotated.svg'
import { getTranslate } from '@/tolgee/server'
import Image from 'next/image'

interface CoverProps {
  title: string
  description: string
}

interface OvalIconProps {
  position: string
  transform: string
  backgroundColor: string
  additionalClasses?: string
}

const bgColors: { [key: string]: string } = {
  course: 'bg-[#F3F7FF]'
}

export async function Cover({ title, description }: CoverProps) {
  const t = await getTranslate()
  return (
    <div className="w-screen">
      <div className="absolute left-0 top-0 z-10 h-14 w-full bg-white" />

      <div
        className={cn(
          bgColors[title.toLowerCase()],
          'relative z-[-10] flex h-[440px] items-center justify-center gap-20 overflow-hidden'
        )}
      >
        <div className="relative right-[25%] top-[10%] z-10 flex flex-col items-start">
          <Image
            src={Codedang}
            className="relative right-[20%]"
            alt="banner"
            width={100}
            height={100}
            priority
          />
          <p className="text-5xl font-semibold text-white">
            {t('course_label')}
          </p>
          <p className="text-xl text-white">{description}</p>
        </div>

        <OvalIcon
          position="left-[1%] -top-[60%]"
          additionalClasses="w-[800px] h-[600px] scale-y-[0.9]"
          transform="rotate-300"
          backgroundColor="bg-[#CC99FF]"
        />
        <OvalIcon
          position="left-[40%] -top-[70%]"
          additionalClasses="w-[700px] h-[400px] scale-y-[0.9]"
          transform="rotate-310"
          backgroundColor="bg-[#D0B5E8]"
        />
        <OvalIcon
          position="left-[12%] top-full"
          additionalClasses="w-[700px] h-[400px] scale-y-[0.9]"
          transform="rotate-310"
          backgroundColor="bg-[#E9DDF4]"
        />

        <OvalIcon
          position="-right-[22%] -top-[20%]"
          additionalClasses="w-[1000px] h-[700px] scale-y-[0.9]"
          transform="rotate-170"
          backgroundColor="bg-[#E9D0FF]"
        />
      </div>
    </div>
  )
}

function OvalIcon({
  position,
  transform,
  additionalClasses,
  backgroundColor
}: OvalIconProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full',
        position,
        additionalClasses,
        transform,
        backgroundColor
      )}
    />
  )
}
