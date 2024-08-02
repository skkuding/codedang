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
    <div
      className={cn(
        bgImage[title.toLowerCase()],
        'relative bottom-[55px] z-[-10] mb-[-55px] flex h-[285px] w-screen items-center justify-center bg-cover bg-center bg-no-repeat'
      )}
    >
      <div className="w-full flex-col justify-center text-center">
        <h2 className="font-mono text-[56px] font-bold text-white">{title}</h2>
        <p className="whitespace-nowrap text-base text-white/80">
          {description}
        </p>
      </div>
    </div>
  )
}
