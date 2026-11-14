import { Field, ObjectType, OmitType, PickType } from '@nestjs/graphql'
import { BlueprintCourse } from '@admin/@generated'
import { FindGroup } from '../../group/model/group.output'

/**
 * Section output without count fields that the service does not populate.
 */
@ObjectType()
export class BlueprintSectionOutput extends OmitType(FindGroup, [
  '_count'
] as const) {}

/**
 *  Basic Blueprint course information
 *  Excludes relation and count fields that the service does not populate
 */
@ObjectType()
export class BlueprintCourseOutput extends OmitType(BlueprintCourse, [
  '_count',
  'createdBy',
  'courseInfo',
  'blueprintAssignment'
] as const) {}

/**
 * Blueprint course summary and all associated sections for the course list.
 */
@ObjectType()
export class BlueprintCourseListItemOutput extends PickType(
  BlueprintCourseOutput,
  ['id', 'courseTitle', 'courseNum', 'semester'] as const
) {
  @Field(() => [BlueprintSectionOutput])
  sections!: BlueprintSectionOutput[]
}

/**
 * Detailed Blueprint course information and all associated sections.
 */
@ObjectType()
export class BlueprintCourseDetailOutput extends BlueprintCourseOutput {
  @Field(() => [BlueprintSectionOutput])
  sections!: BlueprintSectionOutput[]
}
