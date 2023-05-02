import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { ProblemService } from './problem.service'
import { ProblemCreateInput } from '@admin/@generated/problem/problem-create.input'
import { Problem } from '@admin/@generated/problem/problem.model'
import { ProblemUpdateInput } from '@admin/@generated/problem/problem-update.input'
import { ProblemWhereUniqueInput } from '@admin/@generated/problem/problem-where-unique.input'

@Resolver('Problem')
export class ProblemResolver {
  constructor(private readonly problemService: ProblemService) {}

  @Mutation(() => Problem, { name: 'createProblem' })
  async create(
    @Args('problemCreateInput') problemCreateInput: ProblemCreateInput
  ) {
    return await this.problemService.create(problemCreateInput)
  }

  @Mutation('removeProblemById')
  async removeProblem(@Args('id') problemId: number) {
    return await this.problemService.remove(problemId)
  }

  @Mutation('updateProblem')
  async updateProblem(
    @Args('id') problemWhereUniqueInput: ProblemWhereUniqueInput,
    @Args('problemUpdateInput') problemUpdateInput: ProblemUpdateInput
  ) {
    return await this.problemService.update(
      problemWhereUniqueInput,
      problemUpdateInput
    )
  }

  @Query(() => Problem, { name: 'problemById' })
  async getById(@Args('problemId') problemId: number) {
    return await this.problemService.findOne(problemId)
  }

  @Query(() => Problem, { name: 'problemByGroupId' })
  async geAllByGroup(
    @Args('groupId') groupId: number,
    @Args('cursor') cursor: number,
    @Args('take') take: number
  ) {
    return await this.problemService.findAll(groupId, cursor, take)
  }
}
