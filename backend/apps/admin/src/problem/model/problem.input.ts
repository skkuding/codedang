import { Field, InputType, Int } from '@nestjs/graphql'
import { ValidatePromise } from 'class-validator'
import { GraphQLUpload } from 'graphql-upload'
import { Language, Level } from '@admin/@generated'
import type { FileUploadDto } from '../dto/file-upload.dto'
import { Template } from './template.input'
import { Testcase } from './testcase.input'

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

  @Field(() => [Template], { nullable: false })
  template!: Array<Template>

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

  @Field(() => [String], { nullable: false })
  inputExamples!: Array<string>

  @Field(() => [String], { nullable: false })
  outputExamples!: Array<string>

  @Field(() => [Testcase], { nullable: false })
  testcases!: Array<Testcase>

  @Field(() => [Int], { nullable: false })
  tagIds!: Array<number>
}

@InputType()
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
  inputExamples: Array<string>
  outputExamples: Array<string>
}

@InputType()
export class FilterProblemsInput {
  @Field(() => [Level], { nullable: true })
  difficulty?: Array<keyof typeof Level>

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language>
}
