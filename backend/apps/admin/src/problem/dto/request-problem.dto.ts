import { Field, InputType, Int } from '@nestjs/graphql'
import { LanguageInput, DifficultyInput } from './update-problem.dto'

@InputType()
export class GetGroupProblemDto {
  @Field(() => Int)
  problemId: number
}

@InputType()
export class GetGroupProblemsDto {
  @Field(() => Int, { nullable: true })
  groupId?: number

  @Field(() => Int)
  cursor: number

  @Field(() => Int)
  take: number

  @Field(() => Int, { nullable: true })
  createdById?: number

  @Field(() => DifficultyInput, { nullable: true })
  difficulty?: DifficultyInput

  @Field(() => [LanguageInput], { nullable: true })
  languages?: Array<LanguageInput>
}

@InputType()
export class DeleteGroupProblemDto extends GetGroupProblemDto {}

@InputType()
export class GetOpenSpaceProblemDto extends GetGroupProblemsDto {}
