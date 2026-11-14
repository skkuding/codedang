import { Field, ObjectType, OmitType, PickType } from '@nestjs/graphql'
import { BlueprintCourse, CourseInfo } from '@admin/@generated'
import { FindGroup } from '../../group/model/group.output'

/**
 * Section course information without unloaded relations.
 */
@ObjectType()
export class BlueprintCourseInfoOutput extends OmitType(CourseInfo, [
  'group',
  'blueprintCourse'
] as const) {}

/**
 * Section output with populated course information and without count fields.
 */
@ObjectType()
export class BlueprintSectionOutput extends OmitType(FindGroup, [
  '_count',
  'courseInfo'
] as const) {
  @Field(() => BlueprintCourseInfoOutput, { nullable: true })
  courseInfo?: BlueprintCourseInfoOutput | null
}

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
