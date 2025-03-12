import { Button, type ButtonProps } from '@/components/shadcn/button'
import { useSession } from '@/libs/hooks/useSession'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useCodeStore } from '@/stores/editor'
import type { TestcaseItem } from '@/types/type'
import { useMutation } from '@tanstack/react-query'
import { IoPlayCircleOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

interface RunTestButtonProps extends ButtonProps {
  problemId: number
  language: string
  setIsSubmitting: (state: boolean) => void
  saveCode: (code: string) => void
}

export function RunTestButton({
  problemId,
  language,
  saveCode,
  setIsSubmitting,
  ...props
}: RunTestButtonProps) {
  const session = useSession()
  const setIsTesting = useTestPollingStore((state) => state.setIsTesting)
  const startPolling = useTestPollingStore((state) => state.startPolling)
  const showSignIn = useAuthModalStore((state) => state.showSignIn)
  const getCode = useCodeStore((state) => state.getCode)
  const getUserTestcases = useTestcaseStore((state) => state.getUserTestcases)

  const { mutate } = useMutation({
    mutationFn: ({
      code,
      testcases
    }: {
      code: string
      testcases: TestcaseItem[]
    }) =>
      Promise.all([
        safeFetcherWithAuth.post('submission/test', {
          json: {
            language,
            code: [
              {
                id: 1,
                text: code,
                locked: false
              }
            ]
          },
          searchParams: {
            problemId
          },
          next: {
            revalidate: 0
          }
        }),
        safeFetcherWithAuth.post('submission/user-test', {
          json: {
            language,
            code: [
              {
                id: 1,
                text: code,
                locked: false
              }
            ],
            userTestcases: testcases.map((testcase) => ({
              id: testcase.id,
              in: testcase.input,
              out: testcase.output
            }))
          },
          searchParams: {
            problemId
          },
          next: {
            revalidate: 0
          }
        })
      ]),
    onSuccess: (_, { code }) => {
      saveCode(code)
      startPolling()
    },
    onError: (error) => {
      setIsTesting(false)
      if (isHttpError(error) && error.response.status === 401) {
        showSignIn()
        toast.error('Log in first to test your code')
      } else {
        toast.error('Please try again later.')
      }
    }
  })

  const submitTest = () => {
    const code = getCode()
    const testcases = getUserTestcases()

    if (session === null) {
      showSignIn()
      toast.error('Log in first to test your code')
      return
    }

    if (code === '') {
      toast.error('Please write code before test')
      return
    }

    setIsTesting(true)
    mutate({ code, testcases })
  }

  return (
    <Button
      variant="secondary"
      className="h-8 shrink-0 gap-1 rounded-[4px] border-none bg-[#D7E5FE] px-2 font-normal text-[#484C4D] hover:bg-[#c6d3ea]"
      onClick={submitTest}
      {...props}
    >
      <IoPlayCircleOutline size={22} />
      Test
    </Button>
  )
}
