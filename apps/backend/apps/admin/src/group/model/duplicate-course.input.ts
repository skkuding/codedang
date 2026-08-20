import { Field, GraphQLISODateTime, Int } from '@nestjs/graphql'
import { InputType } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

@InputType()
export class DuplicateCourseInput {
  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  courseNum: string

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  semester: string

  @Field(() => GraphQLISODateTime, { nullable: false })
  endDate: Date

  @Field(() => Int, { nullable: false })
  @IsInt()
  @Min(1)
  @Max(99)
  classNum: number
}
