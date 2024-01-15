import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class Testcase {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string

  @Field(() => Int, { nullable: true })
  scoreWeight?: number
}

@InputType()
export class ExtendedTestcase extends Testcase {
  @Field(() => Int, { nullable: false })
  id!: number
}
