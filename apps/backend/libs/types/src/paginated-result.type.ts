/**
 * Pagination이 적용되는 함수의 반환 타입
 */
export type PaginatedResult<T> = {
  data: T[] // 한 페이지에 필요한 data
  total: number // Pagination과 무관한 전체 데이터의 총 개수 (!== data.length)
}
