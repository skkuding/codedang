import { Injectable } from '@nestjs/common'
import { Prisma, type Tag } from '@prisma/client'
import {
  DuplicateFoundException,
  EntityNotExistException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { UpdateProblemTagInput } from '../model/problem.input'

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 새로운 태그를 생성합니다
   * @param tagName - unique한 태그이름
   * @returns
   * @throws DuplicateFoundException - 이미 존재하는 태그일 경우
   */
  async createTag(tagName: string): Promise<Tag> {
    // 존재하는 태그일 경우 에러를 throw합니다
    try {
      return await this.prisma.tag.create({
        data: {
          name: tagName
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new DuplicateFoundException('tag')

      throw error
    }
  }

  async updateProblemTag(
    problemId: number,
    problemTags: UpdateProblemTagInput
  ) {
    const createIds = problemTags.create.map(async (tagId) => {
      const check = await this.prisma.problemTag.findFirst({
        where: {
          tagId,
          problemId
        }
      })
      if (check) {
        throw new DuplicateFoundException(`${tagId} tag`)
      }
      return { tag: { connect: { id: tagId } } }
    })

    const deleteIds = problemTags.delete.map(async (tagId) => {
      const check = await this.prisma.problemTag.findFirstOrThrow({
        where: {
          tagId,
          problemId
        },
        select: { id: true }
      })
      return { id: check.id }
    })

    return {
      create: await Promise.all(createIds),
      delete: await Promise.all(deleteIds)
    }
  }

  async deleteTag(tagName: string): Promise<Partial<Tag>> {
    const tag = await this.prisma.tag.findFirst({
      where: {
        name: tagName
      }
    })
    if (!tag) {
      throw new EntityNotExistException('tag')
    }
    return await this.prisma.tag.delete({
      where: {
        id: tag.id
      }
    })
  }
  async getTags(): Promise<Partial<Tag>[]> {
    return await this.prisma.tag.findMany()
  }

  async getTag(tagId: number) {
    const tag = await this.prisma.tag.findUnique({
      where: {
        id: tagId
      }
    })
    if (tag == null) {
      throw new EntityNotExistException('problem')
    }
    return tag
  }

  async getProblemTags(problemId: number) {
    return await this.prisma.problemTag.findMany({
      where: {
        problemId
      }
    })
  }
}
