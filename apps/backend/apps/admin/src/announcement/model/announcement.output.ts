import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Announcement } from '@admin/@generated'

@ObjectType()
export class AnnouncementWithProblemOrder extends Announcement {
  @Field(() => Int, { nullable: true }) // problemOrder 필드 추가
  problemOrder?: number
}
