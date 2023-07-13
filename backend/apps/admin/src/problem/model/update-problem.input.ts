import { InputType, OmitType } from '@nestjs/graphql'
import { ProblemUncheckedUpdateInput } from '@admin/@generated/problem/problem-unchecked-update.input'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
@InputType()
export class UpdateProblemInput extends OmitType(ProblemUncheckedUpdateInput, [
  'contestProblem',
  'createTime',
  'workbookProblem',
  'updateTime',
  'createdById',
  'groupId',
  'submission',
  'problemTestcase',
  'problemTag'
]) {}
