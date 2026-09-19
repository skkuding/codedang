import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import InfoGrayIcon from '@/public/icons/info-gray.svg'
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
  return (
    <section className="border-color-cool-neutral-90 flex flex-col gap-5 rounded-2xl border bg-white px-6 py-7">
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-head5_sb_24 text-color-common-0">협업자 초대</h2>
          <p className="text-body1_m_16 text-color-cool-neutral-40 break-keep">
            내가 초대한 협업자는 즉시 활성화되고, 외부에서 온 요청만 승인/거절할
            수 있어요.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onInvite}
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
                className="pr-[72px]"
                onChange={(event) => onEmailChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    onInvite()
                  }
                }}
              />
              <span
                className={cn(
                  'text-caption1_r_12 absolute right-5 top-[15px]',
                  errorMessage ? 'text-red-500' : 'text-color-cool-neutral-60'
                )}
              >
                {String(email.length).padStart(2, '0')}/50
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
        <p className="text-body4_r_14 text-color-cool-neutral-60 flex items-center gap-1">
          <InfoGrayIcon aria-hidden="true" className="size-5 shrink-0" />
          초대 즉시 Approved 처리되어 ‘활성화된 참여자’에 바로 들어갑니다.
        </p>
      </div>
    </section>
  )
}
