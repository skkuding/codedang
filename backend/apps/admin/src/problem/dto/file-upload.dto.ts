import { IsMimeType, IsNotEmpty, IsString } from 'class-validator'
import type { ReadStream } from 'fs'

export class FileUploadDto {
  @IsString()
  @IsNotEmpty()
  readonly filename: string

  @IsString()
  @IsMimeType()
  @IsNotEmpty()
  readonly mimetype: string

  @IsString()
  @IsNotEmpty()
  readonly encoding: string

  readonly createReadStream: () => ReadStream
}
