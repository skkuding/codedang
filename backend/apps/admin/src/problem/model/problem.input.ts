import { Field, InputType } from '@nestjs/graphql'
import { ValidatePromise } from 'class-validator'
import { GraphQLUpload } from 'graphql-upload'
import type { FileUploadDto } from '../dto/file-upload.dto'

@InputType()
export class FileUploadInput {
  @Field(() => GraphQLUpload, { nullable: false })
  @ValidatePromise()
  declare file: Promise<FileUploadDto>
}
