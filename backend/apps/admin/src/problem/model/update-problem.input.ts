import { InputType, OmitType } from '@nestjs/graphql'
import { ProblemUncheckedUpdateInput } from '@admin/@generated/problem/problem-unchecked-update.input'

@InputType()
export class UpdateProblemInput extends OmitType(ProblemUncheckedUpdateInput, [
  'contestProblem',
  'createTime',
  'workbookProblem',
  'updateTime',
  'createdById',
  'groupId',
  'submission'
]) {}
