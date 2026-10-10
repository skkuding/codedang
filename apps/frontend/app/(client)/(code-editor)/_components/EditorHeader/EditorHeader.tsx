'use client'

import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { contestProblemQueries } from '@/app/(client)/_libs/queries/contestProblem'
import { contestSubmissionQueries } from '@/app/(client)/_libs/queries/contestSubmission'
import { problemSubmissionQueries } from '@/app/(client)/_libs/queries/problemSubmission'
import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { useSession } from '@/libs/hooks/useSession'
import { fetcherWithAuth } from '@/libs/utils'
import SubmitIcon from '@/public/icons/submit.svg'
import { useAuthModalStore } from '@/stores/authModal'
import {
  getCodeFromLocalStorage,
  getStorageKey,
  useCodeStore,
  useLanguageStore
} from '@/stores/editor'
import {
  RUN_CODE_TAB,
  useSidePanelTabStore,
  useTestcaseTabStore,
  TESTCASE_RESULT_TAB
} from '@/stores/editorTabs'
import type {
  Language,
  ProblemDetail,
  Submission,
  SubmissionDetail,
  Template
} from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import JSConfetti from 'js-confetti'
import { Save } from 'lucide-react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BsTrash3 } from 'react-icons/bs'
import { IoPlayCircleOutline } from 'react-icons/io5'
import { useInterval, useKey } from 'react-use'
import { toast } from 'sonner'
import { getSubmissionProgress } from '../../_libs/submissionProgress'
import { useRunner } from '../TestcasePanel/useRunner'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { RunTestButton } from './RunTestButton'

interface ProblemEditorProps {
  problem: ProblemDetail
  contestId?: number
  assignmentId?: number
  exerciseId?: number
  courseId?: number
  templateString: string
  onSubmissionStart?: () => void
}

