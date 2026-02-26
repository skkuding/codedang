import { Button, type ButtonProps } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { useSession } from '@/libs/hooks/useSession'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { cn } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useCodeStore } from '@/stores/editor'
import { useTestcaseTabStore, TESTCASE_RESULT_TAB } from '@/stores/editorTabs'
import type { TestcaseItem } from '@/types/type'
import { useMutation } from '@tanstack/react-query'
import { IoPlayCircleOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

interface RunTestButtonProps extends ButtonProps {
  problemId: number
  language: string
  saveCode: (code: string) => void
  className?: string
}

export function RunTestButton({
  problemId,
  language,
  saveCode,
  className,
  ...props
}: RunTestButtonProps) {
  const session = useSession()
  const setIsTesting = useTestPollingStore((state) => state.setIsTesting)
  const startPolling = useTestPollingStore((state) => state.startPolling)
  const showSignIn = useAuthModalStore((state) => state.showSignIn)
  const getCode = useCodeStore((state) => state.getCode)
  const getUserTestcases = useTestcaseStore((state) => state.getUserTestcases)
  const setActiveTestcaseTab = useTestcaseTabStore(
    (state) => state.setActiveTab
  )

  const { mutate } = useMutation({
    mutationFn: ({
      code,
      testcases
    }: {
      code: string
      testcases: TestcaseItem[]
    }) => {
      saveCode(code)
      return Promise.all([
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
      ])
    },
    onSuccess: () => {
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
    setActiveTestcaseTab(TESTCASE_RESULT_TAB)

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
    <Tooltip>
      <TooltipTrigger>
        <Button
          size="editor"
          variant="editor"
          className={cn(
            'bg-[#D7E5FE] text-[#484C4D] hover:bg-[#c6d3ea]',
            className
          )}
          onClick={submitTest}
          {...props}
        >
          <IoPlayCircleOutline size={22} />
          Test
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Ctrl/Cmd + Shift + Enter | Test your code with testcases</p>
      </TooltipContent>
    </Tooltip>
  )
}
