import { queryOptions } from '@tanstack/react-query'
import {
  getContestSubmissionList,
  getProblemSubmissionList,
  type GetContestSubmissionListRequest,
  type GetProblemSubmissionListRequest
} from '../apis/submission'

export const submissionQueries = {
  all: () => ['submission'] as const,
  problemLists: (problemId: number) =>
    [...submissionQueries.all(), 'list', 'problem', problemId] as const,
  problemList: ({ problemId, ...params }: GetProblemSubmissionListRequest) =>
    queryOptions({
      queryKey: [...submissionQueries.problemLists(problemId), params] as const,
      queryFn: () => getProblemSubmissionList({ problemId, ...params })
    }),
  contestLists: (contestId: number) =>
    [...submissionQueries.all(), 'list', 'contest', contestId] as const,
  contestList: ({ contestId, ...params }: GetContestSubmissionListRequest) =>
    queryOptions({
      queryKey: [...submissionQueries.contestLists(contestId), params] as const,
      queryFn: () => getContestSubmissionList({ contestId, ...params })
    })
}
