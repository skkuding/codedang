'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useState } from 'react'
import { BsFillCaretRightFill } from 'react-icons/bs'
import { toast } from 'sonner'

interface CreateCommentsProps {
  qnaOrder: number
  contestId?: number
  courseId?: number
}

export function CreateComments({
  qnaOrder,
  contestId,
  courseId
}: CreateCommentsProps) {
  const [commentData, setCommentData] = useState('')
  const [loading, setLoading] = useState(false)
  const triggerQnaRefresh = useQnaCommentsSync((state) => state.triggerRefresh)

  const handleSubmit = async () => {
    let apiUrl = ''

    if (contestId) {
      apiUrl = `contest/${contestId}/qna/${qnaOrder}/comment`
    } else if (courseId) {
      apiUrl = `course/${courseId}/qna/${qnaOrder}/comment`
    }

    if (!apiUrl) {
      toast.error('Submission failed! Please try again later.')
      return
    }

    setLoading(true)

    try {
      await safeFetcherWithAuth.post(apiUrl, {
        body: JSON.stringify({ content: commentData }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      triggerQnaRefresh()
      setCommentData('')
      toast.success('Comment created successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create comment')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentData(e.target.value)
  }

  return (
    <div className="h-[106px] w-full bg-[#121728] p-5 pb-[30px]">
      <div className="relative">
        <Textarea
          name="content"
          placeholder="Please enter your reply"
          value={commentData}
          onChange={handleInputChange}
          maxLength={400}
          className="h-[56px] w-full resize-none rounded-full border border-neutral-600 bg-[#FFFFFF1A] p-3 pl-6 pr-12 text-base text-white placeholder-gray-400 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-base/loose focus:outline-none [&::-webkit-scrollbar]:hidden"
        />
        <Button
          onClick={handleSubmit}
          className="absolute right-[10px] top-1/2 flex h-10 w-10 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#121728]"
          disabled={loading || !commentData}
        >
          <BsFillCaretRightFill className="h-10 w-10" />
        </Button>
      </div>
    </div>
  )
}
