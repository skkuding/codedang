import { Language, Level } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProblemResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() description: string
  @Expose() inputDescription: string
  @Expose() outputDescription: string
  @Expose() hint: string
  @Expose() languages: Language[]
  @Expose() timeLimit: number
  @Expose() memoryLimit: number
  @Expose() difficulty: Level
  @Expose() source: string[]
  @Expose() inputExamples: string[]
  @Expose() outputExamples: string[]
}
