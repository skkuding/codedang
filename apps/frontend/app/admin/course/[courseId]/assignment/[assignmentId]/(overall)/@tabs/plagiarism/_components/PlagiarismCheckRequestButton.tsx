'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Label } from '@/components/shadcn/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Switch } from '@/components/shadcn/switch'
import { CHECK_ASSIGNMENT_SUBMISSIONS } from '@/graphql/check/mutations'
import { GET_CHECK_REQUESTS } from '@/graphql/check/queries'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import { GET_LATEST_SUBMISSION_COUNT_BY_LANGUAGE } from '@/graphql/submission/queries'
import { useMutation, useQuery } from '@apollo/client'
import { Language } from '@generated/graphql'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const PLAGIARISM_LANGUAGES: { value: Language; label: string }[] = [
  { value: Language.Java, label: 'Java' },
  { value: Language.C, label: 'C' },
  { value: Language.Cpp, label: 'C++' },
  { value: Language.Python3, label: 'Python 3' },
  { value: Language.PyPy3, label: 'PyPy 3' },
  { value: Language.Python2, label: 'Python 2' },
  { value: Language.Golang, label: 'Go' }
]

type CheckResultStatus =
  | 'Pending'
  | 'Completed'
  | 'JplagError'
  | 'TokenError'
  | 'ServerError'

interface PlagiarismCheckRequestButtonProps {
  problemId: number
  onRequestComplete: () => void
  disabled?: boolean
}

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 120

