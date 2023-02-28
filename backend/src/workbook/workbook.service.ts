import { Injectable } from '@nestjs/common'
import { Workbook } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { OPEN_SPACE_ID } from 'src/common/constants'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkbooksByGroupId(
    cursor: number,
    take: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbooks = await this.prisma.workbook.findMany({
      where: {
        groupId,
        isVisible: true
      },
      select: { id: true, title: true, description: true, updateTime: true },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    return workbooks
  }

  async getAdminWorkbooksByGroupId(
    cursor,
    take,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>[]> {
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbooks = await this.prisma.workbook.findMany({
      where: { groupId },
      select: { id: true, title: true, description: true, updateTime: true },
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      }
    })
    return workbooks
  }

  async getWorkbookById(
    workbookId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>> {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, groupId: groupId, isVisible: true },
      select: { id: true, title: true },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async getAdminWorkbookById(
    workbookId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>> {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, groupId: groupId },
      select: {
        id: true,
        title: true,
        createdBy: {
          select: {
            username: true
          }
        },
        isVisible: true
      },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async createWorkbook(
    createWorkbookDto: CreateWorkbookDto,
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Workbook> {
    const workbook = await this.prisma.workbook.create({
      data: {
        groupId,
        createdById: userId,
        ...createWorkbookDto
      }
    })
    return workbook
  }

  async updateWorkbook(
    groupId: number,
    workbookId: number,
    updateWorkbookDto: UpdateWorkbookDto
  ): Promise<Workbook> {
    await this.prisma.workbook.findFirst({
      where: {
        id: workbookId,
        groupId: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })

    const workbook = await this.prisma.workbook.update({
      where: {
        id: workbookId
      },
      data: {
        ...updateWorkbookDto
      }
    })

    return workbook
  }

  async deleteWorkbook(groupId: number, workbookId: number): Promise<Workbook> {
    await this.prisma.workbook.findFirst({
      where: {
        id: workbookId,
        groupId: groupId
      },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })

    const workbook = await this.prisma.workbook.delete({
      where: {
        id: workbookId
      }
    })

    return workbook
  }

  async isVisible(workbookId: number, groupId: number): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: {
        id: workbookId,
        groupId: groupId,
        isVisible: true
      }
    }))
  }
}
