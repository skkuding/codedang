import { Problem } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'

@Exclude()
export class PublicContestProblemsResponseDto {
  @Expose({ name: 'display_id' })
  displayId: string

  @Expose()
  @Type(() => ProblemProperty)
  problem: Problem
}

@Exclude()
class ProblemProperty {
  @Expose() id: number
  @Expose() title: string
}
