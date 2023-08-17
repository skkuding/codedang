import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { ContestproblemService } from './contestproblem.service'
import { CreateContestproblemInput } from './dto/create-contestproblem.input'
import { UpdateContestproblemInput } from './dto/update-contestproblem.input'
import { Contestproblem } from './entities/contestproblem.entity'

@Resolver(() => Contestproblem)
export class ContestproblemResolver {
  constructor(private readonly contestproblemService: ContestproblemService) {}

  @Mutation(() => Contestproblem)
  createContestproblem(
    @Args('createContestproblemInput')
    createContestproblemInput: CreateContestproblemInput
  ) {
    return this.contestproblemService.create(createContestproblemInput)
  }

  @Query(() => [Contestproblem], { name: 'contestproblem' })
  findAll() {
    return this.contestproblemService.findAll()
  }

  @Query(() => Contestproblem, { name: 'contestproblem' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.contestproblemService.findOne(id)
  }

  @Mutation(() => Contestproblem)
  updateContestproblem(
    @Args('updateContestproblemInput')
    updateContestproblemInput: UpdateContestproblemInput
  ) {
    return this.contestproblemService.update(
      updateContestproblemInput.id,
      updateContestproblemInput
    )
  }

  @Mutation(() => Contestproblem)
  removeContestproblem(@Args('id', { type: () => Int }) id: number) {
    return this.contestproblemService.remove(id)
  }
}
