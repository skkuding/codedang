import { getContestSubmissionList } from '@/app/(client)/_libs/apis/contestSubmission'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface UseSubmissionPollingProps {
  contestId: number | undefined
  problemId: number
  enabled: boolean
}

const submissionResults = [
  'Accepted',
  'WrongAnswer',
  'CompileError',
  'ServerError'
]

const useSubmissionPolling = ({
  contestId,
  problemId,
  enabled
}: UseSubmissionPollingProps) => {
  contestId = contestId ? contestId : 0

  const { data: submissionList } = useQuery({
    queryKey: ['submission', 'contest', contestId, problemId, 'list'],
    queryFn: () => getContestSubmissionList({ contestId, problemId }),
    refetchInterval: 2000,
    enabled: Boolean(contestId) && Boolean(problemId) && enabled
  })

  useEffect(() => {
    if (!enabled || !submissionList) {
      return
    }
    const submissionResult = submissionList.data[0].result

    setTimeout(() => {
      switch (submissionResult) {
        case submissionResults[0]:
          toast('🎉 Accepted', {
            style: {
              background: '#EBFAEF',
              color: '#1F7936',
              fontSize: '16px',
              width: '124px',
              height: '44px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          })
          break
        case submissionResults[1]:
          toast('🤔 WrongAnswer', {
            style: {
              background: '#FFECEA',
              color: '#B80901',
              fontSize: '16px',
              width: '160px',
              height: '44px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          })
          break
        case submissionResults[2]:
          toast('🤔 CompileError', {
            style: {
              borderRadius: '8px',
              background: '#FFECEA',
              color: '#B80901',
              fontSize: '16px',
              width: '153px',
              height: '44px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          })
          break
        case submissionResults[3]:
          toast('🤔 ServerError', {
            style: {
              background: '#FFECEA',
              color: '#B80901',
              fontSize: '16px',
              width: '141px',
              height: '44px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          })
          break
        default:
          break
      }
    }, 1200)
  }, [submissionList, enabled])
}

export { useSubmissionPolling }
