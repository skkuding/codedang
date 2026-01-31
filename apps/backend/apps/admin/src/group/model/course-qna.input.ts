import { Field, InputType, Int } from '@nestjs/graphql'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator'

@InputType()
export class UpdateCourseQnAInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  order: number

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  content?: string

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isResolved?: boolean
}
