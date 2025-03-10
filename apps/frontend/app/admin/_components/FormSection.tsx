import { cn } from '@/libs/utils'

export function FormSection({
  children,
  title,
  isLabeled = true,
  isFlexColumn = false
}: {
  children: React.ReactNode | React.ReactNode[]
  title: string
  isLabeled?: boolean
  isFlexColumn?: boolean
}) {
  const isChildrenArray = Array.isArray(children)
  const [badge, content] = isChildrenArray ? children : [null, children]

  return (
    <div
      className={cn(
        'flex w-[641px] justify-between',
        isFlexColumn && 'flex-col'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold">{title}</span>
        {isLabeled && <span className="mt-1 text-red-500">*</span>}
        {badge}
      </div>
      {content}
    </div>
  )
}
