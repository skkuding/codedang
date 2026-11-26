import { Field, InputType, Int } from '@nestjs/graphql'
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  Min
} from 'class-validator'

// Requires at least one non-whitespace character. Input is not trimmed.
const NOT_BLANK = /\S/

/**
 * Input for creating a blueprint notice.
 *
 * Creates the source (title, content) and a CourseNotice copy in each section of sectionGroupIds.
 * Resending with the same operationId returns the existing result without creating again.
 */
@InputType()
export class CreateBlueprintNoticeInput {
  @Field(() => String)
  @IsUUID()
  operationId!: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'title must not be blank' })
  title!: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'content must not be blank' })
  content!: string

  @Field(() => [Int])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  sectionGroupIds!: number[]
}
