import { Exclude, Expose, Transform } from 'class-transformer'

@Exclude()
export class RelatedProblemsResponseDto {
  @Expose()
  displayId: string

  @Expose()
  @Transform(({ obj }) => obj.problem.id, { toClassOnly: true })
  id: number

  @Expose()
  @Transform(({ obj }) => obj.problem.title, { toClassOnly: true })
  title: string
}
