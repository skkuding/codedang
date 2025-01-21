import { ApolloError } from '@apollo/client'
import { withScope, captureException } from '@sentry/nextjs'
import { HTTPError, TimeoutError } from 'ky'
import { ApiError } from './apiError'

const captureAPIError = (error: ApiError) => {
  withScope((scope) => {
    scope.setLevel('error')
    scope.setContext('API Error Detail', { ...error })
    captureException(error, scope)
  })
}

const captureGlobalError = (error: Error) => {
  withScope((scope) => {
    scope.setLevel('error')
    scope.setContext('Error Detail', { ...error })
    captureException(error, scope)
  })
}

export const captureError = (e: unknown) => {
  if (e instanceof HTTPError) {
    const apiError = ApiError.convertHttpError(e)
    captureAPIError(apiError)
  } else if (e instanceof TimeoutError) {
    const apiError = ApiError.convertTimeoutError(e)
    captureAPIError(apiError)
  } else if (e instanceof ApolloError) {
    const apiError = ApiError.convertApolloError(e)
    captureAPIError(apiError)
  } else if (e instanceof Error) {
    if (e.message.includes('timed out')) {
      const apiError = ApiError.convertTimedOutError(e)
      captureAPIError(apiError)
    } else {
      captureGlobalError(e)
    }
  } else {
    return
  }
}
