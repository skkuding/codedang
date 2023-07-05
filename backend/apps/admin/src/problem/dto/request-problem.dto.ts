import { Field, InputType, Int } from '@nestjs/graphql'
import { Language } from '@admin/@generated/prisma/language.enum'
import { Level } from '@admin/@generated/prisma/level.enum'

@InputType()
export class GetGroupProblemDto {
  @Field(() => Int)
  problemId: number
}

@InputType()
export class GetGroupProblemsDto {
  @Field(() => Int)
  groupId: number

  @Field(() => Int)
  cursor: number

  @Field(() => Int)
  take: number

  @Field(() => Int, { nullable: true })
  createdById?: number

  @Field(() => Level, { nullable: true })
  difficulty?: Level

  @Field(() => [Language], { nullable: true })
  languages?: Array<Language>
}

@InputType()
export class DeleteGroupProblemDto extends GetGroupProblemDto {}

@InputType()
export class GetOpenSpaceProblemsDto {
  @Field(() => Int)
  cursor: number

  @Field(() => Int)
  take: number

  @Field(() => Int, { nullable: true })
  createdById?: number

  @Field(() => Level, { nullable: true })
  difficulty?: Level

  @Field(() => [Language], { nullable: true })
  languages?: Array<Language>
}
