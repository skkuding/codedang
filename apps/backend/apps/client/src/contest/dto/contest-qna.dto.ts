import { IsNotEmpty, IsString } from 'class-validator'

export class ContestQnACreateDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string
}
