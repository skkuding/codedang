'use client'

import { Button } from '@/components/ui/button'
import { fetcherWithAuth } from '@/lib/utils'
import useEditorStore from '@/stores/editor'
import type { Submission } from '@/types/type'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

export default function SubmitButton({ problemId }: { problemId: number }) {
  const { code } = useEditorStore()
  const [loading, setLoading] = useState(false)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const router = useRouter()
  useInterval(
    async () => {
      const res = await fetcherWithAuth(`submission/${submissionId}`, {
        searchParams: {
          problemId
        }
      })
      if (res.ok) {
        const data: Submission = await res.json()
        if (data.result !== 'Judging') {
          setLoading(false)
          router.push(`/problem/${problemId}/submission/${submissionId}`)
        }
      } else {
        setLoading(false)
        toast.error('Please try again later.')
      }
    },
    loading && submissionId ? 500 : null
  )
  return (
    <Button
      className="h-7 shrink-0 rounded-md px-2"
      disabled={loading}
      onClick={async () => {
        if (code === '') {
          toast.error('Please write your code.')
          return
        }
        setLoading(true)
        setSubmissionId(null)
        const res = await fetcherWithAuth.post('submission', {
          json: {
            language: 'C',
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
      }}
    >
      {loading ? 'Judging' : 'Submit'}
    </Button>
  )
}
