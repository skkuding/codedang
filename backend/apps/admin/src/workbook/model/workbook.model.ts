import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Workbook } from '@admin/@generated'

@ObjectType()
export class WorkbookModel extends Workbook {
  @Field(() => Int, { nullable: false })
  declare id: number
}
