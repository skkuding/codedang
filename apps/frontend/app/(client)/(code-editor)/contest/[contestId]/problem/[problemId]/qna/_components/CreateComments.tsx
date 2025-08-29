'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { Textarea } from '@/components/shadcn/textarea'
import { safeFetcherWithAuth } from '@/libs/utils'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { BsFillCaretRightFill } from 'react-icons/bs'
import { toast } from 'sonner'

interface CreateCommentsProps {
  qnaOrder: number
}
export function CreateComments({ qnaOrder }: CreateCommentsProps) {
  const contestId = Number(usePathname().split('/')[2])
  const [commentData, setCommentData] = useState('')
  const [loading, setLoading] = useState(false)
  const triggerQnaRefresh = useQnaCommentsSync((state) => state.triggerRefresh)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await safeFetcherWithAuth.post(
        `contest/${contestId}/qna/${qnaOrder}/comment`,
        {
          body: JSON.stringify({ content: commentData }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
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
          className="h-[56px] w-full resize-none rounded-full border border-neutral-600 bg-[#FFFFFF1A] p-3 text-base text-white placeholder-gray-400 placeholder:text-base/loose focus:outline-none"
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
