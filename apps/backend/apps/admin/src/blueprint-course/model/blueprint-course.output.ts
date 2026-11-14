import { Field, ObjectType, OmitType, PickType } from '@nestjs/graphql'
import { BlueprintCourse } from '@admin/@generated'
import { FindGroup } from '../../group/model/group.output'

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
  @Field(() => [FindGroup])
  sections!: FindGroup[]
}
