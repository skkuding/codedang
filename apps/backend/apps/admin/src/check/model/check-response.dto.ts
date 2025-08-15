import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'

class Result {
  jplagOutput: string
}

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

  @Type(() => Result)
  @IsOptional()
  result?: Result
}
