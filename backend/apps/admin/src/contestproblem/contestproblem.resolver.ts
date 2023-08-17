import { Resolver } from '@nestjs/graphql'
import { ContestproblemService } from './contestproblem.service'
import { Contestproblem } from './entities/contestproblem.entity'

@Resolver(() => Contestproblem)
export class ContestproblemResolver {
  constructor(private readonly contestproblemService: ContestproblemService) {}
}
