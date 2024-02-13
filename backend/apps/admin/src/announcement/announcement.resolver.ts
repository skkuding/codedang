import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import {
  DuplicateFoundException,
  EntityNotExistException
} from '@libs/exception'
import { Announcement } from '@admin/@generated'
import { AnnouncementService } from './announcement.service'
import { AnnouncementInput } from './dto/announcement.input'

@Resolver(() => Announcement)
export class AnnouncementResolver {
  private readonly logger = new Logger(AnnouncementResolver.name)
  constructor(private readonly announcementService: AnnouncementService) {}

  @Mutation(() => Announcement)
  async createAnnouncement(
    @Args('createAnnouncementInput')
    announcementInput: AnnouncementInput
  ) {
    try {
      return await this.announcementService.create(announcementInput)
    } catch (error) {
      if (error instanceof DuplicateFoundException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Announcement], { name: 'getAnnouncementsByProblemId' })
  async getAnnouncementsByProblemId(
    @Args('problemId', { type: () => Int }) problemId: number
  ) {
    try {
      return await this.announcementService.findAll(problemId)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => Announcement, { name: 'getAnnouncement' })
  async getAnnouncement(@Args('id', { type: () => Int }) id: number) {
    try {
      return await this.announcementService.findOne(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Announcement)
  async updateAnnouncement(
    @Args('id', { type: () => Int }) id: number,
    @Args('announcementInput') announcementInput: AnnouncementInput
  ) {
    try {
      return await this.announcementService.update(id, announcementInput)
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Announcement)
  async removeAnnouncement(@Args('id', { type: () => Int }) id: number) {
    return await this.announcementService.delete(id)
  }
}
