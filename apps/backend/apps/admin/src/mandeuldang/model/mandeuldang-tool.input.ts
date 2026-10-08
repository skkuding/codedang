import { Field, InputType, Int } from '@nestjs/graphql'
import { Min, ValidatePromise } from 'class-validator'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.mjs'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import { ToolType } from '@admin/@generated'

@InputType()
export class UploadMandeuldangToolInput {
  @Field(() => Int, { nullable: false })
  @Min(1)
  problemId!: number

  @Field(() => ToolType, { nullable: false })
  toolType!: ToolType

  @Field(() => GraphQLUpload, { nullable: false })
  @ValidatePromise()
  file!: Promise<FileUpload>
}
