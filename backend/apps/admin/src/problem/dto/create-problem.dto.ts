import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class ProgramIO {
  @Field({ nullable: false })
  input: string

  @Field({ nullable: false })
  output: string
}

@InputType()
export class CreateProblem {
  @Field(() => Int)
  createdById: number

  @Field(() => Int)
  groupId: number

  @Field({ nullable: false })
  title: string

  @Field({ nullable: false })
  description: string

  @Field({ nullable: false })
  inputDescription: string

  @Field({ nullable: false })
  outputDescription: string

  @Field({ nullable: false })
  hint: string

  @Field(() => Int)
  timeLimit: number

  @Field(() => Int)
  memoryLimit: number

  @Field({ nullable: false })
  difficulty: string

  // @Field(() => [String])
  // tags: string[]

  @Field({ nullable: false })
  source: string

  // @Field(() => [ProgramIO])
  // sample: ProgramIO[]

  // @Field(() => [ProgramIO])
  // testcase: ProgramIO[]
}
