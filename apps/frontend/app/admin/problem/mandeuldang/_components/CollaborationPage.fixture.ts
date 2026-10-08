import type { Collaborator } from '../_libs/collaboration'

const AVATAR_URL = '/images/collaboration/avatar.jpeg'

export const FIGMA_PREVIEW_REQUESTS: Collaborator[] = Array.from(
  { length: 4 },
  (_, index) => ({
    id: `preview-request-${index}`,
    name: 'Bob',
    email: 'Bob@example.com',
    role: 'Viewer',
    avatarUrl: AVATAR_URL
  })
)

export const FIGMA_PREVIEW_PARTICIPANTS: Collaborator[] = Array.from(
  { length: 2 },
  (_, index) => ({
    id: `preview-participant-${index}`,
    name: 'Bob',
    email: 'Bob@example.com',
    role: 'Viewer',
    avatarUrl: AVATAR_URL
  })
)
