import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ContestProblemsResponseDto {
  @Expose() id: number
  @Expose() title: string

  @Expose() displayId: string
}
