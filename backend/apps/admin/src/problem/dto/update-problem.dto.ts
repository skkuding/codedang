import { Field, InputType, Int } from '@nestjs/graphql'
import { ProgramIO } from './create-problem.dto'

@InputType()
export class UpdateProblem {
  @Field(() => Int, { nullable: false })
  problemId: number // modify

  @Field(() => Int, { nullable: true })
  createdById?: number

  @Field(() => Int, { nullable: true })
  groupId?: number

  @Field(() => String, { nullable: true })
  title?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  inputDescription?: string

  @Field(() => String, { nullable: true })
  outputDescription?: string

  @Field(() => String, { nullable: true })
  hint?: string

  @Field(() => [String], { nullable: true })
  languages?: Array<string> // modify

  @Field(() => Int, { nullable: true })
  timeLimit?: number

  @Field(() => Int, { nullable: true })
  memoryLimit?: number

  @Field(() => String, { nullable: true })
  difficulty?: string // modify

  @Field(() => String, { nullable: true })
  source?: string

  @Field(() => Date, { nullable: true })
  createTime?: Date | string

  @Field(() => Date, { nullable: true })
  updateTime?: Date | string

  @Field(() => [String], { nullable: true })
  inputExamples?: Array<string>

  @Field(() => [String], { nullable: true })
  outputExamples?: Array<string>

  // @Field(() => [ProgramIO], { nullable: true })
  // problemTestcase?: Array<ProgramIO>

  // @Field(() => [String], { nullable: true })
  // problemTag?: Array<string>
}
