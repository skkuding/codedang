export default function FormSection({
  children,
  title,
  isLabled = true
}: {
  children: React.ReactNode
  title: string
  isLabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <div>
        <span className="font-bold">{title} </span>
        {isLabled && <span className="text-red-500">*</span>}
      </div>
      {children}
    </div>
  )
}
