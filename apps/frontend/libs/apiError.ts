import type { HTTPError, TimeoutError } from 'ky'

export class KyApiError extends Error {
  public name: string
  public statusCode: number
  public responseData: unknown
  public url?: string
  public method?: string
  public params?: unknown

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = KyApiError.getErrorName(this.statusCode)
  }

  private static errorMap: Record<number, string> = {
    /* eslint-disable @typescript-eslint/naming-convention */
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
    return `${KyApiError.errorMap[status]} (${status})`
  }

  /**
   * @description
   * Ky의 HTTPError에서 필요한 정보를 추출하여 ApiError로 변환합니다.
   */
  public static fromHttpError(httpError: HTTPError): KyApiError {
    const statusCode = httpError.response.status
    // params: error.params

    const apiError = new KyApiError(
      KyApiError.getErrorName(statusCode),
      statusCode
    )
    apiError.name = httpError.name
    apiError.statusCode = httpError.response.status
    apiError.responseData = httpError.response
      .clone()
      .json()
      .catch(() => null)
    apiError.url = httpError.request.url
    apiError.method = httpError.request.method

    return apiError
  }

  /**
   * @description
   * Ky의 TimeoutError에서 필요한 정보를 추출하여 ApiError로 변환합니다.
   */
  public static fromTimeoutError(
    timeoutError: TimeoutError,
    requestUrl: string,
    method = 'GET'
  ): KyApiError {
    const apiError = new KyApiError('Request Timeout', 408)
    apiError.url = requestUrl
    apiError.method = method
    return apiError
  }
}
