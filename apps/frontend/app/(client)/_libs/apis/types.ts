export interface PaginationQueryParams {
  cursor?: number
  take?: number
}

export interface ErrorResponse {
  message: string
  statusCode: number
  error?: string
}
