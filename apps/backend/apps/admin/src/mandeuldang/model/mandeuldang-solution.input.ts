import { Field, InputType, Int } from '@nestjs/graphql'
import { Min, ValidatePromise } from 'class-validator'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { Language } from '@admin/@generated'

@InputType()
export class UploadMandeuldangSolutionInput {
  @Field(() => Int)
  @Min(1)
  problemId!: number

  @Field(() => Language)
  language!: Language

  @Field(() => GraphQLUpload)
  @ValidatePromise()
  file!: Promise<FileUpload>
}
