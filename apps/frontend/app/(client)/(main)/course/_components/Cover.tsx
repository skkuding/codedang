import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import Image from 'next/image'
import { FaArrowRightLong } from 'react-icons/fa6'

interface CoverProps {
  title: string
  welcomeText: string
  mainText: string
  buttonText: string
}

interface OvalIconProps {
  position: string
  transform: string
  additionalClasses?: string
}

const bgColors: { [key: string]: string } = {
  course: 'bg-gradient-to-r from-[#E9D0FF] via-[#DAB5FF] to-[#C9F]'
}

const titleTextColors: { [key: string]: string } = {
  course: 'text-[#3E29A0]'
}

const gradientTextColors: { [key: string]: string } = {
  course:
    'bg-gradient-to-r from-[#1D124A] via-[#3B2699] via-[#5942D7] to-[#5C3CCF] bg-clip-text text-transparent' // 그라디언트 보조 텍스트 색상
}

const icons: { [key: string]: string } = {
  course: '/banners/book.png'
}

export function Cover({
  title,
  welcomeText,
  mainText,
  buttonText
}: CoverProps) {
  return (
    <div className="w-screen">
      <div className="absolute left-0 top-0 z-[10] h-14 w-full bg-white" />

      <div
        className={cn(
          bgColors[title.toLowerCase()],
          'relative z-[-10] flex h-[440px] items-center justify-center gap-20'
        )}
      >
        <div className="relative top-[5%] z-10 flex flex-col items-start">
          <span
            className={cn(titleTextColors[title.toLowerCase()], 'text-2xl')}
          >
            {welcomeText}
          </span>
          <div
            className={cn(
              gradientTextColors[title.toLowerCase()],
              'my-5 text-4xl font-bold'
            )}
          >
            <p>CODEDANG</p>
            <p>{mainText}</p>
          </div>
          <Button variant="slate">
            <div
              className={cn(
                titleTextColors[title.toLowerCase()],
                'flex items-center gap-2 rounded-full border border-purple-950 px-5 py-2'
              )}
            >
              <span className="font-semibold">{buttonText}</span>
              <FaArrowRightLong />
            </div>
          </Button>
        </div>
        <Image
          src={icons[title.toLowerCase()]}
          className="relative left-[10%] top-[5%] z-10"
          alt="banner"
          width={450}
          height={387}
          priority
        />
        <OvalIcon
          position="left-[10%] -top-[50%]"
          additionalClasses="w-[600px] h-[600px] scale-y-[0.7]"
          transform="rotate-[340deg]"
        />
        <OvalIcon
          position="right-[1%] top-[0%]"
          additionalClasses="w-[1000px] h-[1000px] scale-y-[0.7]"
          transform="rotate-[170deg]"
        />
      </div>
    </div>
  )
}

function OvalIcon({ position, transform, additionalClasses }: OvalIconProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full',
        position,
        additionalClasses,
        transform
      )}
      style={{
        background: `linear-gradient(12deg, rgba(255, 255, 255, 0.47) 8.44%, rgba(255, 255, 255, 0.00) 75.57%)`
      }}
    />
  )
}
