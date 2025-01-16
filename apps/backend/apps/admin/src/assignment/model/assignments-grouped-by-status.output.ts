import { Field, ObjectType } from '@nestjs/graphql'
import { AssignmentWithScores } from './assignment-with-scores.model'

@ObjectType()
export class AssignmentsGroupedByStatus {
  @Field(() => [AssignmentWithScores])
  upcoming: AssignmentWithScores[]

  @Field(() => [AssignmentWithScores])
  ongoing: AssignmentWithScores[]

  @Field(() => [AssignmentWithScores])
  finished: AssignmentWithScores[]
}
