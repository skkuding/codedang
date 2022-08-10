import { Problem } from '@prisma/client'
import { Exclude, Expose, Transform, Type } from 'class-transformer'

@Exclude()
export class PublicWorkbookProblemsResponseDto {
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
  @Expose() difficulty: string
  @Expose({ name: 'submission_num' }) submissionNum: number
  @Expose({ name: 'accepted_num' }) acceptedNum: number

  @Expose()
  @Transform(({ obj }) =>
    obj.submission_num === 0
      ? '0%'
      : `${((obj.acceptedNum * 100) / obj.submissionNum).toFixed(2)}%`
  )
  acRate: string
}
