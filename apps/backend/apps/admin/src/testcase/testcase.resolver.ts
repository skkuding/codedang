import { Resolver, Query, Args, Int } from '@nestjs/graphql'
import { TestcaseModel } from './model/testcase.model'
import { TestcaseService } from './testcase.service'

@Resolver(() => TestcaseModel)
export class TestcaseResolver {
  constructor(private readonly testcaseService: TestcaseService) {}

  @Query(() => [TestcaseModel])
  async testcases(
    @Args('problemId', { type: () => Int })
    problemId: number
  ): Promise<TestcaseModel[]> {
    return await this.testcaseService.getTestcases(problemId)
  }

  // TODO: move testcase resolvers from problem module
}
