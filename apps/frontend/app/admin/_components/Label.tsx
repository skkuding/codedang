export function Label({
  children,
  required = true
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <span className="text-lg font-semibold">{children} </span>
      {required && <span className="text-red-500">*</span>}
    </div>
  )
}
