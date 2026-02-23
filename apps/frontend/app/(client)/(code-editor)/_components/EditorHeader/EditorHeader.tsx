'use client'

import { useSubmissionPolling } from '@/app/(client)/(code-editor)/_libs/hooks/useSubmissionPolling'
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
import submitIcon from '@/public/icons/submit.svg'
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
  useTestcaseTabStore
} from '@/stores/editorTabs'
import type {
  Language,
  ProblemDetail,
  Submission,
  Template
} from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import JSConfetti from 'js-confetti'
import { Save } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BsTrash3 } from 'react-icons/bs'
import { IoPlayCircleOutline } from 'react-icons/io5'
import { useInterval, useKey } from 'react-use'
import { toast } from 'sonner'
import { useRunner } from '../TestcasePanel/useRunner'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { BackCautionDialog } from './BackCautionDialog'
import { RunTestButton } from './RunTestButton'

interface ProblemEditorProps {
  problem: ProblemDetail
  contestId?: number
  assignmentId?: number
  exerciseId?: number
  courseId?: number
  templateString: string
}

export function EditorHeader({
  problem,
  contestId,
  assignmentId,
  exerciseId,
  courseId,
  templateString
}: ProblemEditorProps) {
  const { t } = useTranslate()
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
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loading = isTesting || isSubmitting

  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [templateCode, setTemplateCode] = useState<string>('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const confetti = typeof window !== 'undefined' ? new JSConfetti() : null
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
  const [showModal, setShowModal] = useState<boolean>(false)
  //const pushed = useRef(false)
  const whereToPush = useRef('')
  const isModalConfrimed = useRef(false)

  const queryClient = useQueryClient()
  const { startRunner } = useRunner()
  const setActiveTestcaseTab = useTestcaseTabStore(
    (state) => state.setActiveTab
  )
  const { isSidePanelHidden, toggleSidePanelVisibility } =
    useSidePanelTabStore()

  const [isSubmitted, setIsSubmitted] = useState(false)
  useSubmissionPolling({
    contestId,
    problemId: problem.id,
    enabled: isSubmitted
  })
  useInterval(
    async () => {
      // TODO: Implement assignment submission
      const res = await fetcherWithAuth(`submission/${submissionId}`, {
        searchParams: {
          problemId: problem.id,
          ...(contestId && { contestId }),
          ...(assignmentId && { assignmentId }),
          ...(exerciseId && { assignmentId: exerciseId })
        }
      })
      if (res.ok) {
        const submission: Submission = await res.json()
        if (submission.result !== 'Judging') {
          setIsSubmitting(false)

          let href = ''
          if (contestId) {
            href = `/contest/${contestId}/problem/${problem.id}/submission/${submissionId}?cellProblemId=${problem.id}`
          } else if (assignmentId) {
            href = `/course/${courseId}/assignment/${assignmentId}/problem/${problem.id}/submission/${submissionId}`
          } else if (exerciseId) {
            href = `/course/${courseId}/exercise/${exerciseId}/problem/${problem.id}/submission/${submissionId}`
          } else {
            href = `/problem/${problem.id}/submission/${submissionId}`
          }

          !contestId && router.replace(href as Route)
          //window.history.pushState(null, '', window.location.href)
          if (submission.result === 'Accepted') {
            confetti?.addConfetti()
          }
          if (isSidePanelHidden) {
            toggleSidePanelVisibility()
          }
        }
      } else {
        setIsSubmitting(false)
        toast.error(t('please_try_again_later'))
      }
    },
    isSubmitting && submissionId ? 500 : null
  )

  useEffect(() => {
    if (!session) {
      setTimeout(() => {
        toast.info(t('log_in_to_use_submission_save_feature'))
      })
    } else {
      setUserName(session.user.username)
    }
  }, [session, t])

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
  }, [language])

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
    templateCode
  ])

  const storeCodeToLocalStorage = (code: string) => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
    } else {
      toast.error(t('failed_to_save_the_code'))
    }
  }

  const run = () => {
    const code = getCode()

    if (code === '') {
      toast.error(t('please_write_code_before_run'))
      return
    }

    setActiveTestcaseTab(RUN_CODE_TAB)
    storeCodeToLocalStorage(code)
    startRunner(code, language)
  }

  const submit = async () => {
    const code = getCode()

    if (session === null) {
      showSignIn()
      toast.error(t('log_in_first_to_submit_your_code'))
      return
    }

    if (code === '') {
      toast.error(t('please_write_code_before_submission'))
      return
    }

    setSubmissionId(null)
    setIsSubmitting(true)
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
      searchParams: {
        problemId: problem.id,
        ...(contestId && { contestId }),
        ...(assignmentId && { assignmentId }),
        ...(exerciseId && { assignmentId: exerciseId })
      },
      next: {
        revalidate: 0
      }
    })
    if (res.ok) {
      toast.success(t('successfully_submitted_the_code'))
      storeCodeToLocalStorage(code)
      const submission: Submission = await res.json()

      setSubmissionId(submission.id)
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
        setIsSubmitted(true)
      } else if (assignmentId) {
        queryClient.invalidateQueries({
          queryKey: assignmentProblemQueries.lists(assignmentId)
        })
        queryClient.invalidateQueries({
          queryKey: assignmentSubmissionQueries.lists({
            assignmentId,
            problemId: problem.id
          })
        })
      } else if (exerciseId) {
        queryClient.invalidateQueries({
          queryKey: assignmentProblemQueries.lists(exerciseId)
        })
        queryClient.invalidateQueries({
          queryKey: assignmentSubmissionQueries.lists({
            assignmentId: exerciseId,
            problemId: problem.id
          })
        })
      } else {
        queryClient.invalidateQueries({
          queryKey: problemSubmissionQueries.lists(problem.id)
        })
      }
    } else {
      setIsSubmitting(false)
      if (res.status === 401) {
        showSignIn()
        toast.error(t('log_in_first_to_submit_your_code'))
      } else if (res.status === 404) {
        toast.error(t('submission_period_has_ended'))
      } else {
        toast.error(t('please_try_again_later'))
      }
    }
  }

  const saveCode = () => {
    const code = getCode()

    if (session === null) {
      toast.error(t('log_in_first_to_save_your_code'))
      showSignIn()
    } else if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
      toast.success(t('successfully_saved_the_code'))
    } else {
      toast.error(t('failed_to_save_the_code'))
    }
  }

  const resetCode = () => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, templateCode)
      setCode(templateCode)
      toast.success(t('successfully_reset_the_code'))
    } else {
      toast.error(t('failed_to_reset_the_code'))
    }
  }

  const checkSaved = () => {
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
  }

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!checkSaved()) {
      e.preventDefault()
      whereToPush.current = pathname
    }
  }

  useEffect(() => {
    storageKey.current = getStorageKey(
      language,
      problem.id,
      userName,
      contestId,
      assignmentId,
      exerciseId
    )

    // TODO: 배포 후 뒤로 가기 로직 재구현

    // const handlePopState = () => {
    //   if (!checkSaved()) {
    //     whereToPush.current = contestId
    //       ? `/contest/${contestId}/problem`
    //       : '/problem'
    //     setShowModal(true)
    //   } else window.history.back()
    // }
    // if (!pushed.current) {
    //   window.history.pushState(null, '', window.location.href)
    //   pushed.current = true
    // }
    window.addEventListener('beforeunload', handleBeforeUnload)
    //window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      //window.removeEventListener('popstate', handlePopState)
    }
  }, [])

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

      if (checkSaved() || isModalConfrimed.current) {
        originalPush(href, ...args)
        return
      }
      isModalConfrimed.current = false
      const isConfirmed = window.confirm(t('leave_this_page_warning'))
      if (isConfirmed) {
        originalPush(href, ...args)
      }
    }

    return () => {
      router.push = originalPush
    }
  }, [router, t])

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
          <SelectTrigger className="focus:outline-hidden h-8 min-w-[86px] max-w-fit shrink-0 rounded-[4px] border-none bg-slate-600 px-2 font-mono hover:bg-slate-700 focus:ring-0 focus:ring-offset-0">
            <p className="px-1">
              <SelectValue />
            </p>
          </SelectTrigger>
          <SelectContent className="mt-3 min-w-[100px] max-w-fit border-none bg-[#4C5565] p-0 font-mono">
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
          title={t('change_language_title')}
          description={t('change_language_description', { selectedLanguage })}
          onClose={() => setIsLanguageModalOpen(false)}
          primaryButton={{
            text: isSubmitting ? t('changing') : t('confirm'),
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
          {t('reset_button')}
        </Button>
        <AlertModal
          open={isResetModalOpen}
          onOpenChange={setIsResetModalOpen}
          size="sm"
          title={t('reset_code_title')}
          description={t('reset_code_description')}
          onClose={() => setIsResetModalOpen(false)}
          primaryButton={{
            text: t('reset_button'),
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
              <TooltipTrigger>
                <Button
                  size="editor"
                  variant="editor"
                  className="border-none bg-[#D7E5FE] text-[#484C4D] hover:bg-[#c6d3ea]"
                  onClick={run}
                >
                  <IoPlayCircleOutline size={22} />
                  {t('run_button')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('run_code_tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger>
              <Button
                size="editor"
                variant="editor"
                className="bg-[#fafafa] text-[#484C4D] hover:bg-[#e1e1e1]"
                onClick={saveCode}
              >
                <Save className="stroke-[1.3]" size={22} />
                {t('save_button')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('save_code_tooltip')}</p>
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
            <TooltipTrigger>
              <Button
                size="editor"
                variant="editor"
                className="bg-primary"
                disabled={loading}
                onClick={submit}
              >
                {loading ? (
                  t('judging')
                ) : (
                  <>
                    <Image src={submitIcon} width={22} alt={'submit'} />{' '}
                    {t('submit_button')}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('submit_code_tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <BackCautionDialog
        confrim={isModalConfrimed}
        isOpen={showModal}
        title={t('leave_this_page_title')}
        description={t('leave_this_page_description')}
        onClose={() => setShowModal(false)}
        onBack={() => router.push(whereToPush.current as Route)}
      />
    </div>
  )
}
