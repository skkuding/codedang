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
  Min,
  ValidateIf
} from 'class-validator'

// Requires at least one non-whitespace character. Input is not trimmed.
const NOT_BLANK = /\S/

// Skips validation only when the field is omitted (undefined); null is validated and rejected.
const isProvided = (_: object, value: unknown) => value !== undefined

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

/**
 * Input for updating a blueprint notice. Only the given fields are applied to the source and linked copies.
 *
 * - title, content: omitted fields are unchanged; null, empty and whitespace-only strings are rejected.
 * - expectedRevision: the revision from the detail query. A mismatch is rejected as a save from a stale page.
 * - Linked sections cannot change, and each section manages visibility and pinning.
 */
@InputType()
export class UpdateBlueprintNoticeInput {
  @Field(() => String)
  @IsUUID()
  operationId!: string

  @Field(() => Int)
  @IsInt()
  @Min(1)
  expectedRevision!: number

  @Field(() => String, { nullable: true })
  @ValidateIf(isProvided)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'title must not be blank' })
  title?: string

  @Field(() => String, { nullable: true })
  @ValidateIf(isProvided)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'content must not be blank' })
  content?: string
}
