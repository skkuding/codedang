interface LabelProps {
  children: React.ReactNode
  required?: boolean
  disabled?: boolean
}

export function Label({
  children,
  required = true,
  disabled = false
}: LabelProps) {
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <span className="text-lg font-semibold">{children} </span>
      {required && <span className="text-red-500">*</span>}
    </div>
  )
}
