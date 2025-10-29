import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator'

class Result {
  jplagOutput: string
}

export class CheckResponseMsg {
  @IsNumber()
  @IsNotEmpty()
  checkId: number

  @Min(0)
  @IsNotEmpty()
  resultCode: number

  @IsString()
  error: string

  @Type(() => Result)
  checkResult: Result | null
}
