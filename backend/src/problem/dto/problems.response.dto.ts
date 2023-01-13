import { Exclude, Expose, Transform } from 'class-transformer'

@Exclude()
export class ProblemsResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() difficulty: string
  @Expose() submissionNum: number
  @Expose() acceptedNum: number

  @Expose()
  @Transform(({ obj }) =>
    obj.submissionNum === 0
      ? '0%'
      : `${((obj.acceptedNum * 100) / obj.submissionNum).toFixed(2)}%`
  )
  acRate: string
}
