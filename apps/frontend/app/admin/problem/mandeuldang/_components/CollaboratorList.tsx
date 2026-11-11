import { Button } from '@/components/shadcn/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/shadcn/tabs'
import TrashIcon from '@/public/icons/trashcan.svg'
import WarningIcon from '@/public/icons/warning.svg'
import Image from 'next/image'
import type { ReactNode } from 'react'
import type {
  CollaborationTab,
  Collaborator,
  CollaboratorRole
} from '../_libs/collaboration'
import { CollaborationRoleSelect } from './CollaborationRoleSelect'

interface CollaboratorListProps {
  activeTab: CollaborationTab
  requests: Collaborator[]
  participants: Collaborator[]
  onTabChange: (tab: CollaborationTab) => void
  onRequestRoleChange: (id: string, role: CollaboratorRole) => void
  onRejectRequest: (id: string) => void
  onApproveRequest: (id: string) => void
  onChangeParticipantRole: (collaborator: Collaborator) => void
  onDeleteParticipant: (collaborator: Collaborator) => void
}

// 피그마: 탭 124×38(패딩 0/12/16), 텍스트 sub3_sb_16, 비활성 CoolNeutral/40 (기본 variant의 font-normal·neutral-60을 덮어쓴다)
const TAB_TRIGGER_CLASS =
  'text-sub3_sb_16 font-semibold data-[state=active]:text-primary data-[state=active]:border-primary data-[state=inactive]:text-color-cool-neutral-40 h-[38px] w-[124px] rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-4 pt-0 shadow-none data-[state=active]:bg-transparent'

function CollaboratorIdentity({
  collaborator
}: {
  collaborator: Collaborator
}) {
  const initial = collaborator.name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="flex w-[400px] min-w-0 items-center gap-3">
      {collaborator.avatarUrl ? (
        <Image
          src={collaborator.avatarUrl}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover object-center"
        />
      ) : (
        <div
          aria-hidden="true"
          className="bg-color-blue-95 text-primary grid size-12 shrink-0 place-items-center rounded-full text-lg font-semibold"
        >
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-title1_sb_20 truncate">{collaborator.name}</p>
        <p className="text-body4_r_14 text-color-cool-neutral-40 truncate">
          {collaborator.email}
        </p>
      </div>
    </div>
  )
}

interface ParticipantControlProps {
  collaborator: Collaborator
  onClick: () => void
}

// 피그마: 참여자 행의 권한은 글자(body1_m_16, CoolNeutral/20)로만 보여주고, 누르면 권한 변경 다이얼로그를 연다
function ParticipantRoleButton({
  collaborator,
  onClick
}: ParticipantControlProps) {
  return (
    <button
      type="button"
      aria-label={`${collaborator.name} 권한 변경`}
      onClick={onClick}
      className="text-body1_m_16 text-color-cool-neutral-20 hover:text-primary focus-visible:ring-primary rounded-sm focus-visible:outline-none focus-visible:ring-2"
    >
      {collaborator.role}
    </button>
  )
}

// 피그마: 48×36 둥근 아이콘 버튼, 배경 Neutral/99, 테두리 Neutral/90, 16px 휴지통(Neutral/70)
function DeleteIconButton({ collaborator, onClick }: ParticipantControlProps) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={`${collaborator.name} 삭제하기`}
      onClick={onClick}
      className="bg-color-neutral-99 border-color-neutral-90 hover:bg-color-neutral-95 h-9 w-12 rounded-full p-0"
    >
      <TrashIcon
        aria-hidden="true"
        className="text-color-neutral-70 size-4 shrink-0"
      />
    </Button>
  )
}

function EmptyCollaborators({ tab }: { tab: CollaborationTab }) {
  const isParticipantsTab = tab === 'participants'

  return (
    <div className="bg-color-neutral-99 flex flex-col items-center justify-center gap-2 rounded-xl px-6 py-[60px] text-center">
      <WarningIcon
        aria-hidden="true"
        className="text-color-neutral-80 size-6"
      />
      <p className="text-body1_m_16 text-color-cool-neutral-50">
        <span>
          {isParticipantsTab
            ? '활성화된 참여자가 존재하지 않습니다.'
            : '받은 협업 요청이 없습니다.'}
        </span>
        <br />
        <span>
          {isParticipantsTab
            ? '이메일을 입력하여 첫 번째 협업자를 초대해보세요!'
            : '새로운 요청이 오면 이곳에서 승인하거나 거절할 수 있어요.'}
        </span>
      </p>
    </div>
  )
}

