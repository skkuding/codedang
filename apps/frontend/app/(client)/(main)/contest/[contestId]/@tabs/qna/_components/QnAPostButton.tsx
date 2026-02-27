'use client'

import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BiSolidPencil } from 'react-icons/bi'

type QnAPostButtonProps = {
  contestId: number
  canCreateQnA: boolean | null
}

export function QnAPostButton({ contestId, canCreateQnA }: QnAPostButtonProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslate()

  return (
    <>
      <Button
        type="button"
        onClick={() =>
          canCreateQnA
            ? router.push(`/contest/${contestId}/qna/create`)
            : setModalOpen(true)
        }
        className="flex h-[46px] w-[120px] flex-[1_0_0] items-center justify-center gap-[6px] px-6 py-3 text-base font-medium tracking-[-0.48px]"
      >
        <BiSolidPencil className="white w-4" />
        {t('post_button')}
      </Button>
      <AlertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        type="warning"
        showCancelButton={false}
        title={t('access_denied_title')}
        description={t('access_denied_description')}
        primaryButton={{
          text: t('confirm_button'),
          onClick: () => setModalOpen(false),
          variant: 'default'
        }}
      />
    </>
  )
}
