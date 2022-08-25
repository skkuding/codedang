import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class RequestGroupDto {
  @IsString()
  @IsNotEmpty()
  readonly groupName: string

  @IsBoolean()
  @IsNotEmpty()
  readonly private: boolean

  @IsString()
  @IsNotEmpty()
  readonly description: string
}