interface RequestActionsProps {
  collaborator: Collaborator
  onReject: () => void
  onApprove: () => void
}

// 피그마: 88×46 버튼 두 개, 간격 6. 버튼 이름에 협업자 이름을 붙여 스크린리더가 어느 행인지 구분할 수 있게 한다.
function RequestActions({
  collaborator,
  onReject,
  onApprove
}: RequestActionsProps) {
  return (
    <div className="flex gap-1.5">
      <Button
        type="button"
        variant="outline"
        aria-label={`${collaborator.name} 거절하기`}
        onClick={onReject}
        className="border-primary text-primary hover:bg-color-blue-95 h-[46px] w-[88px] rounded-[10px] px-4"
      >
        <span className="text-sub3_sb_16">거절하기</span>
      </Button>
      <Button
        type="button"
        aria-label={`${collaborator.name} 승인하기`}
        onClick={onApprove}
        className="h-[46px] w-[88px] rounded-[10px] px-4"
      >
        <span className="text-sub3_sb_16">승인하기</span>
      </Button>
    </div>
  )
}

interface CollaboratorRowProps {
  collaborator: Collaborator
  roleControl: ReactNode
  actions: ReactNode
}

// 협업 요청과 활성화된 참여자가 공유하는 행. 권한 컨트롤과 액션 사이는 피그마대로 40px.
function CollaboratorRow({
  collaborator,
  roleControl,
  actions
}: CollaboratorRowProps) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <CollaboratorIdentity collaborator={collaborator} />
      <div className="flex shrink-0 items-center gap-10">
        {roleControl}
        {actions}
      </div>
    </li>
  )
}

interface CollaboratorPanelProps {
  tab: CollaborationTab
  collaborators: Collaborator[]
  renderRow: (collaborator: Collaborator) => ReactNode
}

function CollaboratorPanel({
  tab,
  collaborators,
  renderRow
}: CollaboratorPanelProps) {
  return (
    <TabsContent value={tab} className="mt-0 outline-none">
      <p className="text-title1_sb_20 pb-2 pt-5">
        총 <span className="text-primary">{collaborators.length}</span>건
      </p>
      {collaborators.length === 0 ? (
        <EmptyCollaborators tab={tab} />
      ) : (
        <ul>{collaborators.map(renderRow)}</ul>
      )}
    </TabsContent>
  )
}

export function CollaboratorList({
  activeTab,
  requests,
  participants,
  onTabChange,
  onRequestRoleChange,
  onRejectRequest,
  onApproveRequest,
  onChangeParticipantRole,
  onDeleteParticipant
}: CollaboratorListProps) {
  return (
    <section className="border-color-cool-neutral-90 min-h-[336px] rounded-2xl border bg-white px-6 py-7">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as CollaborationTab)}
      >
        <TabsList className="border-color-line h-[38px] w-full rounded-none border-0 border-b bg-transparent p-0">
          <TabsTrigger value="requests" className={TAB_TRIGGER_CLASS}>
            협업 요청
          </TabsTrigger>
          <TabsTrigger value="participants" className={TAB_TRIGGER_CLASS}>
            활성화된 참여자
          </TabsTrigger>
        </TabsList>

        <CollaboratorPanel
          tab="requests"
          collaborators={requests}
          renderRow={(request) => (
            <CollaboratorRow
              key={request.id}
              collaborator={request}
              roleControl={
                <CollaborationRoleSelect
                  compact
                  ariaLabel={`${request.name} 요청 권한`}
                  value={request.role}
                  onValueChange={(role) =>
                    onRequestRoleChange(request.id, role)
                  }
                />
              }
              actions={
                <RequestActions
                  collaborator={request}
                  onReject={() => onRejectRequest(request.id)}
                  onApprove={() => onApproveRequest(request.id)}
                />
              }
            />
          )}
        />

        <CollaboratorPanel
          tab="participants"
          collaborators={participants}
          renderRow={(participant) => (
            <CollaboratorRow
              key={participant.id}
              collaborator={participant}
              roleControl={
                <ParticipantRoleButton
                  collaborator={participant}
                  onClick={() => onChangeParticipantRole(participant)}
                />
              }
              actions={
                <DeleteIconButton
                  collaborator={participant}
                  onClick={() => onDeleteParticipant(participant)}
                />
              }
            />
          )}
        />
      </Tabs>
    </section>
  )
}
