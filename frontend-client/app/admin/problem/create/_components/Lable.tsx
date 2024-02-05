export default function Label({
  children,
  required = true
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="mb-1 mt-6">
      <span className="font-bold">{children} </span>
      {required && <span className="text-red-500">*</span>}
    </div>
  )
}
