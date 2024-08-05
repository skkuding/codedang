export default function FormSection({
  children,
  title,
  isLabled = true
}: {
  children: React.ReactNode | React.ReactNode[]
  title: string
  isLabled?: boolean
}) {
  const isChildrenArray = Array.isArray(children)
  const [badge, content] = isChildrenArray ? children : [null, children]

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="font-bold">{title}</span>
        {isLabled && <span className="mt-1 text-red-500">*</span>}
        {badge}
      </div>
      {content}
    </div>
  )
}
