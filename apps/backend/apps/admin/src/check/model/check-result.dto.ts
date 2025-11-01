import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested
} from 'class-validator'

@ObjectType()
export class Position {
  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { nullable: false })
  line: number

  @IsInt()
  @IsNotEmpty()
  @Field(() => Int, { nullable: false })
  column: number
}

@ObjectType()
export class Match {
  @ValidateNested()
  @Type(() => Position)
  @IsNotEmpty()
  @Field(() => Position, { nullable: false })
  startInFirst: Position

  @ValidateNested()
  @Type(() => Position)
  @IsNotEmpty()
  @Field(() => Position, { nullable: false })
  endInFirst: Position

  @ValidateNested()
  @Type(() => Position)
  @IsNotEmpty()
  @Field(() => Position, { nullable: false })
  startInSecond: Position

  @ValidateNested()
  @Type(() => Position)
  @IsNotEmpty()
  @Field(() => Position, { nullable: false })
  endInSecond: Position

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int, { nullable: false })
  lengthOfFirst: number

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int, { nullable: false })
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
