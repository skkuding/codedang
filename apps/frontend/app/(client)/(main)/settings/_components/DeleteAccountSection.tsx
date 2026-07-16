'use client'

import { AlertModal } from '@/components/AlertModal'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

export function DeleteAccountSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpen = () => {
    setPassword('')
    setError('')
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setPassword('')
    setError('')
  }

  const handleWithdraw = async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      await safeFetcherWithAuth.delete('user', {
        json: { password }
      })
      toast.success('탈퇴가 완료되었습니다.')
      await signOut({ callbackUrl: '/login', redirect: true })
    } catch (err) {
      if (isHttpError(err)) {
        if (err.response.status === 401) {
          setError('비밀번호가 올바르지 않습니다')
        } else if (err.response.status === 409) {
          const body = await err.response.json().catch(() => ({}))
          setError(
            body?.message ?? '그룹의 유일한 리더인 경우 탈퇴할 수 없습니다'
          )
        } else {
          toast.error('탈퇴에 실패했습니다. 다시 시도해주세요.')
          handleClose()
        }
      } else {
        toast.error('탈퇴에 실패했습니다. 다시 시도해주세요.')
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-body1_m_16 bg-fill-neutral text-color-neutral-30 w-full rounded-xl px-5 py-[15px]"
      >
        코드당 탈퇴하기
      </button>

      <AlertModal
        open={modalOpen}
        onOpenChange={(open) => !open && handleClose()}
        type="warning"
        title="정말 탈퇴하시겠어요?"
        description="탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
        cancelText="취소"
        closeOnAction={false}
        primaryButton={{
          text: isLoading ? '처리 중...' : '탈퇴하기',
          onClick: handleWithdraw
        }}
        onClose={handleClose}
      >
        <div className="flex w-full flex-col gap-1">
          <input
            placeholder="비밀번호를 입력해주세요"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleWithdraw()
              }
            }}
            className="border-line focus:border-primary h-[46px] w-full rounded-xl border bg-white px-5 outline-none"
            autoComplete="current-password"
          />
          {error && <p className="text-caption4_r_12 text-error">{error}</p>}
        </div>
      </AlertModal>
    </>
  )
}
