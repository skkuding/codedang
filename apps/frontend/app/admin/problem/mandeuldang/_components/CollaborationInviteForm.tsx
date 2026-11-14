import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import AsteriskIcon from '@/public/icons/asterisk.svg'
import type { FormEvent } from 'react'
import type { CollaboratorRole } from '../_libs/collaboration'
import { CollaborationRoleSelect } from './CollaborationRoleSelect'

interface CollaborationInviteFormProps {
  email: string
  role: CollaboratorRole
  errorMessage: string
  onEmailChange: (email: string) => void
  onRoleChange: (role: CollaboratorRole) => void
  onInvite: () => void
}

export function CollaborationInviteForm({
  email,
  role,
  errorMessage,
  onEmailChange,
  onRoleChange,
  onInvite
}: CollaborationInviteFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onInvite()
  }

  return (
    // noValidate: 브라우저 기본 이메일 검증 대신 CollaborationPage의 검증 메시지를 보여준다
    <form
      noValidate
      aria-labelledby="collaboration-invite-title"
      onSubmit={handleSubmit}
      className="border-color-cool-neutral-90 flex flex-col gap-5 rounded-2xl border bg-white px-6 py-7"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 id="collaboration-invite-title" className="text-head5_sb_24">
            협업자 초대
          </h2>
          <p className="text-body1_m_16 text-color-cool-neutral-40 break-keep">
            내가 초대한 협업자는 즉시 활성화되고, 외부에서 온 요청만 승인/거절할
            수 있어요.
          </p>
        </div>
        <Button
          type="submit"
          variant="outline"
          className="border-primary text-primary hover:bg-color-blue-95 h-[46px] shrink-0 rounded-[10px] px-4 py-3"
        >
          <span className="text-sub3_sb_16">협업자 초대하기</span>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <label
            htmlFor="collaborator-email"
            className="flex min-w-0 flex-1 flex-col gap-1.5"
          >
            <span className="text-sub3_sb_16 text-color-neutral-15">
              이메일
            </span>
            <div className="relative">
              <Input
                id="collaborator-email"
                type="email"
                sizeVariant="lg"
                value={email}
                maxLength={50}
                isError={Boolean(errorMessage)}
                errorMessage={errorMessage}
                placeholder="이메일을 입력해주세요"
                className={cn(
                  'text-body1_m_16 placeholder:text-color-neutral-90 pl-4 pr-[72px]',
                  !errorMessage && 'border-color-line'
                )}
                onChange={(event) => onEmailChange(event.target.value)}
              />
              <span
                className={cn(
                  'text-caption1_m_13 absolute right-4 top-1/2 -translate-y-1/2',
                  errorMessage ? 'text-red-500' : 'text-color-cool-neutral-50'
                )}
              >
                {email.length}/50
              </span>
            </div>
          </label>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-sub3_sb_16 text-color-neutral-15">권한</span>
            <CollaborationRoleSelect
              ariaLabel="초대할 협업자 권한"
              value={role}
              onValueChange={onRoleChange}
            />
          </div>
        </div>
        <p className="text-body4_r_14 text-color-cool-neutral-60 flex items-center">
          <AsteriskIcon aria-hidden="true" className="size-5 shrink-0" />
          초대 즉시 Approved 처리되어 ‘활성화된 참여자’에 바로 들어갑니다.
        </p>
      </div>
    </form>
  )
}
