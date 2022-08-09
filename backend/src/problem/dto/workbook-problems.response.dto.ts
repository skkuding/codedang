import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class WorkbookProblemsResponseDto {
  @Expose() id: number
  @Expose() title: string

  @Expose() displayId: string
}
