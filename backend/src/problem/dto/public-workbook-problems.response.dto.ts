import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class PublicWorkbookProblemsResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() difficulty: string
  @Expose({ name: 'submission_num' }) submissionNum: number
  @Expose({ name: 'accepted_num' }) acceptedNum: number

  @Expose()
  acRate() {
    if (this.submissionNum === 0) {
      return '0%'
    }
    return `${((this.acceptedNum * 100) / this.submissionNum).toFixed(2)}%`
  }
}
