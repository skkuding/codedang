import { Field, InputType, Int } from '@nestjs/graphql'
import { registerEnumType } from '@nestjs/graphql'

export enum LanguageInput {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  C = 'C',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Cpp = 'Cpp',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Java = 'Java',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Python3 = 'Python3'
}

export enum DifficultyInput {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Level1 = 'Level1',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Level2 = 'Level2',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Level3 = 'Level3'
}

registerEnumType(LanguageInput, {
  name: 'LanguageInput'
})

registerEnumType(DifficultyInput, {
  name: 'DiffcultyInput'
})

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

  @Field(() => [LanguageInput], { nullable: true })
  languages?: Array<LanguageInput> // modify

  @Field(() => Int, { nullable: true })
  timeLimit?: number

  @Field(() => Int, { nullable: true })
  memoryLimit?: number

  @Field(() => DifficultyInput, { nullable: true })
  difficulty?: DifficultyInput // modify

  @Field(() => String, { nullable: true })
  source?: string

  // @Field(() => [String], { nullable: true })
  // inputExamples?: Array<string>

  // @Field(() => [String], { nullable: true })
  // outputExamples?: Array<string>

  // @Field(() => [ProblemTestcaseCreateWithoutProblemInput], { nullable: true })
  // problemTestcase?: Array<ProblemTestcaseCreateWithoutProblemInput>

  // @Field(() => [String], { nullable: true })
  // problemTag?: Array<string>
}
// test case 수정?
