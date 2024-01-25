import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Announcement } from '@admin/@generated'
import { AnnouncementService } from './announcement.service'
import { AnnouncementInput } from './dto/announcement.input'

@Resolver(() => Announcement)
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Mutation(() => Announcement)
  async createAnnouncement(
    @Args('createAnnouncementInput')
    announcementInput: AnnouncementInput
  ) {
    return await this.announcementService.create(announcementInput)
  }

  @Query(() => [Announcement], { name: 'getAnnouncementsByProblemId' })
  async getAnnouncementsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    return await this.announcementService.findAll(problemId)
  }

  @Query(() => Announcement, { name: 'getAnnouncement' })
  async getAnnouncement(@Args('id', { type: () => Int }) id: number) {
    return await this.announcementService.findOne(id)
  }

  @Mutation(() => Announcement)
  async updateAnnouncement(
    @Args('id', { type: () => Int }) id: number,
    @Args('announcementInput') announcementInput: AnnouncementInput
  ) {
    return await this.announcementService.update(id, announcementInput)
  }

  @Mutation(() => Announcement)
  async removeAnnouncement(@Args('id', { type: () => Int }) id: number) {
    return await this.announcementService.delete(id)
  }
}
