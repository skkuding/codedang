'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa6'

export function DeleteButton({
  subject,
  comment_order
}: {
  subject: 'question' | 'comment'
  comment_order?: number
}) {
  const [showModal, setShowModal] = useState(false)
  const params = useParams()
  // TODO: qna delete & comment 구현.
  const handleDelete =
    subject === 'question'
      ? (): void => {
          const [contestId, order] = [
            Number(params.contestId),
            Number(params.order)
          ]
          console.log(`${contestId}번 대회의 ${order}번째 qna 삭제`)
        }
      : () => {
          const [contestId, order] = [
            Number(params.contestId),
            Number(params.order)
          ]
          console.log(
            `${contestId}번 대회의 ${order}번째 qna의 ${comment_order}번쨰 댓글 삭제`
          )
        }
  return (
    <Modal
      trigger={
        <Button
          variant="outline"
          className="cursor-pointer border-[1px] border-[#FC5555] hover:bg-red-100"
          asChild
        >
          <div className="flex h-[36px] items-center gap-[6px] px-[24px] py-[8px] text-[#FC5555]">
            <FaTrash fontSize={16} />
            <p className="text-sm font-medium tracking-[-3%]">Delete</p>
          </div>
        </Button>
      }
      open={showModal}
      onOpenChange={(open) => setShowModal(open)}
      size="sm"
      type="warning"
      title={`Delete ${subject.toUpperCase().slice(0, 1).concat(subject.toLowerCase().slice(1))}?`}
      headerDescription={`Are you sure you want to delete this ${subject.toLowerCase()}?
      Once deleted, it cannot be recovered.`}
      primaryButton={{
        text: 'Delete',
        onClick: () => {
          handleDelete()
          setShowModal(false)
        },
        variant: 'destructive'
      }}
      secondaryButton={{
        text: 'Cancle',
        onClick: () => setShowModal(false),
        variant: 'outline'
      }}
      onClose={() => setShowModal(false)}
    />
  )
}
