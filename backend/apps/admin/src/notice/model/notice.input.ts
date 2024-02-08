import { InputType, PartialType, PickType } from '@nestjs/graphql'
import { NoticeCreateInput } from '@generated'

@InputType()
export class CreateNoticeInput extends PickType(NoticeCreateInput, [
  'title',
  'content',
  'isVisible',
  'isFixed'
]) {}

@InputType()
export class UpdateNoticeInput extends PartialType(CreateNoticeInput) {}
