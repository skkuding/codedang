import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Workbook } from '@admin/@generated'

// TODO: e2e 테스트 오류로 인해 Workbook을 Extend하지 않고, 직접 WorkbookModel ObjectType을 정의해야 함
@ObjectType()
export class WorkbookModel extends Workbook {
  @Field(() => Int, { nullable: false })
  declare id: number
}
