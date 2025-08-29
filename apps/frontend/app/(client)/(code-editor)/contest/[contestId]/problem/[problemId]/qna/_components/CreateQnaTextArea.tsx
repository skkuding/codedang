'use client'

//import { AlertModal } from '@/components/AlertModal'
import { Input } from '@/components/shadcn/input'
import { Textarea } from '@/components/shadcn/textarea'
import { cn } from '@/libs/utils'
import { safeFetcherWithAuth } from '@/libs/utils'
import React, { useState } from 'react'
import { FaPen } from 'react-icons/fa6'
import { toast } from 'sonner'

interface CreateQnaTextAreaProps {
  contestId: number
  problemOrder: number | null
}

export function CreateQnaTextArea({
  contestId,
  problemOrder
}: CreateQnaTextAreaProps) {
  const [qnaFormdata, setQnaFormData] = useState({
    title: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  //const [postModalOpen, setPostModalOpen] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setQnaFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  const handleSubmit = async () => {
    setLoading(true)
    const apiUrl =
      problemOrder === null
        ? `contest/${contestId}/qna`
        : `contest/${contestId}/qna?problem-order=${problemOrder}`
    const requestBody = {
      title: qnaFormdata.title,
      content: qnaFormdata.content
    }
    try {
      const response = await safeFetcherWithAuth.post(apiUrl, {
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      console.log('Success:', result)
      toast.success('Question submitted successfully')
      setQnaFormData({ title: '', content: '' })
    } catch (error) {
      console.error('Error submitting question:', error)
      toast.error('Failed to submit question')
    } finally {
      setLoading(false)
      //setPostModalOpen(false)
    }
  }

  return (
    <div className="rounded-lg bg-[#222939] p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold">Post a Question</h3>
        {/* <AlertModal
          open={postModalOpen}
          onOpenChange={setPostModalOpen}
          size="sm"
          title="Do you want to register question?"
          description="Pranky questions, swear words, and accusations can be sanctioned. Do you really want to register your questions?"
          primaryButton={{
            text: 'Register',
            onClick: handleSubmit
          }}
          onClose={() => setPostModalOpen(false)}
          type="confirm"
        /> */}
        <button
          onClick={() => handleSubmit()}
          className={cn(
            'h-9 w-20 rounded px-4 py-2 text-sm font-semibold text-white transition duration-300 ease-in-out hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
            loading || !qnaFormdata.title || !qnaFormdata.content
              ? 'border-1 border-[#4C5565] bg-gray-900'
              : 'bg-primary'
          )}
          disabled={loading || !qnaFormdata.title || !qnaFormdata.content}
        >
          <FaPen className="mr-1 inline h-3 w-3" />
          Post
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <Input
            type="text"
            name="title"
            placeholder="Enter the Title"
            value={qnaFormdata.title}
            onChange={handleInputChange}
            maxLength={70}
            className="placeholder-amber-20 h-[46px] w-full rounded-md border border-neutral-600 bg-[#222939] p-3 text-white placeholder:text-base placeholder:text-gray-400 focus-visible:ring-0"
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
