import { Prisma } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProblemResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() description: string
  @Expose() inputDescription: string
  @Expose() outputDescription: string
  @Expose() hint: string
  @Expose() languages: Prisma.JsonValue
  @Expose() timeLimit: number
  @Expose() memoryLimit: number
  @Expose() difficulty: string
  @Expose() source: Prisma.JsonValue
}
