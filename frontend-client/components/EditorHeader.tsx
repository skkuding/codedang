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
import { fetcherWithAuth } from '@/lib/utils'
import useEditorStore from '@/stores/editor'
import type { Language, ProblemDetail, Submission } from '@/types/type'
import { Trash2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

interface ProblemEditorProps {
  problem: ProblemDetail
}

export default function Editor({ problem }: ProblemEditorProps) {
  const { code, language, clearCode, setLanguage } = useEditorStore()
  const [loading, setLoading] = useState(false)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const router = useRouter()

  useInterval(
    async () => {
      const res = await fetcherWithAuth(`submission/${submissionId}`, {
        searchParams: {
          problemId: problem.id
        }
      })
      if (res.ok) {
        const submission: Submission = await res.json()
        if (submission.result !== 'Judging') {
          setLoading(false)
          router.push(`/problem/${problem.id}/submission/${submissionId}`)
          router.refresh()
        }
      } else {
        setLoading(false)
        toast.error('Please try again later.')
      }
    },
    loading && submissionId ? 500 : null
  )

  const submit = async () => {
    if (code === '') {
      toast.error('Please write your code.')
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
        problemId: problem.id
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
      if (res.status === 401)
        toast.error('If you want to submit, please login.')
      else toast.error('Please try again later.')
    }
  }

  return (
    <div className="flex shrink-0 items-center justify-end border-b border-b-slate-700 bg-slate-800 px-5">
      <div className="flex items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              className="size-7 shrink-0 rounded-md bg-slate-600 hover:bg-slate-700"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border border-slate-800 bg-slate-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-50">
                Clear code
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Are you sure you want to clear your code?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2">
              <AlertDialogAction onClick={clearCode}>Clear</AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          className="h-7 shrink-0 rounded-md px-2"
          disabled={loading}
          onClick={submit}
        >
          {loading ? 'Judging' : 'Submit'}
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
