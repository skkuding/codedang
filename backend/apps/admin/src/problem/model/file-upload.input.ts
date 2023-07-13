import { Field, InputType } from '@nestjs/graphql'
import { GraphQLUpload } from 'graphql-upload'
import { type FileUploadDto } from '../dto/file-upload.dto'
import { ValidatePromise } from 'class-validator'

@InputType()
export class FileUploadInput {
  @Field(() => GraphQLUpload, { nullable: false })
  @ValidatePromise()
  declare file: Promise<FileUploadDto>
}
