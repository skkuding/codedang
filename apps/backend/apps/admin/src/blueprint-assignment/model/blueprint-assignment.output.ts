import { Field, ObjectType, PickType } from '@nestjs/graphql'
import {
  Assignment,
  AssignmentProblem,
  BlueprintAssignment,
  BlueprintAssignmentProblem,
  BlueprintAssignmentSaveAvgAggregate,
  BlueprintAssignmentSaveCountAggregate,
  BlueprintAssignmentSaveMaxAggregate,
  BlueprintAssignmentSaveMinAggregate,
  BlueprintAssignmentSaveSumAggregate
} from '@generated'

// The save receipt is internal persistence, not a public GraphQL resource.
// Prisma's model-level abstract option does not extend to aggregate classes.
for (const aggregate of [
  BlueprintAssignmentSaveAvgAggregate,
  BlueprintAssignmentSaveCountAggregate,
  BlueprintAssignmentSaveMaxAggregate,
  BlueprintAssignmentSaveMinAggregate,
  BlueprintAssignmentSaveSumAggregate
]) {
  ObjectType({ isAbstract: true })(aggregate)
}

// Read-only detail projections of the shared Prisma models; standalone Problem
// APIs own BlueprintAssignmentProblemInput/Output (PR #3947).
@ObjectType()
export class BlueprintAssignmentProblemSummary extends PickType(
  BlueprintAssignmentProblem,
  [
    'blueprintAssignmentId',
    'problemId',
    'order',
    'score',
    'createTime',
    'updateTime'
  ] as const
) {}

@ObjectType()
export class BlueprintAssignmentSectionProblemOutput extends PickType(
  AssignmentProblem,
  [
    'assignmentId',
    'problemId',
    'order',
    'score',
    'solutionReleaseTime',
    'createTime',
    'updateTime'
  ] as const
) {}

@ObjectType()
export class BlueprintAssignmentSectionOutput extends PickType(Assignment, [
  'id',
  'groupId',
  'startTime',
  'dueTime',
  'endTime',
  'title',
  'description',
  'week',
  'isVisible',
  'isFinalScoreVisible',
  'isRankVisible',
  'isJudgeResultVisible',
  'enableCopyPaste',
  'autoFinalizeScore',
  'isExercise'
] as const) {
  @Field(() => [BlueprintAssignmentSectionProblemOutput])
  problems!: BlueprintAssignmentSectionProblemOutput[]
}

@ObjectType()
export class BlueprintAssignmentOutput extends PickType(BlueprintAssignment, [
  'id',
  'blueprintCourseId',
  'createdById',
  'revision',
  'week',
  'title',
  'description',
  'isVisible',
  'isRankVisible',
  'isJudgeResultVisible',
  'enableCopyPaste',
  'autoFinalizeScore',
  'isExercise',
  'createTime',
  'updateTime'
] as const) {
  // Use the Prisma relation names from the API design.
  @Field(() => [BlueprintAssignmentProblemSummary])
  blueprintAssignmentProblem!: BlueprintAssignmentProblemSummary[]

  @Field(() => [BlueprintAssignmentSectionOutput])
  assignment!: BlueprintAssignmentSectionOutput[]
}
