import { Field, InputType } from '@nestjs/graphql'
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString
} from 'class-validator'

@InputType()
export class CreateContestDto {
  @Field()
  @IsInt()
  @IsNotEmpty()
  readonly groupId: number

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly title: string

  @Field()
  @IsString()
  @IsNotEmpty()
  readonly description: string

  @Field()
  @IsDateString()
  @IsNotEmpty()
  readonly startTime: Date

  @Field()
  @IsDateString()
  @IsNotEmpty()
  readonly endTime: Date

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  readonly isVisible: boolean

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  readonly isRankVisible: boolean
}
