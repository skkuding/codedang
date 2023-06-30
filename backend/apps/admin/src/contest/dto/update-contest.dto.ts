import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsBoolean, IsDateString, IsString } from 'class-validator'

@InputType()
export class UpdateContestDto {
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
