import { Exclude, Expose, Transform } from 'class-transformer'

@Exclude()
export class RelatedProblemsResponseDto {
  @Expose()
  id: string

  @Expose()
  @Transform(({ obj }) => obj.problem.id, { toClassOnly: true })
  problemId: number

  @Expose()
  @Transform(({ obj }) => obj.problem.title, { toClassOnly: true })
  title: string
}
