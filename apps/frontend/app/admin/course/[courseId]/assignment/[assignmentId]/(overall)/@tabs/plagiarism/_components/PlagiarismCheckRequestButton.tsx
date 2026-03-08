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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
      onCompleted: () => {
        setIsPolling(true)
      },
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
      problemId,
      groupId: Number(courseId)
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

  const submissionCounts = useMemo(
    () => submissionCountsData?.getLatestSubmissionCountByLanguage ?? [],
    [submissionCountsData?.getLatestSubmissionCountByLanguage]
  )
  const hasAnyLanguageWithEnoughSubmissions = submissionCounts.some(
    (item: { count: number }) => item.count >= 2
  )

  const getCountForLanguage = useCallback(
    (lang: Language) =>
      submissionCounts.find(
        (item: { language: Language; count: number }) => item.language === lang
      )?.count ?? 0,
    [submissionCounts]
  )

  useEffect(() => {
    if (submissionCountsLoading) {
      return
    }
    const currentCount = getCountForLanguage(language)
    if (currentCount < 2 && hasAnyLanguageWithEnoughSubmissions) {
      const firstValid = allowedLanguages.find(
        (l) => getCountForLanguage(l.value) >= 2
      )
      if (firstValid) {
        setLanguage(firstValid.value)
      }
    }
  }, [
    submissionCountsLoading,
    submissionCounts,
    language,
    hasAnyLanguageWithEnoughSubmissions,
    allowedLanguages,
    getCountForLanguage
  ])

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

  const handleSubmit = useCallback(() => {
    checkAssignmentSubmissions({
      variables: {
        assignmentId: Number(assignmentId),
        problemId,
        groupId: Number(courseId),
        input: {
          language,
          minTokens,
          enableMerging,
          useJplagClustering
        }
      }
    })
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
              <SelectTrigger
                id="language"
                className={
                  !submissionCountsLoading &&
                  getCountForLanguage(language) === 0
                    ? 'text-gray-400'
                    : undefined
                }
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {allowedLanguages.map(({ value, label }) => {
                  const count = getCountForLanguage(value)
                  const disabled = !submissionCountsLoading && count < 2
                  const countLabel = submissionCountsLoading
                    ? label
                    : `${label} (${count} submits)`
                  return (
                    <SelectItem
                      key={value}
                      value={value}
                      disabled={disabled}
                      className={disabled ? 'text-gray-400' : undefined}
                    >
                      {countLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
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
              Enable merging (obfuscation resistance)
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
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !hasAnyLanguageWithEnoughSubmissions}
          >
            {loading ? 'Requesting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
