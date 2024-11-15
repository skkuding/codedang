'use client'

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
import { auth } from '@/lib/auth'
import { fetcherWithAuth } from '@/lib/utils'
import submitIcon from '@/public/icons/submit.svg'
import useAuthModalStore from '@/stores/authModal'
import { useLanguageStore, useCodeStore, getKey } from '@/stores/editor'
import type {
  Language,
  ProblemDetail,
  Submission,
  Template
} from '@/types/type'
import JSConfetti from 'js-confetti'
import { Save } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BsTrash3 } from 'react-icons/bs'
import { useInterval } from 'react-use'
import { toast } from 'sonner'
import RunTestButton from './testcase/RunTestButton'
import { usePollingTestStore } from './testcase/useTestResults'

interface ProblemEditorProps {
  problem: ProblemDetail
  contestId?: number
  templateString: string
}

export default function Editor({
  problem,
  contestId,
  templateString
}: ProblemEditorProps) {
  const { language, setLanguage } = useLanguageStore(problem.id, contestId)()
  const setCode = useCodeStore((state) => state.setCode)
  const getCode = useCodeStore((state) => state.getCode)

  const isTesting = usePollingTestStore((state) => state.isTesting)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const loading = isTesting || isSubmitting

  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [templateCode, setTemplateCode] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const confetti = typeof window !== 'undefined' ? new JSConfetti() : null
  const storageKey = useRef(getKey(language, problem.id, userName, contestId))
  const { currentModal, showSignIn } = useAuthModalStore((state) => state)

  useInterval(
    async () => {
      const res = await fetcherWithAuth(`submission/${submissionId}`, {
        searchParams: {
          problemId: problem.id,
          ...(contestId && { contestId })
        }
      })
      if (res.ok) {
        const submission: Submission = await res.json()
        if (submission.result !== 'Judging') {
          setIsSubmitting(false)
          const href = contestId
            ? `/contest/${contestId}/problem/${problem.id}/submission/${submissionId}`
            : `/problem/${problem.id}/submission/${submissionId}`
          router.push(href as Route)
          if (submission.result === 'Accepted') {
            confetti?.addConfetti()
          }
        }
      } else {
        setIsSubmitting(false)
        toast.error('Please try again later.')
      }
    },
    loading && submissionId ? 500 : null
  )

  useEffect(() => {
    auth().then((session) => {
      if (!session) {
        toast.info('Log in to use submission & save feature')
      } else {
        setUserName(session.user.username)
      }
    })
  }, [currentModal])

  useEffect(() => {
    if (!templateString) return
    const parsedTemplates = JSON.parse(templateString)
    const filteredTemplate = parsedTemplates.filter(
      (template: Template) => template.language === language
    )
    if (filteredTemplate.length === 0) return
    setTemplateCode(filteredTemplate[0].code[0].text)
  }, [language])

  useEffect(() => {
    storageKey.current = getKey(language, problem.id, userName, contestId)
    if (storageKey.current !== undefined) {
      const storedCode = localStorage.getItem(storageKey.current)
      setCode(storedCode ?? templateCode ?? '')
    }
  }, [userName, problem, contestId, language, templateCode])

  const storeCodeToLocalStorage = (code: string) => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
    } else {
      toast.error('Failed to save the code')
    }
  }
  const submit = async () => {
    const code = getCode()

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
        ...(contestId && { contestId })
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
    } else {
      setIsSubmitting(false)
      if (res.status === 401) {
        showSignIn()
        toast.error('Log in first to submit your code')
      } else toast.error('Please try again later.')
    }
  }

  const saveCode = async () => {
    const session = await auth()
    const code = getCode()

    if (!session) {
      toast.error('Log in first to save your code')
    } else if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, code)
      toast.success('Successfully saved the code')
    } else {
      toast.error('Failed to save the code')
    }
  }

  const resetCode = () => {
    if (storageKey.current !== undefined) {
      localStorage.setItem(storageKey.current, templateCode ?? '')
      setCode(templateCode ?? '')
      toast.success('Successfully reset the code')
    } else toast.error('Failed to reset the code')
  }

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
          <AlertDialogContent className="border border-slate-800 bg-slate-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-50">
                Reset code
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Are you sure you want to reset to the default code?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
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
          className="size-7 h-8 w-[77px] shrink-0 gap-[5px] rounded-[4px] bg-[#D7E5FE] font-medium text-[#484C4D] hover:bg-[#c6d3ea]"
          onClick={saveCode}
        >
          <Save className="stroke-1" size={22} />
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
    </div>
  )
}
