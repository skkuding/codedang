import { safeFetcher } from '@/libs/utils'

interface GetContestProps {
  contestId: number
}
interface Contest {
  id: number
  title: string
  startTime: Date
  endTime: Date
  freezeTime: Date
}
export const getContest = async ({ contestId }: GetContestProps) => {
  const response = await safeFetcher.get(`contest/${contestId}`)

  const data = await response.json<Contest>()
  return data
}
