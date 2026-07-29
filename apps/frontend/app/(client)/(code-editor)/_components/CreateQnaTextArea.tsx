'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { Input } from '@/components/shadcn/input'
import { Textarea } from '@/components/shadcn/textarea'
import { cn } from '@/libs/utils'
import { safeFetcherWithAuth } from '@/libs/utils'
import PenIcon from '@/public/icons/pen.svg'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface CreateQnaTextAreaProps {
  courseId?: number
  problemId?: number
  contestId?: number
  problemOrder?: number | null
}

export function CreateQnaTextArea({
  courseId,
  problemId,
  contestId,
  problemOrder
}: CreateQnaTextAreaProps) {
  const [qnaFormdata, setQnaFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const triggerRefresh = useQnaCommentsSync((s) => s.triggerRefresh)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setQnaFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    let apiUrl = ''
    if (contestId) {
      apiUrl =
        problemOrder === null
          ? `contest/${contestId}/qna`
          : `contest/${contestId}/qna?problem-order=${problemOrder}`
    } else if (courseId && problemId) {
      apiUrl = `course/${courseId}/qna?problemId=${problemId}`
    } else {
      toast.error('Submission failed! Please try again later.')
      setLoading(false)
      return
    }

    const requestBody = {
      title: qnaFormdata.title,
      content: qnaFormdata.content
    }

    try {
      await safeFetcherWithAuth.post(apiUrl, {
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      toast.success('Question submitted successfully')
      setQnaFormData({ title: '', content: '' })
      triggerRefresh()
      triggerRefresh()
    } catch (error) {
      console.error('Error submitting question:', error)
      toast.error('Failed to submit question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg bg-[#222939] p-5 text-white">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Post a Question</h3>
          <button
            type="submit"
            className={cn(
              'h-9 rounded px-4 py-2 text-sm font-semibold text-white transition duration-300 ease-in-out hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
              loading || !qnaFormdata.title || !qnaFormdata.content
                ? 'border-1 border-[#4C5565] bg-gray-900'
                : 'bg-primary'
            )}
            disabled={loading || !qnaFormdata.title || !qnaFormdata.content}
          >
            <div className="flex items-center justify-center gap-1">
              <PenIcon className="h-[18px]" />
              <p>Post</p>
            </div>
          </button>
        </div>

        <div className="mb-2">
          <Input
            type="text"
            name="title"
            placeholder="Enter the Title"
            sizeVariant="lg"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
              }
            }}
            value={qnaFormdata.title}
            onChange={handleInputChange}
            maxLength={35}
            className="placeholder-amber-20 w-full rounded-md border border-neutral-600 bg-[#222939] p-3 text-white placeholder:text-base placeholder:text-gray-400 focus-visible:ring-0"
          />
        </div>
        <div className="relative">
          <Textarea
            name="content"
            placeholder="Inappropriate questions can be deleted."
            value={qnaFormdata.content}
            onChange={handleInputChange}
            maxLength={400}
            className="min-h-[127px] w-full resize-none rounded-md border border-neutral-600 bg-[#222939] p-3 text-white placeholder:text-base placeholder:text-gray-400 focus-visible:ring-0"
          />
          <span className="absolute bottom-2 right-2 text-sm text-gray-400">
            {qnaFormdata.content.length}/400
          </span>
        </div>
      </form>
    </div>
  )
}
