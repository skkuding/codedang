import cover from '@/public/cover.jpg'
import Image from 'next/image'

interface CoverProps {
  title: string
  description: string
}

export default function Cover({ title, description }: CoverProps) {
  return (
    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden">
      <div className="relative z-10 flex w-full items-start justify-center text-white">
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="absolute mt-12 w-fit whitespace-nowrap text-sm opacity-70 md:text-base">
          {description}
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-black/30" />
      <Image
        className="scale-110 object-cover opacity-80 blur-[5px]"
        src={cover}
        alt="Cover Image"
        fill
      />
    </div>
  )
}
