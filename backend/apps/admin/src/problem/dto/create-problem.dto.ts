import { Field, InputType, Int } from '@nestjs/graphql'
import { ProblemTestcaseCreateWithoutProblemInput } from '@admin/@generated/problem-testcase/problem-testcase-create-without-problem.input'
import { LanguageInput, DifficultyInput } from './update-problem.dto'

@InputType()
export class TestCaseDto {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string
}

@InputType()
export class CreateGroupProblemDto {
  @Field(() => Int)
  createdById: number

  @Field(() => Int)
  groupId: number

  @Field({ nullable: false })
  title: string

  @Field({ nullable: false })
  description: string

  @Field({ nullable: false })
  inputDescription: string

  @Field({ nullable: false })
  outputDescription: string

  @Field({ nullable: false })
  hint: string

  @Field(() => Int)
  timeLimit: number

  @Field(() => Int)
  memoryLimit: number

  @Field(() => DifficultyInput, { nullable: true })
  difficulty: DifficultyInput // modify

  @Field(() => [LanguageInput], { nullable: true })
  languages?: Array<LanguageInput>

  @Field({ nullable: false })
  source: string

  @Field(() => [String], { nullable: true })
  inputExamples?: Array<string>

  @Field(() => [String], { nullable: true })
  outputExamples?: Array<string>

  @Field(() => [TestCaseDto], { nullable: true })
  problemTestcase?: Array<TestCaseDto>

  @Field(() => [String], { nullable: true })
  problemTag?: Array<string>
}
