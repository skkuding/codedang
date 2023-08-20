import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

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

class JudgeData {
  @IsNumber()
  @IsNotEmpty()
  acceptedNum: number

  @IsNumber()
  @IsNotEmpty()
  totalTestcase: number

  @Type(() => JudgeResult)
  @IsNotEmpty()
  judgeResult: JudgeResult[]
}

export class JudgerResponse {
  @IsNumber()
  @IsNotEmpty()
  resultCode: number

  @IsString()
  @IsNotEmpty()
  submissionId: string

  @IsString()
  error: string

  @Type(() => JudgeData)
  @IsOptional()
  data: JudgeData
}
