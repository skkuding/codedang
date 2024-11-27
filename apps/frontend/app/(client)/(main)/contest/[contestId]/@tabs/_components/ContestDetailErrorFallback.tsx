import type { ErrorResponse } from '@/app/(client)/_libs/apis/types'

interface ContestDetailErrorFallbackProps {
  error: ErrorResponse
}

export function ContestDetailErrorFallback({
  error
}: ContestDetailErrorFallbackProps) {
  let title = 'Something went wrong!'
  let message = ''

  if (error.statusCode === 401) {
    title = 'Log in first to check the problems.'
  }
  if (error.statusCode === 404) {
    title = 'Contest does not exist'
  }
  if (
    error.statusCode === 403 &&
    error.message === 'Cannot access problems before the contest starts.'
  ) {
    title = 'Access Denied'
    message = 'You can access after the contest started'
  }
  if (
    error.statusCode === 403 &&
    error.message === 'Register to access the problems of this contest.'
  ) {
    title = 'Access Denied'
    message = 'Please register first to view the problem list'
  }

  return (
    /**TODO: use common error fallback */
    <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-1 font-mono">
        <p className="text-xl font-semibold">{title}</p>
        {message && <p className="text-gray-500">{message}</p>}
      </div>
    </div>
  )
}
