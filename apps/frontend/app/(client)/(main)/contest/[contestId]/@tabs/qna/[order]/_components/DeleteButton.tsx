'use client'

import { AlertModal } from '@/components/AlertModal'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { fetcherWithAuth } from '@/libs/utils'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { toast } from 'sonner'

export function DeleteButton({
  subject,
  commentOrder
}: {
  subject: 'question' | 'comment'
  commentOrder?: number
}) {
  const [showModal, setShowModal] = useState(false)
  const params = useParams()

  const handleDelete =
    subject === 'question'
      ? async () => {
          const [contestId, order] = [
            Number(params.contestId),
            Number(params.order)
          ]

          try {
            const res = await fetcherWithAuth.delete(
              `contest/${contestId}/qna/${order}`
            )
            if (!res.ok) {
              const errorRes: { message: string } = await res.json()
              toast.error(errorRes.message)
            } else {
              toast.success('Qna is deleted successfully!')
            }
            // TODO: status code에 따라 에러 구현
          } catch (error) {
            toast.error(`Error in deleting qna!: ${error}`)
          }
        }
      : async () => {
          const [contestId, order] = [
            Number(params.contestId),
            Number(params.order)
          ]
          try {
            // TODO: response error handling
            const res = await fetcherWithAuth.delete(
              `contest/${contestId}/qna/${order}/comment/${commentOrder}`
            )
            if (!res.ok) {
              const errorRes: { message: string } = await res.json()
              toast.error(errorRes.message)
            } else {
              toast.success('A qna comment is deleted successfully!')
            }
          } catch (error) {
            toast.error(`Error in deleting a qna comment!: ${error}`)
          }
        }
  return (
    <AlertModal
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
      description={`Are you sure you want to delete this ${subject.toLowerCase()}?\nOnce deleted, it cannot be recovered.`}
      primaryButton={{
        text: 'Delete',
        onClick: () => {
          handleDelete()
          setShowModal(false)
        },
        variant: 'default'
      }}
      onClose={() => setShowModal(false)}
    />
  )
}
