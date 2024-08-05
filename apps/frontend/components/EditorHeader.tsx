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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { auth } from '@/lib/auth'
import { fetcherWithAuth } from '@/lib/utils'
import submitIcon from '@/public/submit.svg'
import useAuthModalStore from '@/stores/authModal'
import { CodeContext, useLanguageStore } from '@/stores/editor'
import type {
  Language,
  ProblemDetail,
  Submission,
  Template
} from '@/types/type'
import JSConfetti from 'js-confetti'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { BsTrash3 } from 'react-icons/bs'
import { IoPlayCircleOutline } from 'react-icons/io5'
import { useInterval } from 'react-use'
import { toast } from 'sonner'
import { useStore } from 'zustand'

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
  const { language, setLanguage } = useLanguageStore()
  const store = useContext(CodeContext)
  if (!store) throw new Error('CodeContext is not provided')
  const { code, setCode } = useStore(store)
  const [loading, setLoading] = useState(false)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [templateCode, setTemplateCode] = useState<string | null>(null)
  const router = useRouter()
  const confetti = typeof window !== 'undefined' ? new JSConfetti() : null
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
          setLoading(false)
          const href = contestId
            ? `/contest/${contestId}/problem/${problem.id}/submission/${submissionId}`
            : `/problem/${problem.id}/submission/${submissionId}`
          router.push(href as Route)
          if (submission.result === 'Accepted') {
            confetti?.addConfetti()
          }
        }
      } else {
        setLoading(false)
        toast.error('Please try again later.')
      }
    },
    loading && submissionId ? 500 : null
  )

  const { showSignIn } = useAuthModalStore((state) => state)
  useEffect(() => {
    auth().then((session) => {
      if (!session) {
        toast.info('Log in to use submission & auto save feature')
      }
    })
  }, [])

  useEffect(() => {
    if (!templateString) return
    const parsedTemplates = JSON.parse(templateString)
    const filteredTemplate = parsedTemplates.filter(
      (template: Template) => template.language === language
    )
    if (filteredTemplate.length === 0) return
    setTemplateCode(filteredTemplate[0].code[0].text)
  }, [language])

  const submit = async () => {
    if (code === '') {
      toast.error('Please write code before submission')
      return
    }
    setSubmissionId(null)
    setLoading(true)
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
      const submission: Submission = await res.json()
      setSubmissionId(submission.id)
    } else {
      setLoading(false)
      if (res.status === 401) {
        showSignIn()
        toast.error('Log in first to submit your code')
      } else toast.error('Please try again later.')
    }
  }

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-b-slate-700 bg-[#222939] px-5">
      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              className="size-7 w-[77px] shrink-0 gap-[5px] rounded-md bg-slate-600 font-normal text-red-500 hover:bg-slate-700"
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
                onClick={() => setCode(templateCode ?? '')}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="flex items-center gap-3">
        {/* TODO: Add Test function */}
        <Button variant={'secondary'} className="h-7 shrink-0 gap-1 px-2">
          <IoPlayCircleOutline size={22} />
          Test
        </Button>
        <Button
          className="h-7 shrink-0 gap-1 px-2"
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
          <SelectTrigger className="h-7 w-fit shrink-0 rounded-md border-none bg-slate-600 px-2 hover:bg-slate-700 focus:outline-none focus:ring-0 focus:ring-offset-0">
            <p className="pr-1">
              <SelectValue />
            </p>
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-800">
            <SelectGroup className="text-white">
              {problem.languages.map((language) => (
                <SelectItem
                  key={language}
                  value={language}
                  className="cursor-pointer ring-0 hover:bg-slate-700"
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
