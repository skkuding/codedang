import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator'

export class CheckResponseMsg {
  @Max(2)
  @Min(0)
  @IsNotEmpty()
  resultCode: number

  @IsNumber()
  @IsNotEmpty()
  checkId: number

  @IsString()
  error: string
}
