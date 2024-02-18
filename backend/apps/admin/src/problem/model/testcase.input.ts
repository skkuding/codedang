import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class Sample {
  @Field(() => String, { nullable: false })
  input!: string

  @Field(() => String, { nullable: false })
  output!: string
}

@InputType()
export class Testcase extends Sample {
  @Field(() => Int, { nullable: true })
  scoreWeight?: number
}
