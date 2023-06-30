import {
  IsArray,
  IsInstance,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max
} from 'class-validator'

class JudgeData {
  @IsNumber()
  @IsNotEmpty()
  acceptedNum: number

  @IsNumber()
  @IsNotEmpty()
  totalTestcase: number

  @IsArray()
  @IsNotEmpty()
  judgeResult: JudgeResult[]
}

export class SubmissionResultMessage {
  @Max(7)
  @Max(1)
  @IsInt()
  @IsNotEmpty()
  resultCode: number

  @IsString()
  @IsNotEmpty()
  submissionId: string

  @IsString()
  @IsNotEmpty()
  error: string

  @IsInstance(JudgeData)
  @IsOptional()
  data: JudgeData
}

export interface JudgeResult {
  testcaseId: string
  resultCode: number
  cpuTime: number
  realTime: number
  memory: number
  signal: number
  exitCode: number
  errorCode: number
}
