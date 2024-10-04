import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'

class JudgeResult {
  testcaseId: number
  resultCode: number
  cpuTime: number
  realTime: number
  memory: number
  signal: number
  exitCode: number
  errorCode: number
  output?: string
}

export class JudgerResponse {
  @Max(9)
  @Min(0)
  @IsNotEmpty()
  resultCode: number

  @IsNumber()
  @IsNotEmpty()
  submissionId: number

  @IsString()
  error: string

  @Type(() => JudgeResult)
  @IsOptional()
  judgeResult?: JudgeResult
}
