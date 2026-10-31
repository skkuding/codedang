'use client'

import { useRef, useState } from 'react'
import {
  EMAIL_PATTERN,
  nameFromEmail,
  type CollaborationTab,
  type Collaborator,
  type CollaboratorRole,
  type PendingCollaborationAction
} from '../_libs/collaboration'
import { CollaborationDialogs } from './CollaborationDialogs'
import { CollaborationInviteForm } from './CollaborationInviteForm'
import {
  FIGMA_PREVIEW_PARTICIPANTS,
  FIGMA_PREVIEW_REQUESTS
} from './CollaborationPage.fixture'
import { CollaboratorList } from './CollaboratorList'

export type { Collaborator, CollaboratorRole } from '../_libs/collaboration'

interface CollaborationPageProps {
  initialRequests?: Collaborator[]
  initialParticipants?: Collaborator[]
  currentUserEmail?: string
}

export function CollaborationPage({
  initialRequests,
  initialParticipants,
  currentUserEmail
}: CollaborationPageProps = {}) {
  const previewEnabled = process.env.NODE_ENV === 'development'
  const requestsAtStart =
    initialRequests ?? (previewEnabled ? FIGMA_PREVIEW_REQUESTS : [])
  const participantsAtStart =
    initialParticipants ?? (previewEnabled ? FIGMA_PREVIEW_PARTICIPANTS : [])

  const invitationId = useRef(0)
  const [activeTab, setActiveTab] = useState<CollaborationTab>('requests')
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('Editor')
  const [emailError, setEmailError] = useState('')
  const [requests, setRequests] = useState<Collaborator[]>(requestsAtStart)
  const [participants, setParticipants] =
    useState<Collaborator[]>(participantsAtStart)
  const [pendingAction, setPendingAction] =
    useState<PendingCollaborationAction | null>(null)

  const normalizedCurrentUserEmail = currentUserEmail?.trim().toLowerCase()

  const validateEmail = (value: string) => {
    const normalizedEmail = value.trim().toLowerCase()

    if (!normalizedEmail) {
      return '이메일을 입력해주세요.'
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return '유효하지 않은 이메일입니다.'
    }

    if (normalizedEmail === normalizedCurrentUserEmail) {
      return '본인은 협업자로 초대할 수 없습니다.'
    }

    const isAlreadyInvited = [...requests, ...participants].some(
      ({ email: collaboratorEmail }) =>
        collaboratorEmail.trim().toLowerCase() === normalizedEmail
    )

    if (isAlreadyInvited) {
      return '이미 초대된 참여자입니다.'
    }

    return ''
  }

  const inviteCollaborator = () => {
    const errorMessage = validateEmail(email)

    if (errorMessage) {
      setEmailError(errorMessage)
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const invitedCollaborator: Collaborator = {
      id: `invited-${invitationId.current++}`,
      name: nameFromEmail(normalizedEmail),
      email: normalizedEmail,
      role: inviteRole
    }

    setParticipants((currentParticipants) => [
      invitedCollaborator,
      ...currentParticipants
    ])
    setEmail('')
    setEmailError('')
    setActiveTab('participants')
  }

  const updateRequestRole = (id: string, role: CollaboratorRole) => {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id ? { ...request, role } : request
      )
    )
  }

  const rejectRequest = (id: string) => {
    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== id)
    )
  }

  const approveRequest = (id: string) => {
    const approvedRequest = requests.find((request) => request.id === id)

    if (!approvedRequest) {
      return
    }

    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== id)
    )
    setParticipants((currentParticipants) => [
      approvedRequest,
      ...currentParticipants
    ])
  }

  const openRoleDialog = (collaborator: Collaborator) => {
    setPendingAction({
      type: 'change-role',
      collaborator,
      nextRole: collaborator.role
    })
  }

  const changePendingRole = (nextRole: CollaboratorRole) => {
    setPendingAction((currentAction) =>
      currentAction?.type === 'change-role'
        ? { ...currentAction, nextRole }
        : currentAction
    )
  }

  const confirmPendingAction = () => {
    if (!pendingAction) {
      return
    }

    if (pendingAction.type === 'delete') {
      setParticipants((currentParticipants) =>
        currentParticipants.filter(
          (participant) => participant.id !== pendingAction.collaborator.id
        )
      )
    } else {
      setParticipants((currentParticipants) =>
        currentParticipants.map((participant) =>
          participant.id === pendingAction.collaborator.id
            ? { ...participant, role: pendingAction.nextRole }
            : participant
        )
      )
    }

    setPendingAction(null)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <CollaborationInviteForm
        email={email}
        role={inviteRole}
        errorMessage={emailError}
        onEmailChange={(nextEmail) => {
          setEmail(nextEmail)
          if (emailError) {
            setEmailError('')
          }
        }}
        onRoleChange={setInviteRole}
        onInvite={inviteCollaborator}
      />
      <CollaboratorList
        activeTab={activeTab}
        requests={requests}
        participants={participants}
        onTabChange={setActiveTab}
        onRequestRoleChange={updateRequestRole}
        onRejectRequest={rejectRequest}
        onApproveRequest={approveRequest}
        onChangeParticipantRole={openRoleDialog}
        onDeleteParticipant={(collaborator) =>
          setPendingAction({ type: 'delete', collaborator })
        }
      />
      <CollaborationDialogs
        pendingAction={pendingAction}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null)
          }
        }}
        onRoleChange={changePendingRole}
        onConfirm={confirmPendingAction}
      />
    </div>
  )
}