export function EditorHeader({
  problem,
  contestId,
  assignmentId,
  exerciseId,
  courseId,
  templateString,
  onSubmissionStart
}: ProblemEditorProps) {
  const { language, setLanguage } = useLanguageStore(
    problem.id,
    contestId,
    courseId,
    assignmentId,
    exerciseId
  )()
  const setCode = useCodeStore((state) => state.setCode)
  const getCode = useCodeStore((state) => state.getCode)

  const isTesting = useTestPollingStore((state) => state.isTesting)
  const setSubmissionProgress = useTestPollingStore(
    (state) => state.setSubmissionProgress
  )
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loading = isTesting || isSubmitting

  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const pollingRequestRef = useRef(false)
  const pollingGenerationRef = useRef(0)
  const finishedSubmissionRef = useRef<number | null>(null)
  const pollingFailuresRef = useRef(0)
  const nextPollAtRef = useRef(0)
  const [templateCode, setTemplateCode] = useState<string>('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const confettiRef = useRef<JSConfetti | null>(null)
  const storageKey = useRef(
    getStorageKey(
      language,
      problem.id,
      userName,
      contestId,
      assignmentId,
      exerciseId
    )
  )
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const session = useSession()
  const showSignIn = useAuthModalStore((state) => state.showSignIn)

  const queryClient = useQueryClient()
  const { startRunner } = useRunner()
  const setActiveTestcaseTab = useTestcaseTabStore(
    (state) => state.setActiveTab
  )
  const { isSidePanelHidden, toggleSidePanelVisibility } =
    useSidePanelTabStore()

  const submissionSearchParams = {
    problemId: problem.id,
    ...(contestId && { contestId }),
    ...((assignmentId || exerciseId) && {
      assignmentId: assignmentId || exerciseId
    })
  }

  const invalidateSubmissionQueries = () => {
    const targetAssignmentId = assignmentId || exerciseId
    if (contestId) {
      queryClient.invalidateQueries({
        queryKey: contestProblemQueries.lists(contestId)
      })
      queryClient.invalidateQueries({
        queryKey: contestSubmissionQueries.lists({
          contestId,
          problemId: problem.id
        })
      })
    } else if (targetAssignmentId) {
      queryClient.invalidateQueries({
        queryKey: assignmentProblemQueries.lists(targetAssignmentId)
      })
      queryClient.invalidateQueries({
        queryKey: assignmentSubmissionQueries.lists({
          assignmentId: targetAssignmentId,
          problemId: problem.id
        })
      })
    } else {
      queryClient.invalidateQueries({
        queryKey: problemSubmissionQueries.lists(problem.id)
      })
    }
  }

  useEffect(() => {
    const generationRef = pollingGenerationRef
    confettiRef.current = new JSConfetti()
    return () => {
      confettiRef.current?.destroyCanvas()
      generationRef.current++
    }
  }, [])
  useInterval(
    async () => {
      if (
        submissionId === null ||
        pollingRequestRef.current ||
        finishedSubmissionRef.current === submissionId ||
        Date.now() < nextPollAtRef.current
      ) {
        return
      }

      const generation = pollingGenerationRef.current
      pollingRequestRef.current = true
      try {
        const res = await fetcherWithAuth(`submission/${submissionId}`, {
          cache: 'no-store',
          searchParams: {
            ...submissionSearchParams,
            pollingTime: Date.now()
          }
        })
        if (!res.ok) {
          throw new Error(`Submission status request failed: ${res.status}`)
        }

        const submission: SubmissionDetail = await res.json()
        if (generation !== pollingGenerationRef.current) {
          return
        }

        pollingFailuresRef.current = 0
        nextPollAtRef.current = 0
        const progress = getSubmissionProgress(submission)
        setSubmissionProgress(progress)

        if (progress.stage === 'finished') {
          finishedSubmissionRef.current = submissionId
          setIsSubmitting(false)
          invalidateSubmissionQueries()
          if (submission.result === 'Accepted') {
            confettiRef.current?.addConfetti()
          }
          if (isSidePanelHidden) {
            toggleSidePanelVisibility()
          }
        }
      } catch {
        if (generation !== pollingGenerationRef.current) {
          return
        }

        pollingFailuresRef.current++
        nextPollAtRef.current =
          Date.now() +
          Math.min(
            1000 * 2 ** Math.min(pollingFailuresRef.current - 1, 4),
            10000
          )
        if (pollingFailuresRef.current >= 5) {
          setIsSubmitting(false)
          setSubmissionProgress({
            stage: 'error',
            completed: 0,
            total: 0,
            message:
              '채점 상태를 확인하지 못했습니다. 제출 내역에서 결과를 확인해 주세요.'
          })
        }
        if (pollingFailuresRef.current === 1) {
          toast.error('Unable to check submission status. Retrying...')
        }
      } finally {
        if (generation === pollingGenerationRef.current) {
          pollingRequestRef.current = false
        }
      }
    },
    isSubmitting && submissionId ? 500 : null
  )

  useEffect(() => {
    if (!session) {
      setTimeout(() => {
        toast.info('Log in to use submission & save feature')
      })
    } else {
      setUserName(session.user.username)
    }
  }, [session])

  useEffect(() => {
    if (!templateString) {
      return
    }
    const parsedTemplates = JSON.parse(templateString)
    const filteredTemplate = parsedTemplates.filter(
      (template: Template) => template.language === language
    )
    if (filteredTemplate.length === 0) {
      return
    }
    setTemplateCode(filteredTemplate[0].code[0].text)
  }, [language, templateString])

  useEffect(() => {
    storageKey.current = getStorageKey(
      language,
      problem.id,
      userName,
      contestId,
      assignmentId,
      exerciseId
    )
    if (storageKey.current !== undefined) {
      const storedCode = getCodeFromLocalStorage(storageKey.current)
      setCode(storedCode || templateCode)
    }
  }, [
    userName,
    problem,
    contestId,
    assignmentId,
    exerciseId,
    language,
    templateCode,
    setCode
  ])

  const storeCodeToLocalStorage = (code: string) => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
    } else {
      toast.error('Failed to save the code')
    }
  }

  const run = () => {
    const code = getCode()

    if (code === '') {
      toast.error('Please write code before run')
      return
    }

    setActiveTestcaseTab(RUN_CODE_TAB)
    storeCodeToLocalStorage(code)
    startRunner(code, language)
  }

  const submit = async () => {
    if (loading) {
      return
    }
    const code = getCode()

    if (session === null) {
      showSignIn()
      toast.error('Log in first to submit your code')
      return
    }

    if (code === '') {
      toast.error('Please write code before submission')
      return
    }

    const generation = ++pollingGenerationRef.current
    pollingRequestRef.current = false
    finishedSubmissionRef.current = null
    pollingFailuresRef.current = 0
    nextPollAtRef.current = 0
    setSubmissionId(null)
    setIsSubmitting(true)
    onSubmissionStart?.()
    setActiveTestcaseTab(TESTCASE_RESULT_TAB)
    setSubmissionProgress({ stage: 'waiting', completed: 0, total: 0 })
    try {
      const res = await fetcherWithAuth.post('submission', {
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
        searchParams: submissionSearchParams,
        next: {
          revalidate: 0
        }
      })
      if (generation !== pollingGenerationRef.current) {
        return
      }
      if (res.ok) {
        toast.success('Successfully submitted the code')
        storeCodeToLocalStorage(code)
        const submission: Submission = await res.json()

        if (generation !== pollingGenerationRef.current) {
          return
        }
        setSubmissionId(submission.id)
        invalidateSubmissionQueries()
      } else {
        setIsSubmitting(false)
        setSubmissionProgress(null)
        if (res.status === 401) {
          showSignIn()
          toast.error('Log in first to submit your code')
        } else if (res.status === 404) {
          toast.error('Submission period has ended.')
        } else {
          toast.error('Please try again later.')
        }
      }
    } catch {
      if (generation !== pollingGenerationRef.current) {
        return
      }
      setIsSubmitting(false)
      setSubmissionProgress({
        stage: 'error',
        completed: 0,
        total: 0,
        message:
          '제출 요청에 실패했습니다. 제출 내역을 확인한 뒤 다시 시도해 주세요.'
      })
      toast.error('Please try again later.')
    }
  }

  const saveCode = () => {
    const code = getCode()

    if (session === null) {
      toast.error('Log in first to save your code')
      showSignIn()
    } else if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
      toast.success('Successfully saved the code')
    } else {
      toast.error('Failed to save the code')
    }
  }

  const resetCode = () => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, templateCode)
      setCode(templateCode)
      toast.success('Successfully reset the code')
    } else {
      toast.error('Failed to reset the code')
    }
  }

  const checkSaved = useCallback(() => {
    const code = getCode()
    if (storageKey.current !== undefined) {
      const storedCode = getCodeFromLocalStorage(storageKey.current)
      if (storedCode && storedCode === code) {
        return true
      } else if (!storedCode && templateCode === code) {
        return true
      } else {
        return false
      }
    }
    return true
  }, [getCode, templateCode])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!checkSaved()) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [checkSaved])

  useEffect(() => {
    const originalPush = router.push

    router.push = (href, ...args) => {
      if (typeof href === 'string' && href.includes('force=true')) {
        const cleanHref = href
          .replace('?force=true', '')
          .replace('&force=true', '')
        originalPush(cleanHref as Route, ...args)
        return
      }

      if (checkSaved()) {
        originalPush(href, ...args)
        return
      }
      const isConfirmed = window.confirm(
        'Are you sure you want to leave this page? Changes you made may not be saved.'
      )
      if (isConfirmed) {
        originalPush(href, ...args)
      }
    }

    return () => {
      router.push = originalPush
    }
  }, [router, checkSaved])

  useKey(
    's',
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        saveCode()
      }
    },
    {},
    [loading]
  )

  useKey(
    'Enter',
    (e) => {
      if ((e.ctrlKey && e.metaKey) || e.shiftKey) {
        e.preventDefault()
        if (!loading) {
          submitTest()
        }
      } else if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        run()
      }
    },
    {},
    [loading]
  )

  const submitTest = () => {
    if (document.querySelector<HTMLButtonElement>('.test-button')) {
      document.querySelector<HTMLButtonElement>('.test-button')?.click()
    }
  }
  const handleLanguageChange = (newLanguage: Language) => {
    setSelectedLanguage(newLanguage)
    setIsLanguageModalOpen(true)
  }
  const handleConfirmLanguageChange = () => {
    setLanguage(selectedLanguage)
    setIsLanguageModalOpen(false)
  }
  return (
    <div className="bg-editor-background-2 flex shrink-0 items-center justify-between border-b border-b-slate-700 px-6">
      <div>
        <Select onValueChange={handleLanguageChange} value={language}>
          <SelectTrigger className="h-8 max-w-fit min-w-[86px] shrink-0 rounded-[4px] border-none bg-slate-600 px-2 font-mono hover:bg-slate-700 focus:ring-0 focus:ring-offset-0 focus:outline-hidden">
            <p className="px-1">
              <SelectValue />
            </p>
          </SelectTrigger>
          <SelectContent className="mt-3 max-w-fit min-w-[100px] border-none bg-[#4C5565] p-0 font-mono">
            <SelectGroup className="text-white">
              {problem.languages.map((language) => (
                <SelectItem
                  key={language}
                  value={language}
                  className="cursor-pointer hover:bg-[#222939]"
                >
                  {language}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <AlertModal
          open={isLanguageModalOpen}
          onOpenChange={setIsLanguageModalOpen}
          size="sm"
          title="Change Language"
          description={`Change language to ${selectedLanguage}?\nOnce you change it, Your code will be deleted.`}
          onClose={() => setIsLanguageModalOpen(false)}
          primaryButton={{
            text: isSubmitting ? 'Changing...' : 'Confirm',
            onClick: handleConfirmLanguageChange
          }}
          type="warning"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="editor"
          variant="editor"
          className="bg-slate-600 font-normal text-red-500 hover:bg-slate-700"
          onClick={() => setIsResetModalOpen(true)}
        >
          <BsTrash3 size={17} />
          Reset
        </Button>
        <AlertModal
          open={isResetModalOpen}
          onOpenChange={setIsResetModalOpen}
          size="sm"
          title="Reset code"
          description="Are you sure you want to reset to the default code?"
          onClose={() => setIsResetModalOpen(false)}
          primaryButton={{
            text: 'Reset',
            onClick: () => {
              resetCode()
              setIsResetModalOpen(false)
            }
          }}
          type="warning"
        />

        <TooltipProvider>
          {contestId === undefined && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="editor"
                  variant="editor"
                  className="border-none bg-[#D7E5FE] text-[#484C4D] hover:bg-[#c6d3ea]"
                  onClick={run}
                >
                  <IoPlayCircleOutline size={22} />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ctrl/Cmd + Enter | Run your code in interactive terminal.</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="editor"
                variant="editor"
                className="bg-[#fafafa] text-[#484C4D] hover:bg-[#e1e1e1]"
                onClick={saveCode}
              >
                <Save className="stroke-[1.3]" size={22} />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ctrl/Cmd + S | Save your code in your browser.</p>
            </TooltipContent>
          </Tooltip>

          <RunTestButton
            problemId={problem.id}
            language={language}
            disabled={loading}
            saveCode={storeCodeToLocalStorage}
            className="test-button"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="editor"
                variant="editor"
                className="bg-primary"
                disabled={loading}
                onClick={submit}
              >
                {loading ? (
                  'Judging'
                ) : (
                  <>
                    <SubmitIcon width={22} /> Submit
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Submit your code for evaluation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
