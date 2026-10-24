import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/shadcn/alert-dialog'
import { cn } from '@/libs/utils'
import InfoBlueIcon from '@/public/icons/icon-info-blue.svg'
import {
  COLLABORATOR_ROLES,
  type CollaboratorRole,
  type PendingCollaborationAction
} from '../_libs/collaboration'

interface CollaborationDialogsProps {
  pendingAction: PendingCollaborationAction | null
  onOpenChange: (open: boolean) => void
  onRoleChange: (role: CollaboratorRole) => void
  onConfirm: () => void
}

export function CollaborationDialogs({
  pendingAction,
  onOpenChange,
  onRoleChange,
  onConfirm
}: CollaborationDialogsProps) {
  const isRoleChange = pendingAction?.type === 'change-role'

  return (
    <AlertDialog open={pendingAction !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent
        overlayClassName="bg-black/60 backdrop-blur-none"
        className={cn(
          'gap-0 rounded-2xl border-0 bg-white px-8 pb-6 pt-8 shadow-none',
          isRoleChange ? 'w-[560px]' : 'w-[436px]'
        )}
      >
        <AlertDialogHeader className="gap-2 space-y-0 text-left">
          <InfoBlueIcon aria-hidden="true" className="size-9" />
          <div className="flex flex-col gap-3">
            <AlertDialogTitle className="text-head5_sb_24 text-color-common-0">
              {pendingAction?.type === 'delete'
                ? '사용자 권한을 삭제하시겠습니까?'
                : '사용자 권한을 변경하시겠습니까?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body1_m_16 text-color-cool-neutral-30 leading-[1.5]">
              {pendingAction?.type === 'delete'
                ? '협업자로 초대된 사용자를 삭제하면 해당 사용자는 권한을 잃고\n이 작업은 되돌릴 수 없습니다. 정말 권한을 삭제하시겠습니까?'
                : '해당 사용자의 권한을 변경하시겠습니까?\n변경된 권한은 목록에서 언제든지 다시 수정할 수 있습니다.'}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        {pendingAction?.type === 'change-role' && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="bg-color-neutral-99 flex items-center justify-between rounded-full py-3 pl-3 pr-4">
              <div className="text-body1_m_16 text-color-cool-neutral-30 flex items-center gap-2">
                <span aria-hidden="true">•</span>
                <span>현재 참여자 권한</span>
              </div>
              <span className="text-sub3_sb_16 text-primary">
                {pendingAction.collaborator.role}
              </span>
            </div>
            <div className="border-color-line flex flex-col rounded-xl border py-1">
              {COLLABORATOR_ROLES.map((role) => (
                <label
                  key={role}
                  className="text-body1_m_16 text-color-common-0 flex cursor-pointer items-center justify-between px-4 py-3"
                >
                  <span>
                    {role === 'Viewer'
                      ? 'Viewer (보기 권한)'
                      : 'Editor (편집 권한)'}
                  </span>
                  <input
                    type="radio"
                    name="collaborator-role"
                    value={role}
                    checked={pendingAction.nextRole === role}
                    onChange={() => onRoleChange(role)}
                    className="accent-primary size-5"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter className="mt-6 gap-0 space-x-0">
          <AlertDialogCancel className="text-title2_sb_18 text-color-cool-neutral-30 h-12 w-[100px] border-0 bg-transparent pl-5 pr-0 text-right shadow-none hover:bg-transparent">
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="text-title2_sb_18 text-primary h-12 w-[120px] bg-transparent pl-5 pr-0 text-right shadow-none hover:bg-transparent"
          >
            {pendingAction?.type === 'delete' ? '삭제할래요' : '변경할래요'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
