import { ApolloError } from '@apollo/client'
import { withScope, captureException } from '@sentry/nextjs'
import { HTTPError, TimeoutError } from 'ky'
import { ApiError } from './apiError'

const api = (error: ApiError) => {
  withScope((scope) => {
    scope.setLevel('error')
    scope.setContext('API Error Detail', { ...error })
    captureException(error, scope)
  })
}

const global = (error: Error) => {
  withScope((scope) => {
    scope.setLevel('error')
    scope.setContext('Error Detail', { ...error })
    captureException(error, scope)
  })
}

export const captureError = (e: unknown) => {
  if (e instanceof HTTPError) {
    const apiError = ApiError.convertHttpError(e)
    api(apiError)
  } else if (e instanceof TimeoutError) {
    const apiError = ApiError.convertTimeoutError(e)
    api(apiError)
  } else if (e instanceof ApolloError) {
    const apiError = ApiError.convertApolloError(e)
    api(apiError)
  } else {
    const error = e as Error
    if (error.message.includes('timed out')) {
      const apiError = ApiError.convertTimedOutError(error)
      api(apiError)
    } else {
      global(error)
    }
  }
}
