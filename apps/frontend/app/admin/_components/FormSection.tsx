import { cn } from '@/libs/utils'

interface FormSectionProps {
  children: React.ReactNode | React.ReactNode[]
  title: string
  isLabeled?: boolean
  isFlexColumn?: boolean
}

export function FormSection({
  children,
  title,
  isLabeled = true,
  isFlexColumn = false
}: FormSectionProps) {
  const isChildrenArray = Array.isArray(children)
  const [badge, content] = isChildrenArray ? children : [null, children]

  return (
    <div
      className={cn(
        'flex w-full justify-between',
        isFlexColumn && 'flex-col gap-[18px]'
      )}
    >
      <div className="flex items-center gap-3 text-lg">
        <span className="font-semibold">{title}</span>
        {isLabeled && <span className="mt-1 text-red-500">*</span>}
        {badge}
      </div>
      {content}
    </div>
  )
}
