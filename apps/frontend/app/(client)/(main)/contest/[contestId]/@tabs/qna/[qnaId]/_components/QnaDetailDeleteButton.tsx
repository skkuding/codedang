'use client'

import { DeleteButton } from '@/components/DeleteButton'
import { fetcherWithAuth } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQnaCommentSync } from './context/QnaCommentStoreProvider'

export function QnaDetailDeleteButton({
  subject,
  DeleteUrl
}: {
  subject: 'question' | 'comment'
  DeleteUrl: string
}) {
  const { t } = useTranslate()
  const type = subject === 'question' ? 'default' : 'compact'
  const contestId = DeleteUrl.split('/')[1]
  const router = useRouter()
  const CommentTriggerRefresh = useQnaCommentSync(
    (state) => state.triggerRefresh
  )
  // Content Delete handler
  const handleDelete = async () => {
    try {
      const res = await fetcherWithAuth.delete(DeleteUrl.trim())

      if (!res.ok) {
        const errorRes: { message: string } = await res.json()
        toast.error(errorRes.message)
      } else {
        if (subject === 'question') {
          router.push(`/contest/${contestId}/qna`)
        } else {
          CommentTriggerRefresh()
        }
        toast.success(t('subject_deleted_successfully', { subject }))
      }
      // TODO: status code에 따라 에러 구현
    } catch (error) {
      toast.error(
        t('error_deleting_subject', {
          subject,
          error: (error as Error).message
        })
      )
    }
  }
  return (
    <DeleteButton subject={subject} handleDelete={handleDelete} type={type} />
  )
}
