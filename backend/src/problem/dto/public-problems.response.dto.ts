import { Exclude, Expose, Transform } from 'class-transformer'

@Exclude()
export class PublicProblemsResponseDto {
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
