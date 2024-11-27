import { isHttpError } from '@/libs/utils'
import type { ErrorResponse } from './types'

export const isErrorResponse = (
  response: unknown
): response is ErrorResponse => {
  if (typeof response !== 'object' || response === null) return false
  if (!('message' in response)) return false
  if (typeof response.message !== 'string') return false
  if (!('statusCode' in response)) return false
  if (typeof response.statusCode !== 'number') return false
  return true
}

export const createSafeGETAPIResquestFunction = <T, P>(
  fetchData: (params: T) => Promise<P>
) => {
  return async (params: T) => {
    try {
      return await fetchData(params)
    } catch (error) {
      if (isHttpError(error)) {
        const errorResponse = await error.response.json<ErrorResponse>()
        return errorResponse
      }

      throw error // catch this error in the error boundary
    }
  }
}
