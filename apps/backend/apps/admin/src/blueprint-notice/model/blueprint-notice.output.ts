import { Field, Int, ObjectType, PickType } from '@nestjs/graphql'
import {
  BlueprintNotice,
  BlueprintNoticeSaveAvgAggregate,
  BlueprintNoticeSaveCountAggregate,
  BlueprintNoticeSaveMaxAggregate,
  BlueprintNoticeSaveMinAggregate,
  BlueprintNoticeSaveSumAggregate,
  CourseNotice
} from '@generated'

// The save receipt is internal persistence, not a public GraphQL resource.
// Prisma's model-level abstract option does not extend to aggregate classes.
for (const aggregate of [
  BlueprintNoticeSaveAvgAggregate,
  BlueprintNoticeSaveCountAggregate,
  BlueprintNoticeSaveMaxAggregate,
  BlueprintNoticeSaveMinAggregate,
  BlueprintNoticeSaveSumAggregate
]) {
  ObjectType({ isAbstract: true })(aggregate)
}

/**
 * A notice copy distributed to a section. Unloaded relations and readBy are not exposed.
 */
@ObjectType()
export class BlueprintNoticeCopyOutput extends PickType(CourseNotice, [
  'id',
  'groupId',
  'isPublic',
  'isFixed',
  'createTime',
  'updateTime'
] as const) {}

/**
 * A blueprint notice source with its currently linked copies.
 */
@ObjectType()
export class BlueprintNoticeOutput extends PickType(BlueprintNotice, [
  'id',
  'blueprintCourseId',
  'createdById',
  'revision',
  'title',
  'content',
  'createTime',
  'updateTime'
] as const) {
  // Use the Prisma relation name, like BlueprintAssignmentOutput.
  @Field(() => [BlueprintNoticeCopyOutput])
  courseNotice!: BlueprintNoticeCopyOutput[]
}

/**
 * The result of an unlink. blueprintNoticeId is null afterwards.
 */
@ObjectType()
export class BlueprintNoticeUnlinkResult extends PickType(CourseNotice, [
  'id',
  'groupId',
  'blueprintNoticeId'
] as const) {}

/**
 * The impact shown in the blueprint notice deletion dialog.
 * Notices have no learning records and are always deletable, so there is no deletable field.
 */
@ObjectType()
export class BlueprintNoticeDeletionImpact {
  @Field(() => Int, { description: 'Number of source notices to delete' })
  noticeCount!: number

  @Field(() => Int, {
    description: 'Number of linked section copies deleted together'
  })
  copyCount!: number

  @Field(() => Int, { description: 'Number of affected sections' })
  sectionCount!: number

  @Field(() => Int, {
    description: 'Number of visible comments on the deleted copies'
  })
  commentCount!: number
}
