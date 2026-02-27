import { getContestSubmissionList } from '@/app/(client)/_libs/apis/contestSubmission'
import { useQuery } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()
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
          toast(t('accepted_toast'), {
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
          toast(t('wrong_answer_toast'), {
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
          toast(t('compile_error_toast'), {
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
          toast(t('server_error_toast'), {
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
  }, [submissionList, enabled, t])
}

export { useSubmissionPolling }
