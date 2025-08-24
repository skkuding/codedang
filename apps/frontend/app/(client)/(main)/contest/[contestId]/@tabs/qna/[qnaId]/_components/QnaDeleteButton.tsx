'use client'

import { DeleteButton } from '@/components/DeleteButton'
import { fetcherWithAuth } from '@/libs/utils'
import { toast } from 'sonner'

export function QnaDeleteButton({
  subject,
  DeleteUrl
}: {
  subject: 'question' | 'comment'
  DeleteUrl: string
}) {
  // Content Delete handler
  const handleDelete = async () => {
    try {
      const res = await fetcherWithAuth.delete(DeleteUrl.trim())
      if (!res.ok) {
        const errorRes: { message: string } = await res.json()
        toast.error(errorRes.message)
      } else {
        toast.success(`${subject} is deleted successfully!`)
      }
      // TODO: status code에 따라 에러 구현
    } catch (error) {
      toast.error(`Error in deleting ${subject}!: ${error}`)
    }
  }
  return <DeleteButton subject={subject} handleDelete={handleDelete} />
}
