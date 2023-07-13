import { ObjectType, Field } from '@nestjs/graphql'
import { Problem } from '@admin/@generated/problem/problem.model'
import { Submission } from '@admin/@generated/submission/submission.model'
import { Workbook } from '@admin/@generated/workbook/workbook.model'

@ObjectType()
export class WorkbookDetail {
  @Field(() => [Problem], { nullable: false })
  problems!: [Problem]
  @Field(() => [Submission], { nullable: false })
  submissions!: [Submission]
}
