import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class PublicContestProblemsResponseDto {
  @Expose() id: number
  @Expose() title: string

  @Expose() displayId: string
}
