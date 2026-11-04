import { Button } from '@/components/shadcn/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/shadcn/tabs'
import InfoGrayIcon from '@/public/icons/info-gray.svg'
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

const TAB_TRIGGER_CLASS =
  'text-sub3_sb_16 data-[state=active]:text-primary data-[state=active]:border-primary text-color-cool-neutral-30 h-[52px] w-[124px] rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-4 pt-3 shadow-none data-[state=active]:bg-transparent'

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

function RoleBadge({ name, role }: { name: string; role: CollaboratorRole }) {
  return (
    <div
      aria-label={`${name} 현재 권한: ${role}`}
      className="text-body3_r_16 border-color-line flex h-10 w-[109px] items-center justify-center rounded-full border bg-white"
    >
      {role}
    </div>
  )
}

function EmptyCollaborators({ tab }: { tab: CollaborationTab }) {
  const isParticipantsTab = tab === 'participants'

  return (
    <div className="bg-color-neutral-99 flex flex-col items-center justify-center gap-2 rounded-xl px-6 py-[60px] text-center">
      <InfoGrayIcon aria-hidden="true" className="size-6" />
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

interface CollaboratorAction {
  label: string
  onClick: () => void
}

interface CollaboratorRowProps {
  collaborator: Collaborator
  roleControl: ReactNode
  secondaryAction: CollaboratorAction
  primaryAction: CollaboratorAction
}

// 협업 요청과 활성화된 참여자가 공유하는 행.
// 버튼 이름에 협업자 이름을 붙여 스크린리더가 어느 행의 버튼인지 구분할 수 있게 한다.
function CollaboratorRow({
  collaborator,
  roleControl,
  secondaryAction,
  primaryAction
}: CollaboratorRowProps) {
  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <CollaboratorIdentity collaborator={collaborator} />
      <div className="flex shrink-0 items-center gap-10">
        {roleControl}
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            aria-label={`${collaborator.name} ${secondaryAction.label}`}
            onClick={secondaryAction.onClick}
            className="border-primary text-primary hover:bg-color-blue-95 h-[46px] w-[88px] rounded-[10px] px-3"
          >
            <span className="text-sub3_sb_16">{secondaryAction.label}</span>
          </Button>
          <Button
            type="button"
            aria-label={`${collaborator.name} ${primaryAction.label}`}
            onClick={primaryAction.onClick}
            className="h-[46px] w-[88px] rounded-[10px] px-4"
          >
            <span className="text-sub3_sb_16">{primaryAction.label}</span>
          </Button>
        </div>
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
      <p className="text-title1_sb_20 py-4">총 {collaborators.length}건</p>
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
    <section className="border-color-cool-neutral-90 min-h-[336px] rounded-2xl border bg-white px-6 pb-7 pt-3">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as CollaborationTab)}
      >
        <TabsList className="border-color-line h-[52px] w-full rounded-none border-0 border-b bg-transparent p-0">
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
              secondaryAction={{
                label: '거절하기',
                onClick: () => onRejectRequest(request.id)
              }}
              primaryAction={{
                label: '승인하기',
                onClick: () => onApproveRequest(request.id)
              }}
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
                <RoleBadge name={participant.name} role={participant.role} />
              }
              secondaryAction={{
                label: '권한 변경',
                onClick: () => onChangeParticipantRole(participant)
              }}
              primaryAction={{
                label: '삭제하기',
                onClick: () => onDeleteParticipant(participant)
              }}
            />
          )}
        />
      </Tabs>
    </section>
  )
}
