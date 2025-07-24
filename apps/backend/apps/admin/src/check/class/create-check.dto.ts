import { Language } from '@prisma/client'
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator'

export class CreatePlagiarismCheckDto {
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language

  @IsBoolean()
  checkPreviousSubmissions: boolean = true

  @IsInt()
  minTokens: number = 12

  @IsBoolean()
  enableMerging: boolean = false

  @IsBoolean()
  useJplagClustering: boolean = true
}
