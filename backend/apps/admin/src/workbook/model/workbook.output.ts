import { ObjectType, Field } from '@nestjs/graphql'
import { Submission } from '@admin/@generated'
import { Problem } from '@admin/@generated/problem/problem.model'
import { WorkbookModel } from './workbook.model'

@ObjectType()
export class WorkbookDetail extends WorkbookModel {
  @Field(() => [Problem], { nullable: true })
  problems: Partial<Problem>[]

  @Field(() => [Submission], { nullable: true })
  submissions: Partial<Submission>[]
}
