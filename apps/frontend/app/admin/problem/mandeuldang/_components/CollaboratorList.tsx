import { Button } from '@/components/shadcn/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/shadcn/tabs'
import InfoGrayIcon from '@/public/icons/info-gray.svg'
import Image from 'next/image'
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
        <p className="text-title1_sb_20 text-color-common-0 truncate">
          {collaborator.name}
        </p>
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
          <TabsTrigger
            value="requests"
            className="text-sub3_sb_16 data-[state=active]:text-primary data-[state=active]:border-primary text-color-cool-neutral-30 h-[52px] w-[124px] rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-4 pt-3 shadow-none data-[state=active]:bg-transparent"
          >
            협업 요청
          </TabsTrigger>
          <TabsTrigger
            value="participants"
            className="text-sub3_sb_16 data-[state=active]:text-primary data-[state=active]:border-primary text-color-cool-neutral-30 h-[52px] w-[124px] rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 pb-4 pt-3 shadow-none data-[state=active]:bg-transparent"
          >
            활성화된 참여자
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-0 outline-none">
          <p className="text-title1_sb_20 text-color-common-0 py-4">
            총 {requests.length}건
          </p>
          {requests.length === 0 ? (
            <EmptyCollaborators tab="requests" />
          ) : (
            <ul>
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <CollaboratorIdentity collaborator={request} />
                  <div className="flex shrink-0 items-center gap-10">
                    <CollaborationRoleSelect
                      compact
                      ariaLabel={`${request.name} 요청 권한`}
                      value={request.role}
                      onValueChange={(role) =>
                        onRequestRoleChange(request.id, role)
                      }
                    />
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onRejectRequest(request.id)}
                        className="border-primary text-primary hover:bg-color-blue-95 h-[46px] w-[88px] rounded-[10px] px-4"
                      >
                        <span className="text-sub3_sb_16">거절하기</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onApproveRequest(request.id)}
                        className="h-[46px] w-[88px] rounded-[10px] px-4"
                      >
                        <span className="text-sub3_sb_16">승인하기</span>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="participants" className="mt-0 outline-none">
          <p className="text-title1_sb_20 text-color-common-0 py-4">
            총 {participants.length}건
          </p>
          {participants.length === 0 ? (
            <EmptyCollaborators tab="participants" />
          ) : (
            <ul>
              {participants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <CollaboratorIdentity collaborator={participant} />
                  <div className="flex shrink-0 items-center gap-10">
                    <RoleBadge
                      name={participant.name}
                      role={participant.role}
                    />
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onChangeParticipantRole(participant)}
                        className="border-primary text-primary hover:bg-color-blue-95 h-[46px] w-[88px] rounded-[10px] px-3"
                      >
                        <span className="text-sub3_sb_16">권한 변경</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onDeleteParticipant(participant)}
                        className="h-[46px] w-[88px] rounded-[10px] px-4"
                      >
                        <span className="text-sub3_sb_16">삭제하기</span>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
