import { Injectable } from '@nestjs/common'
import { Workbook } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { PUBLIC_GROUP_ID } from 'src/common/constants'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAdminFindWhereOption: object = { isVisible: true }

  async getWorkbooks(
    cursor: number,
    take: number,
    isAdmin: boolean,
    groupId = PUBLIC_GROUP_ID
  ): Promise<Partial<Workbook>[]> {
    const whereOption = isAdmin ? {} : this.prismaAdminFindWhereOption
    let skip = 1
    if (!cursor) {
      cursor = 1
      skip = 0
    }
    const workbooks = await this.prisma.workbook.findMany({
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      },
      where: {
        groupId,
        ...whereOption
      },
      select: { title: true, description: true, updateTime: true }
    })
    return workbooks
  }

  async getWorkbook(
    workbookId: number,
    isAdmin: boolean,
    groupId = PUBLIC_GROUP_ID
  ): Promise<Partial<Workbook>> {
    const whereOption = isAdmin ? {} : this.prismaAdminFindWhereOption
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, groupId: groupId, ...whereOption },
      select: { id: true, title: true },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async createWorkbook(
    userId: number,
    groupId: number,
    createWorkbookDto: CreateWorkbookDto
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
