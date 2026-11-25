import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeletionImpact {
  @Field(() => Boolean)
  deletable!: boolean

  @Field(() => Int)
  submissionCount!: number

  @Field(() => Int)
  recordedStudentCount!: number

  @Field(() => Int)
  sectionCount!: number

  @Field(() => Int)
  assignmentCount!: number

  @Field(() => Int)
  studentCount!: number

  @Field(() => Int)
  qnaCount!: number

  @Field(() => Int)
  noticeCount!: number
}
