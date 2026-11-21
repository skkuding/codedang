import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Announcement, ContestRole } from '@generated'
import { UseContestRolesGuard } from '@libs/auth'
import { AnnouncementService } from './announcement.service'
import { AnnouncementWithProblemOrder } from './model/announcement.output'
import { CreateAnnouncementInput } from './model/create-announcement.input'
import { UpdateAnnouncementInput } from './model/update-announcement.input'

@Resolver(() => Announcement)
@UseContestRolesGuard(ContestRole.Manager)
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  /**
   * Creates a new announcement for a contest.
   */
  @Mutation(() => Announcement)
  async createAnnouncement(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('input')
    input: CreateAnnouncementInput
  ) {
    return await this.announcementService.createAnnouncement(contestId, input)
  }

  /**
   * Gets the announcements of a contest, newest first.
   */
  @Query(() => [AnnouncementWithProblemOrder], {
    name: 'announcementByContestId'
  })
  async getAnnouncementsByContestId(
    @Args('contestId', { type: () => Int }) contestId: number
  ) {
    return await this.announcementService.getAnnouncementsByContestId(contestId)
  }

  /**
   * Gets a single announcement.
   */
  @Query(() => Announcement, { name: 'announcement' })
  async getAnnouncementById(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
    return await this.announcementService.getAnnouncementById(contestId, id)
  }

  /**
   * Updates an announcement.
   */
  @Mutation(() => Announcement)
  async updateAnnouncement(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('input')
    input: UpdateAnnouncementInput
  ) {
    return await this.announcementService.updateAnnouncement(contestId, input)
  }

  /**
   * Deletes an announcement.
   */
  @Mutation(() => Announcement)
  async removeAnnouncement(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
    return await this.announcementService.removeAnnouncement(contestId, id)
  }
}
