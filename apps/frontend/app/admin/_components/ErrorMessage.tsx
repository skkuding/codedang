import { PiWarningBold } from 'react-icons/pi'

export default function ErrorMessage({
  message = 'required' //default value
}: {
  message?: string
}) {
  return (
    <div className="flex items-center gap-1 text-xs text-red-500">
      <PiWarningBold />
      {message}
    </div>
  )
}
