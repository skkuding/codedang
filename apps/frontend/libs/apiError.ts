import type { ApolloError } from '@apollo/client'
import type { HTTPError, TimeoutError } from 'ky'

export class ApiError extends Error {
  public name: string
  public status?: number
  public errorMessage: string
  public responseData?: unknown
  public url: string
  public method?: string

  constructor(name: string, message: string, url: string) {
    super(message)
    this.errorMessage = message
    this.name = name
    this.url = url
  }

  private static statusName: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  }

  private static getErrorName(status: number): string {
    return `${ApiError.statusName[status]} (${status})`
  }

  public static convertHttpError(httpError: HTTPError): ApiError {
    const statusCode = httpError.response.status
    const apiError = new ApiError(
      httpError.name,
      `${ApiError.getErrorName(statusCode)}: ${httpError.request.url}`,
      httpError.request.url
    )
    apiError.status = statusCode
    apiError.responseData = httpError.response.clone().json()
    apiError.method = httpError.request.method
    return apiError
  }

  public static convertTimeoutError(timeoutError: TimeoutError): ApiError {
    const apiError = new ApiError(
      'TimeoutError',
      timeoutError.message,
      timeoutError.request.url
    )
    apiError.method = timeoutError.request.method

    return apiError
  }

  public static convertTimedOutError(timeoutError: Error): ApiError {
    const apiError = new ApiError('TimeoutError', timeoutError.message, '')
    const regex = /Request timed out:\s+(\w+)\s+(https?:\/\/[^\s]+)/
    const match = timeoutError.message.match(regex)

    if (match) {
      apiError.method = match[1]
      apiError.url = match[2]
    }

    return apiError
  }

  public static convertApolloError(apolloError: ApolloError): ApiError {
    const e = apolloError.graphQLErrors[0]
    const apiError = new ApiError(
      apolloError.name,
      e.extensions
        ? `${String(e.extensions.code)}: ${apolloError.message}`
        : '',
      e.path ? String(e.path[0]) : ''
    )
    return apiError
  }
}
