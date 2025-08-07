import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator'

class CheckResult {
  testcaseId: number
  cpuTime: number
  realTime: number
  memory: number
  signal: number
  exitCode: number
  errorCode: number
  output?: string
}

export class CheckResponse {
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
