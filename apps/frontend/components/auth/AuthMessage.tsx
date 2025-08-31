import { cn } from '@/libs/utils'
import successIcon from '@/public/icons/check-blue.svg'
import errorIcon from '@/public/icons/info.svg'
import Image from 'next/image'

interface AuthMessageProps {
  message: string
  isError?: boolean
}
export function AuthMessage({ message, isError = false }: AuthMessageProps) {
  return (
    <div
      className={cn(
        'mt-1 flex gap-1 text-xs',
        isError ? 'text-error' : 'text-primary'
      )}
    >
      <Image
        src={isError ? errorIcon : successIcon}
        alt={isError ? 'Error' : 'Success'}
        width={12.25}
        height={12.25}
      />
      {message}
    </div>
  )
}
