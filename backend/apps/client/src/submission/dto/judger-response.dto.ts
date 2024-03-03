import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator'

class JudgeResult {
  testcaseId: string
  resultCode: number
  cpuTime: number
  realTime: number
  memory: number
  signal: number
  exitCode: number
  errorCode: number
}

export class JudgerResponse {
  @Max(8)
  @Min(0)
  @IsNotEmpty()
  resultCode: number

  @IsNumber()
  @IsNotEmpty()
  submissionId: number

  @IsString()
  error: string

  @Type(() => JudgeResult)
  @IsNotEmpty()
  judgeResult: JudgeResult
}
