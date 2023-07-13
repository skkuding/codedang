/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Field, InputType, Int, OmitType } from '@nestjs/graphql'
import { ProblemUncheckedUpdateInput } from '@admin/@generated/problem/problem-unchecked-update.input'

@InputType()
export class ProblemTestcaseCreateWithoutProblemInput {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string

  @Field(() => Int, { nullable: true })
  scoreWeight?: number
}

@InputType()
export class ProblemTestcaseWhereUniqueInput {
  @Field(() => Int, { nullable: true })
  id?: number
}

@InputType()
export class ProblemTestcaseCreateOrConnectWithoutProblemInput {
  @Field(() => ProblemTestcaseWhereUniqueInput, { nullable: false })
  where!: ProblemTestcaseWhereUniqueInput

  @Field(() => ProblemTestcaseCreateWithoutProblemInput, { nullable: false })
  create!: ProblemTestcaseCreateWithoutProblemInput
}

@InputType()
export class ProblemTestcaseInput {
  @Field(() => [ProblemTestcaseCreateWithoutProblemInput], { nullable: true })
  create?: Array<ProblemTestcaseCreateWithoutProblemInput>

  @Field(() => [ProblemTestcaseWhereUniqueInput], { nullable: true })
  delete?: Array<ProblemTestcaseWhereUniqueInput>
}

@InputType()
export class ProblemTagWhereUniqueInput {
  @Field(() => Int, { nullable: true })
  id?: number
}

@InputType()
export class ProblemTagInput {
  @Field(() => [ProblemTagWhereUniqueInput], { nullable: true })
  disconnect?: Array<ProblemTagWhereUniqueInput>
  @Field(() => [ProblemTagWhereUniqueInput], { nullable: true })
  connect?: Array<ProblemTagWhereUniqueInput>
}

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
]) {
  //@ts-nocheck
  @Field(() => ProblemTestcaseInput, {
    nullable: false
  })
  problemTestcase: ProblemTestcaseInput

  //@ts-nocheck
  @Field(() => ProblemTagInput, {
    nullable: false
  })
  problemTag: ProblemTagInput
}
