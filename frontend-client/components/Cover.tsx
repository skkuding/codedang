import { cn } from '@/lib/utils'

interface CoverProps {
  title: string
  description: string
  bgColor: string
}
/**
 * @param title - title text
 * @param description - description text
 * @param bgColor - tailwindcss color class (e.g. "bg-gray-500")
 */
export default function Cover({ title, description, bgColor }: CoverProps) {
  return (
    <div
      className={cn(
        bgColor,
        'relative flex h-[200px] w-screen items-center justify-center overflow-hidden'
      )}
    >
      <div className="relative z-10 flex w-full items-start justify-center">
        <h2 className="text-4xl font-bold text-white">{title}</h2>
        <p className="absolute mt-12 w-fit whitespace-nowrap text-base text-gray-50">
          {description}
        </p>
      </div>
    </div>
  )
}
