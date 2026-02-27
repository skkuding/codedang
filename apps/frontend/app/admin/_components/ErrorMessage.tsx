import { PiWarningBold } from 'react-icons/pi'

export function ErrorMessage({
  message = 'Required' //default value
}: {
  message?: string
}) {
  return (
    <div className="text-caption4_r_12 flex items-center gap-1 text-red-500">
      <PiWarningBold />
      {message}
    </div>
  )
}
