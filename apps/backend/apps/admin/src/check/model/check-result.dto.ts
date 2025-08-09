import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested
} from 'class-validator'

export class Position {
  @IsInt()
  @IsNotEmpty()
  line: number

  @IsInt()
  @IsNotEmpty()
  column: number
}

export class Match {
  @ValidateNested()
  @Type(() => Similarities)
  @IsNotEmpty()
  startInFirst: Position

  @ValidateNested()
  @Type(() => Similarities)
  @IsNotEmpty()
  endInFirst: Position

  @ValidateNested()
  @Type(() => Similarities)
  @IsNotEmpty()
  startInSecond: Position

  @ValidateNested()
  @Type(() => Similarities)
  @IsNotEmpty()
  endInSecond: Position

  @IsNumber()
  @IsNotEmpty()
  lengthOfFirst: number

  @IsNumber()
  @IsNotEmpty()
  lengthOfSecond: number
}

export class Similarities {
  @IsNumber()
  @IsNotEmpty()
  AVG: number

  @IsNumber()
  @IsNotEmpty()
  MAX: number

  @IsInt()
  @IsNotEmpty()
  MAXIMUMLENGTH: number

  @IsInt()
  @IsNotEmpty()
  LONGESTMATCH: number
}

export class Comparison {
  @IsInt()
  @IsNotEmpty()
  firstSubmissionId: number

  @IsInt()
  @IsNotEmpty()
  secondSubmissionId: number

  @ValidateNested()
  @Type(() => Similarities)
  @IsNotEmpty()
  similarities: Similarities

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Match)
  matches: Match[]

  @IsNumber()
  @IsNotEmpty()
  firstSimilarity: number

  @IsNumber()
  @IsNotEmpty()
  secondSimilarity: number
}

export class Cluster {
  @IsNumber()
  @IsNotEmpty()
  averageSimilarity: number

  @IsNumber()
  @IsNotEmpty()
  strength: number

  @IsArray()
  @ValidateNested({ each: true })
  @IsNumber({}, { each: true })
  members: number[]
}
