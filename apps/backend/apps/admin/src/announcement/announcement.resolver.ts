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
      return await this.announcementService.createAnnouncement(
        announcementInput
      )
    } catch (error) {
      if (error instanceof DuplicateFoundException || EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => [Announcement], { name: 'getAnnouncements' })
  async getAnnouncements(
    @Args('contestId', { type: () => Int }) contestId: number,
    @Args('problemId', { type: () => Int, nullable: true }) problemId?: number
  ) {
    try {
      return await this.announcementService.getAnnouncements(
        contestId,
        problemId
      )
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Query(() => Announcement, { name: 'getAnnouncementById' })
  async getAnnouncementById(@Args('id', { type: () => Int }) id: number) {
    try {
      return await this.announcementService.getAnnouncementById(id)
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
    @Args('content', { type: () => String }) content: string
  ) {
    try {
      return await this.announcementService.updateAnnouncement(id, content)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }

  @Mutation(() => Announcement)
  async removeAnnouncement(@Args('id', { type: () => Int }) id: number) {
    try {
      return await this.announcementService.removeAnnouncement(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw error.convert2HTTPException()
      }
      this.logger.error(error)
      throw new InternalServerErrorException()
    }
  }
}
