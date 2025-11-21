import { Directive, Field, InputType, Int } from '@nestjs/graphql'
import { Language, Level } from '@generated'
import { Min, ValidatePromise } from 'class-validator'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.mjs'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUploadDto } from '../dto/file-upload.dto'
import { Solution } from './solution.input'
import { Template } from './template.input'
import { ScoreWeights, Testcase } from './testcase.input'

@InputType()
export class CreateProblemInput {
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

  @Field(() => Boolean, { defaultValue: false })
  isVisible!: boolean

  @Field(() => [Template], { nullable: false })
  template!: Array<Template>

  @Field(() => [Language], { nullable: false })
  languages!: Array<keyof typeof Language>

  @Field(() => [Solution], { nullable: false })
  solution!: Array<Solution>

  @Field(() => Int, { nullable: false })
  timeLimit!: number

  @Field(() => Int, { nullable: false })
  memoryLimit!: number

  @Field(() => Level, { nullable: false })
  difficulty!: keyof typeof Level

  @Field(() => String, { nullable: false })
  source!: string

  @Field(() => [Testcase], {
    nullable: false,
    deprecationReason: 'Use `createTestcases` or `uploadTestcaseZip` instead'
  })
  testcases!: Array<Testcase>

  @Field(() => [Int], { nullable: false })
  tagIds!: Array<number>
}

@InputType()
export class CreateTestcasesInput {
  @Field(() => [Testcase], { nullable: false })
  testcases!: Testcase[]

  @Field(() => Int, { nullable: false })
  @Min(1)
  problemId: number
}

@InputType()
export class UploadTestcaseZipInput {
  @Field(() => GraphQLUpload, { nullable: false })
  @ValidatePromise()
  file: Promise<FileUpload>

  @Field(() => Int, { nullable: false })
  @Min(1)
  problemId: number
}

@InputType()
export class UploadTestcaseZipLegacyInput {
  @Field(() => GraphQLUpload, { nullable: false })
  @ValidatePromise()
  file: Promise<FileUpload>

  @Field(() => Int, { nullable: false })
  @Min(1)
  problemId: number

  @Field(() => Boolean, { nullable: false })
  isHidden: boolean

  @Field(() => [ScoreWeights], { nullable: false })
  scoreWeights: ScoreWeights[]
}

@InputType()
@Directive(
  '@deprecated(reason: "Use `type: () => GraphQLUpload` directly instead")'
)
export class UploadFileInput {
  @Field(() => GraphQLUpload, { nullable: false })
  @ValidatePromise()
  declare file: Promise<FileUploadDto>
}

export interface UploadProblemInput {
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  hint: string
  template: Array<Template>
  languages: Array<keyof typeof Language>
  timeLimit: number
  memoryLimit: number
  difficulty: keyof typeof Level
  source: string
}

@InputType()
export class FilterProblemsInput {
  @Field(() => [Level], { nullable: true })
  difficulty?: Array<keyof typeof Level>

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language>
}

@InputType()
export class UpdateProblemTagInput {
  @Field(() => [Int], { nullable: false })
  create!: Array<number>

  @Field(() => [Int], { nullable: false })
  delete!: Array<number>
}

@InputType()
export class UpdateProblemInput {
  @Field(() => Int, { nullable: false })
  id!: number

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

  @Field(() => Boolean, { nullable: true })
  isVisible?: boolean

  @Field(() => [Template], { nullable: true })
  template?: Array<Template>

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language>

  @Field(() => [Solution], { nullable: true })
  solution?: Array<Solution>

  @Field(() => Int, { nullable: true })
  timeLimit?: number

  @Field(() => Int, { nullable: true })
  memoryLimit?: number

  @Field(() => Level, { nullable: true })
  difficulty?: keyof typeof Level

  @Field(() => String, { nullable: true })
  source?: string

  @Field(() => [Testcase], { nullable: true })
  testcases?: Array<Testcase>

  @Field(() => UpdateProblemTagInput, { nullable: true })
  tags?: UpdateProblemTagInput
}
