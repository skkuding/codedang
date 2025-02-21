import { Field, ObjectType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  Assignment,
  AssignmentProblem,
  AssignmentRecord
} from '@admin/@generated'

@ObjectType()
export class DuplicatedAssignmentResponse {
  @Field(() => Assignment)
  assignment: Assignment

  @Field(() => [AssignmentProblem])
  problems: AssignmentProblem[]

  @Field(() => [AssignmentRecord])
  @Type(() => AssignmentRecord)
  records: AssignmentRecord[]
}
