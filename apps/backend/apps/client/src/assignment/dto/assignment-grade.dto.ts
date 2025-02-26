import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
class ProblemRecordDto {
  @Field(() => Int, { nullable: true })
  finalScore?: number | null

  @Field(() => String, { nullable: true })
  comment?: string
}

@ObjectType()
class AssignmentProblemWithGradeDto {
  @Field(() => Int)
  id: number

  @Field(() => String)
  title: string

  @Field(() => Int)
  order: number

  @Field(() => Int)
  maxScore: number

  @Field(() => ProblemRecordDto, { nullable: true })
  problemRecord: ProblemRecordDto | null
}

@ObjectType()
export class AssignmentGradeSummaryDto {
  @Field(() => Int)
  id: number

  @Field(() => String)
  title: string

  @Field(() => Date)
  endTime: Date

  @Field(() => Boolean)
  isFinalScoreVisible: boolean

  @Field(() => Boolean)
  autoFinalizeScore: boolean

  @Field(() => Int)
  week: number

  @Field(() => Int, { nullable: true })
  userAssignmentFinalScore: number | null

  @Field(() => Int)
  assignmentPerfectScore: number

  @Field(() => [AssignmentProblemWithGradeDto])
  problems: AssignmentProblemWithGradeDto[]
}

@ObjectType()
export class AssignmentGradeSummariesResponseDto {
  @Field(() => [AssignmentGradeSummaryDto])
  assignments: AssignmentGradeSummaryDto[]
}
