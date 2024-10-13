import { cn } from '@/lib/utils'
import { IoWarningOutline } from 'react-icons/io5'

export default function InputMessage(
  message?: string,
  type: 'error' | 'description' | 'available' = 'error'
) {
  return (
    <div
      className={cn(
        'inline-flex items-center text-xs',
        type === 'error'
          ? 'text-red-500'
          : type === 'description'
            ? 'text-gray-700'
            : 'text-primary'
      )}
    >
      {message === 'Required' && <IoWarningOutline />}
      <p
        className={cn(
          message === 'Required' && 'pl-1',
          'whitespace-pre-wrap text-[11px]'
        )}
      >
        {message}
      </p>
    </div>
  )
}
