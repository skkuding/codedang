import type { Language, Level, Tag } from '@prisma/client'

export class ProblemsResponseDto {
  data: Problem[]
  total: number
}

class Problem {
  id: number
  title: string
  engTitle: string | null
  difficulty: Level
  submissionCount: number
  acceptedRate: number
  tags: Partial<Tag>[]
  languages: Language[]
  hasPassed: boolean | null
}
