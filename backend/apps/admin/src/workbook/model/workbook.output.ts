import { ObjectType, Field } from '@nestjs/graphql'
import { Submission } from '@admin/@generated'
import { Problem } from '@admin/@generated/problem/problem.model'
import { WorkbookModel } from './workbook.model'

@ObjectType()
export class WorkbookDetail extends WorkbookModel {
  @Field(() => [Problem], { nullable: true })
  problems: Problem[]

  @Field(() => [Submission], { nullable: true })
  submissions: Submission[]
}
