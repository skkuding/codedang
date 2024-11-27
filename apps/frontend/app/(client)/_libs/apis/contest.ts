import { safeFetcherWithAuth } from '@/libs/utils'
import type { ContestDetail } from '@/types/type'
import { createSafeGETAPIResquestFunction } from './utils'

interface GetContestDetailRequest {
  contestId: number
  withAuth?: boolean
}

interface GetContestDetailResponse extends ContestDetail {}

export const getContestDetail = async ({
  contestId
}: GetContestDetailRequest) => {
  const response = await safeFetcherWithAuth.get(`contest/${contestId}`)
  return await response.json<GetContestDetailResponse>()
}

export const safeGetContestDetail =
  createSafeGETAPIResquestFunction(getContestDetail)
