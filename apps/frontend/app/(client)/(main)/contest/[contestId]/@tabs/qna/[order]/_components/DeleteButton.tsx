'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { fetcherWithAuth } from '@/libs/utils'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa6'

export function DeleteButton({
  subject,
  commentOrder
}: {
  subject: 'question' | 'comment'
  commentOrder?: number
}) {
  const [showModal, setShowModal] = useState(false)
  const params = useParams()
  // TODO: qna delete & comment 구현.
  const handleDelete =
    subject === 'question'
      ? // Qna 삭제
        async () => {
          const [contestId, order] = [
            Number(params.contestId),
            Number(params.order)
          ]

          try {
            const res = await fetcherWithAuth(
              `contest/${contestId}/qna/${order}`,
              {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              }
            )

            // TODO: status code에 따라 에러 구현
            console.log(`${contestId}번 대회의 ${order}번째 qna 삭제`)
            console.log(`status: ${res.status}`)
          } catch {
            console.log(`Error!`)
          }
        }
      : // Qna 댓글 삭제
        async () => {
          const [contestId, order] = [
            Number(params.contestId),
            Number(params.order)
          ]
          try {
            const res = await fetcherWithAuth(
              `/contest/${contestId}/qna/${order}/comment/${commentOrder}`,
              {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              }
            )

            console.log(
              `${contestId}번 대회의 ${order}번째 qna의 ${commentOrder}번쨰 댓글 삭제`
            )
            console.log(`status: ${res.status}`)
          } catch {
            console.log('Error!')
          }
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
