import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Language } from '@generated'
import { Level } from '@generated'
import { GraphQLJSON } from 'graphql-type-json'

@ObjectType()
export class FileUploadOutput {
  @Field(() => Int, { nullable: false })
  id!: number

  @Field(() => Int, { nullable: false })
  createdById!: number

  @Field(() => Int, { nullable: false })
  groupId!: number

  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => String, { nullable: false })
  inputDescription!: string

  @Field(() => String, { nullable: false })
  outputDescription!: string

  @Field(() => String, { nullable: false })
  hint!: string

  @Field(() => [GraphQLJSON], { nullable: false })
  template!: Array<JSON>

  @Field(() => [Language], { nullable: false })
  languages!: Array<keyof typeof Language>

  @Field(() => Int, { nullable: false })
  timeLimit!: number

  @Field(() => Int, { nullable: false })
  memoryLimit!: number

  @Field(() => Level, { nullable: false })
  difficulty!: keyof typeof Level

  @Field(() => String, { nullable: false })
  source!: string

  @Field(() => Date, { nullable: false })
  createTime!: Date | string

  @Field(() => Date, { nullable: false })
  updateTime!: Date | string

  @Field(() => [String], { nullable: false })
  inputExamples!: Array<string>

  @Field(() => [String], { nullable: false })
  outputExamples!: Array<string>
}
