import { Notice } from '@prisma/client'

export interface UserNoticePage {
  current: Partial<Notice>
  prev?: {
    id: number
    title: string
  }
  next?: {
    id: number
    title: string
  }
}
