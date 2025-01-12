import { withScope, setContext, captureException } from '@sentry/nextjs'
import { HTTPError, TimeoutError } from 'ky'
import { KyApiError } from './apiError'

/**
 * @description Ky 기반 API 오류를 감지하고 Sentry로 로깅합니다.
 */
export const checkKyError = (e: HTTPError | TimeoutError | Error) => {
  if (e instanceof HTTPError) {
    const apiError = KyApiError.fromHttpError(e)
    sentryHandler.api(apiError)
  } else if (e instanceof TimeoutError) {
    const apiError = KyApiError.fromTimeoutError(e, 'unknown')
    sentryHandler.api(apiError)
  } else {
    sentryHandler.global(e as Error)
  }
}

/**
 * @description API 오류를 Sentry로 기록
 */
const api = (error: KyApiError) => {
  withScope((scope) => {
    scope.setLevel('fatal')

    setContext('🔥 API Request Detail 🔥', {
      name: error.name,
      statusCode: error.statusCode,
      responseData: error.responseData,
      url: error.url,
      method: error.method
      //params: error.params
    })
    captureException(error)
  })
}

/**
 * @description 전역 오류를 Sentry로 기록
 */
const global = (error: Error) => {
  const time = new Date()

  withScope((scope) => {
    scope.setLevel('info')

    setContext('🔥 Global Error Detail 🔥', {
      message: error.message,
      stack: error.stack,
      time: time.toISOString()
    })

    captureException(error)
  })
}

export const sentryHandler = {
  api,
  global
}
