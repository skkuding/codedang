import { cn } from '@/libs/utils'
import { FaCircleCheck } from 'react-icons/fa6'
import { IoAlertCircle } from 'react-icons/io5'
import { MdInfo } from 'react-icons/md'

interface AuthMessageProps {
  message: string
  type: 'success' | 'error' | 'info'
}
export function AuthMessage({ message, type = 'info' }: AuthMessageProps) {
  return (
    <div
      className={cn(
        'mt-1 flex gap-1 text-xs',
        type === 'error' && 'text-error',
        type === 'success' && 'text-primary',
        type === 'info' && 'text-color-neutral-70'
      )}
    >
      {type === 'success' && (
        <FaCircleCheck className="text-primary h-3.5 w-3.5" />
      )}
      {type === 'info' && (
        <MdInfo className="text-color-neutral-70 h-3.5 w-3.5" />
      )}
      {type === 'error' && <IoAlertCircle className="text-error h-3.5 w-3.5" />}

      {message}
    </div>
  )
}
