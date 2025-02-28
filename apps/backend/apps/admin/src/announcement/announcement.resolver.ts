import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Announcement } from '@generated'
import { AnnouncementService } from './announcement.service'
import { CreateAnnouncementInput } from './dto/create-announcement.input'
import { UpdateAnnouncementInput } from './dto/update-announcement.input'

@Resolver(() => Announcement)
export class AnnouncementResolver {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Mutation(() => Announcement)
  createAnnouncement(
    @Args('createAnnouncementInput')
    createAnnouncementInput: CreateAnnouncementInput
  ) {
    return this.announcementService.create(createAnnouncementInput)
  }

  @Query(() => [Announcement], { name: 'announcement' })
  findAll() {
    return this.announcementService.findAll()
  }

  @Query(() => [Announcement], { name: 'announcementByProblemId' })
  findByProblemId(@Args('problemId', { type: () => Int }) problemId: number) {
    return this.announcementService.findByProblemId(problemId)
  }

  @Query(() => [Announcement], { name: 'announcementByContestId' })
  findByContestId(@Args('contestId', { type: () => Int }) contestId: number) {
    return this.announcementService.findByContestId(contestId)
  }

  @Query(() => Announcement, { name: 'announcement' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.announcementService.findOne(id)
  }

  @Mutation(() => Announcement)
  updateAnnouncement(
    @Args('updateAnnouncementInput')
    updateAnnouncementInput: UpdateAnnouncementInput
  ) {
    return this.announcementService.update(
      updateAnnouncementInput.id,
      updateAnnouncementInput
    )
  }

  @Mutation(() => Announcement)
  removeAnnouncement(@Args('id', { type: () => Int }) id: number) {
    return this.announcementService.remove(id)
  }
}
