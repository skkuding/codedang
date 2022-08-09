import { Prisma } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ContestProblemResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() description: string
  @Expose({ name: 'input_description' }) inputDescription: string
  @Expose({ name: 'output_description' }) outputDescription: string
  @Expose() hint: string
  @Expose() languages: Prisma.JsonValue
  @Expose({ name: 'time_limit' }) timeLimit: number
  @Expose({ name: 'memory_limit' }) memoryLimit: number
  @Expose() difficulty: string
  @Expose() source: Prisma.JsonValue

  @Expose() displayId: string
}
