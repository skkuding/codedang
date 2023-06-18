import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class GetGroupProblem {
  @Field(() => Int)
  problemId: number
}

@InputType()
export class GetGroupProblems {
  @Field(() => Int)
  groupId: number

  @Field(() => Int)
  cursor: number

  @Field(() => Int)
  take: number
}

@InputType()
export class RemoveGroupProblem extends GetGroupProblem {}
