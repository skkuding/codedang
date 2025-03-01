import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Announcement } from '@generated'
import { AnnouncementService } from './announcement.service'
import { CreateAnnouncementInput } from './model/create-announcement.input'
import { UpdateAnnouncementInput } from './model/update-announcement.input'

@Resolver(() => Announcement)
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Mutation(() => Announcement)
  async createAnnouncement(
    @Args('createAnnouncementInput')
    createAnnouncementInput: CreateAnnouncementInput
  ) {
    return await this.announcementService.createAnnouncement(
      createAnnouncementInput
    )
  }

  @Query(() => [Announcement], { name: 'announcement' })
  async getAllAnnouncements() {
    return await this.announcementService.getAllAnnouncements()
  }

  @Query(() => [Announcement], { name: 'announcementByContestId' })
  async getAnnouncementsByContestId(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.announcementService.getAnnouncementsByContestId(contestId)
  }

  @Query(() => Announcement, { name: 'announcement' })
  async getAnnouncementById(@Args('id', { type: () => Int }) id: number) {
    return await this.announcementService.getAnnouncementById(id)
  }

  @Mutation(() => Announcement)
  async updateAnnouncement(
    @Args('updateAnnouncementInput')
    updateAnnouncementInput: UpdateAnnouncementInput
  ) {
    return await this.announcementService.updateAnnouncement(
      updateAnnouncementInput
    )
  }

  @Mutation(() => Announcement)
  async removeAnnouncement(@Args('id', { type: () => Int }) id: number) {
    return await this.announcementService.removeAnnouncement(id)
  }
}
