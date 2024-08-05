import { cn } from '@/lib/utils'

interface CoverProps {
  title: string
  description: string
}

const bgImage: { [key: string]: string } = {
  problem: 'bg-[url(/problembanner.svg)]',
  notice: 'bg-[url(/noticebanner.svg)]',
  contest: 'bg-[url(/contestbanner.svg)]'
}

/**
 * @param title - title text
 * @param description - description text
 * @param bgColor - tailwindcss color class (e.g. "bg-gray-500")
 */
export default function Cover({ title, description }: CoverProps) {
  return (
    <div className="flex-col">
      <div className="absolute top-0 h-16 w-full bg-white" />
      <div
        className={cn(
          bgImage[title.toLowerCase()],
          'relative bottom-[55px] z-[-10] mb-[-55px] flex h-[285px] w-screen items-center justify-center bg-cover bg-center bg-no-repeat'
        )}
      >
        <div className="w-full flex-col text-center">
          <h2 className="py-5 font-mono text-4xl font-bold text-white md:text-[56px]">
            {title}
          </h2>
          <p className="whitespace-nowrap text-sm text-white/80 md:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
