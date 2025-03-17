'use client'

import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { contestProblemQueries } from '@/app/(client)/_libs/queries/contestProblem'
import { contestSubmissionQueries } from '@/app/(client)/_libs/queries/contestSubmission'
import { problemSubmissionQueries } from '@/app/(client)/_libs/queries/problemSubmission'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { useSession } from '@/libs/hooks/useSession'
import { fetcherWithAuth } from '@/libs/utils'
import submitIcon from '@/public/icons/submit.svg'
import { useAuthModalStore } from '@/stores/authModal'
import {
  useLanguageStore,
  useCodeStore,
  getStorageKey,
  getCodeFromLocalStorage
} from '@/stores/editor'
import type {
  Language,
  ProblemDetail,
  Submission,
  Template
} from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import JSConfetti from 'js-confetti'
import { Save } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BsTrash3 } from 'react-icons/bs'
import { useInterval } from 'react-use'
import { toast } from 'sonner'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { BackCautionDialog } from './BackCautionDialog'
import { RunTestButton } from './RunTestButton'

interface ProblemEditorProps {
  problem: ProblemDetail
  contestId?: number
  assignmentId?: number
  courseId?: number
  templateString: string
}

export function EditorHeader({
  problem,
  contestId,
  assignmentId,
  courseId,
  templateString
}: ProblemEditorProps) {
  const { language, setLanguage } = useLanguageStore(
    problem.id,
    contestId,
    assignmentId
  )()
  const setCode = useCodeStore((state) => state.setCode)
  const getCode = useCodeStore((state) => state.getCode)

  const isTesting = useTestPollingStore((state) => state.isTesting)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loading = isTesting || isSubmitting

  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [templateCode, setTemplateCode] = useState<string>('')
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const confetti = typeof window !== 'undefined' ? new JSConfetti() : null
  const storageKey = useRef(
    getStorageKey(language, problem.id, userName, contestId, assignmentId)
  )
  const session = useSession()
  const showSignIn = useAuthModalStore((state) => state.showSignIn)
  const [showModal, setShowModal] = useState<boolean>(false)
  //const pushed = useRef(false)
  const whereToPush = useRef('')
  const isModalConfrimed = useRef(false)

  const queryClient = useQueryClient()

  useInterval(
    async () => {
      // TODO: Implement assignment submission
      const res = await fetcherWithAuth(`submission/${submissionId}`, {
        searchParams: {
          problemId: problem.id,
          ...(contestId && { contestId }),
          ...(assignmentId && { assignmentId })
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
          } else {
            href = `/problem/${problem.id}/submission/${submissionId}`
          }

          !contestId && router.replace(href as Route)
          //window.history.pushState(null, '', window.location.href)
          if (submission.result === 'Accepted') {
            confetti?.addConfetti()
          }
        }
      } else {
        setIsSubmitting(false)
        toast.error('Please try again later.')
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
  }, [language])

  useEffect(() => {
    storageKey.current = getStorageKey(
      language,
      problem.id,
      userName,
      contestId,
      assignmentId
    )
    if (storageKey.current !== undefined) {
      const storedCode = getCodeFromLocalStorage(storageKey.current)
      setCode(storedCode || templateCode)
    }
  }, [userName, problem, contestId, assignmentId, language, templateCode])

  const storeCodeToLocalStorage = (code: string) => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
    } else {
      toast.error('Failed to save the code')
    }
  }
  const submit = async () => {
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
        ...(assignmentId && { assignmentId })
      },
      next: {
        revalidate: 0
      }
    })
    if (res.ok) {
      toast.success('Successfully submitted the code')
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
      } else {
        queryClient.invalidateQueries({
          queryKey: problemSubmissionQueries.lists(problem.id)
        })
      }
    } else {
      setIsSubmitting(false)
      if (res.status === 401) {
        showSignIn()
        toast.error('Log in first to submit your code')
      } else {
        toast.error('Please try again later.')
      }
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
      assignmentId
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
      if (checkSaved() || isModalConfrimed.current) {
        originalPush(href, ...args)
        return
      }
      isModalConfrimed.current = false
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
  }, [router])

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-b-slate-700 bg-[#222939] px-6">
      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              className="size-7 h-8 w-[77px] shrink-0 gap-[5px] rounded-[4px] bg-slate-600 font-normal text-red-500 hover:bg-slate-700"
            >
              <BsTrash3 size={17} />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="h-[200px] w-[500px] rounded-2xl border border-slate-800 bg-slate-900 pb-7 pl-8 pr-[30px] pt-8 sm:rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-size-5 text-slate-50">
                Reset code
              </AlertDialogTitle>
              <AlertDialogDescription className="font-size-4 text-slate-300">
                Are you sure you want to reset to the default code?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel className="self-end rounded-[1000px] border-none bg-[#DCE3E5] text-[#787E80] hover:bg-[#c9cfd1]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="self-end rounded-[1000px] bg-red-500 hover:bg-red-600"
                onClick={resetCode}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          className="size-7 h-8 w-[77px] shrink-0 gap-[5px] rounded-[4px] bg-[#fafafa] font-medium text-[#484C4D] hover:bg-[#e1e1e1]"
          onClick={saveCode}
        >
          <Save className="stroke-[1.3]" size={22} />
          Save
        </Button>
        <RunTestButton
          problemId={problem.id}
          language={language}
          disabled={loading}
          saveCode={storeCodeToLocalStorage}
        />
        <Button
          className="h-8 shrink-0 gap-1 rounded-[4px] px-2 font-normal"
          disabled={loading}
          onClick={submit}
        >
          {loading ? (
            'Judging'
          ) : (
            <>
              <Image src={submitIcon} width={22} alt={'submit'} /> Submit
            </>
          )}
        </Button>
        <Select
          onValueChange={(language: Language) => {
            setLanguage(language)
          }}
          value={language}
        >
          <SelectTrigger className="h-8 min-w-[86px] max-w-fit shrink-0 rounded-[4px] border-none bg-slate-600 px-2 font-mono hover:bg-slate-700 focus:outline-none focus:ring-0 focus:ring-offset-0">
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
      </div>
      <BackCautionDialog
        confrim={isModalConfrimed}
        isOpen={showModal}
        title="Leave this page?"
        description="Changes you made my not be saved."
        onClose={() => setShowModal(false)}
        onBack={() => router.push(whereToPush.current as Route)}
      />
    </div>
  )
}