export function PlagiarismCheckRequestButton({
  problemId,
  onRequestComplete,
  disabled = false
}: PlagiarismCheckRequestButtonProps) {
  const { assignmentId, courseId } = useParams()
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<Language>(Language.Java)
  const [minTokens, setMinTokens] = useState(12)
  const [enableMerging, setEnableMerging] = useState(false)
  const [useJplagClustering, setUseJplagClustering] = useState(true)
  const [isPolling, setIsPolling] = useState(false)
  const pollingStartedAt = useRef<number | null>(null)

  const [checkAssignmentSubmissions, { loading: mutationLoading }] =
    useMutation(CHECK_ASSIGNMENT_SUBMISSIONS, {
      onError: (error) => {
        toast.error(`Plagiarism check request failed: ${error.message}`)
        setOpen(false)
      }
    })

  const { data: problemData } = useQuery(GET_PROBLEM, {
    variables: { id: problemId },
    skip: !problemId
  })

  const langs = problemData?.getProblem?.languages
  const allowedLanguages =
    langs && langs.length > 0
      ? PLAGIARISM_LANGUAGES.filter(({ value }) => langs.includes(value))
      : PLAGIARISM_LANGUAGES

  useEffect(() => {
    if (
      allowedLanguages.length > 0 &&
      !allowedLanguages.some((l) => l.value === language)
    ) {
      setLanguage(allowedLanguages[0].value)
    }
  }, [allowedLanguages, language])

  const { data: checkRequestsData } = useQuery(GET_CHECK_REQUESTS, {
    variables: {
      assignmentId: Number(assignmentId),
      problemId
    },
    skip: !assignmentId || !problemId,
    pollInterval: isPolling ? POLL_INTERVAL_MS : 0
  })

  const checkRequests = checkRequestsData?.getCheckRequests ?? []
  const latestRequest = checkRequests[checkRequests.length - 1]
  const latestStatus = latestRequest?.result as CheckResultStatus | undefined
  const hasExistingResults = checkRequests.length > 0

  const { data: submissionCountsData, loading: submissionCountsLoading } =
    useQuery(GET_LATEST_SUBMISSION_COUNT_BY_LANGUAGE, {
      variables: {
        assignmentId: Number(assignmentId),
        problemId,
        groupId: Number(courseId)
      },
      skip: !assignmentId || !problemId || !courseId,
      errorPolicy: 'all'
    })

  const submissionCounts =
    submissionCountsData?.getLatestSubmissionCountByLanguage ?? []
  const selectedLanguageCount =
    submissionCounts.find(
      (item: { language: Language; count: number }) =>
        item.language === language
    )?.count ?? 0
  const meetsPlagiarismCheckThreshold = selectedLanguageCount >= 2

  const selectedLanguageLabel =
    allowedLanguages.find((l) => l.value === language)?.label ??
    String(language)

  useEffect(() => {
    if (isPolling && pollingStartedAt.current === null) {
      pollingStartedAt.current = Date.now()
    }
    if (!isPolling) {
      pollingStartedAt.current = null
    }
  }, [isPolling])

  useEffect(() => {
    if (!isPolling) {
      return
    }
    const timeoutId = setInterval(() => {
      const elapsed = pollingStartedAt.current
        ? Date.now() - pollingStartedAt.current
        : 0
      if (elapsed > MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) {
        setIsPolling(false)
        pollingStartedAt.current = null
        toast.error(
          'Plagiarism check timed out. Please check the result later.'
        )
        setOpen(false)
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timeoutId)
  }, [isPolling])

  useEffect(() => {
    if (!isPolling || !latestStatus) {
      return
    }
    if (latestStatus === 'Completed') {
      setIsPolling(false)
      pollingStartedAt.current = null
      toast.success('Plagiarism check completed.')
      onRequestComplete()
      setOpen(false)
    } else if (
      latestStatus === 'JplagError' ||
      latestStatus === 'TokenError' ||
      latestStatus === 'ServerError'
    ) {
      setIsPolling(false)
      pollingStartedAt.current = null
      toast.error(`Plagiarism check failed: ${latestStatus}`)
    }
  }, [isPolling, latestStatus, onRequestComplete])

  const handleSubmit = useCallback(async () => {
    try {
      await checkAssignmentSubmissions({
        variables: {
          assignmentId: Number(assignmentId),
          problemId,
          input: {
            language,
            minTokens,
            enableMerging,
            useJplagClustering
          }
        }
      })
      toast.success(
        'Plagiarism check request received. Please wait until it completes.'
      )
      setIsPolling(true)
    } catch {
      /* Handled by mutation onError */
    }
  }, [
    assignmentId,
    problemId,
    language,
    minTokens,
    enableMerging,
    useJplagClustering,
    checkAssignmentSubmissions
  ])

  const loading = mutationLoading || isPolling

  let buttonLabel = 'Request plagiarism check'
  if (loading) {
    buttonLabel = 'Checking...'
  } else if (hasExistingResults) {
    buttonLabel = 'Re-request plagiarism check'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="default">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Plagiarism check request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as Language)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {allowedLanguages.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1 text-xs">
            {submissionCountsLoading && (
              <p className="text-gray-500">
                Loading latest submissions by language...
              </p>
            )}
            {!submissionCountsLoading && submissionCounts.length > 0 && (
              <>
                <p className="text-gray-600">
                  Latest submissions per language (per student):
                </p>
                <div className="flex flex-wrap gap-2">
                  {submissionCounts.map(
                    (item: { language: Language; count: number }) => (
                      <span
                        key={item.language}
                        className={`rounded border px-2 py-0.5 ${
                          item.language === language
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        {item.language}: {item.count}
                      </span>
                    )
                  )}
                </div>
                <p
                  className={
                    meetsPlagiarismCheckThreshold
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }
                >
                  {selectedLanguageLabel} 기준 최신 제출 학생 수:{' '}
                  <span className="font-semibold">{selectedLanguageCount}</span>
                  명 — 표절 검사 최소 기준은{' '}
                  <span className="font-semibold">2명 이상</span>
                  입니다.
                </p>
              </>
            )}
            {!submissionCountsLoading && submissionCounts.length === 0 && (
              <p className="text-gray-500">
                No latest submissions found for this problem yet.
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minTokens">Min tokens</Label>
            <input
              id="minTokens"
              type="number"
              min={1}
              max={100}
              value={minTokens}
              onChange={(e) => setMinTokens(Number(e.target.value) || 12)}
              className="flex h-9 w-full rounded-md border px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enableMerging"
              checked={enableMerging}
              onCheckedChange={setEnableMerging}
            />
            <Label htmlFor="enableMerging">
              enableMerging (obfuscation resistance)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="useJplagClustering"
              checked={useJplagClustering}
              onCheckedChange={setUseJplagClustering}
            />
            <Label htmlFor="useJplagClustering">Use clustering</Label>
          </div>
          {isPolling && (
            <p className="text-sm text-amber-600">
              Jplag is running. Please wait until it completes...
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Requesting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
