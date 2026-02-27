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
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()
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
        toast.error(t('log_in_first_to_test_your_code'))
      } else {
        toast.error(t('try_again_later_error'))
      }
    }
  })

  const submitTest = () => {
    setActiveTestcaseTab(TESTCASE_RESULT_TAB)

    const code = getCode()
    const testcases = getUserTestcases()

    if (session === null) {
      showSignIn()
      toast.error(t('log_in_first_to_test_your_code'))
      return
    }

    if (code === '') {
      toast.error(t('please_write_code_before_test'))
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
          {t('test_button')}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('tooltip_test_your_code')}</p>
      </TooltipContent>
    </Tooltip>
  )
}
