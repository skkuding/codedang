import { Injectable } from '@nestjs/common'
import { Workbook } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
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
      skip: skip,
      take: take,
      cursor: {
        id: cursor
      },
      where: {
        groupId,
        isVisible: true
      },
      select: { title: true, description: true, updateTime: true }
    })
    return workbooks
  }

  async getAdminWorkbooksByGroupId(
    groupId = OPEN_SPACE_ID
  ): Promise<Partial<Workbook>[]> {
    const workbooks = await this.prisma.workbook.findMany({
      where: {
        groupId
      },
      select: { title: true, description: true, updateTime: true }
    })
    return workbooks
  }

  async getWorkbookById(workbookId: number): Promise<Workbook> {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, isVisible: true },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async getAdminWorkbookById(workbookId: number): Promise<Workbook> {
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async createWorkbook(
    createWorkbookDto: CreateWorkbookDto,
    userId: number,
    groupId = OPEN_SPACE_ID
  ): Promise<Workbook> {
    const newWorkbook = await this.prisma.workbook.create({
      data: {
        groupId,
        createdById: userId,
        ...createWorkbookDto
      }
    })
    return newWorkbook
  }

  async updateWorkbook(
    workbookId: number,
    updateWorkbookDto: UpdateWorkbookDto
  ): Promise<Workbook> {
    try {
      const updatedWorkbook = await this.prisma.workbook.update({
        where: {
          id: workbookId
        },
        data: {
          ...updateWorkbookDto
        }
      })
      return updatedWorkbook
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('workbook')
      } else {
        throw error
      }
    }
  }

  async deleteWorkbook(workbookId: number): Promise<Workbook> {
    try {
      const deletedWorkbook = await this.prisma.workbook.delete({
        where: {
          id: workbookId
        }
      })
      return deletedWorkbook
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotExistException('workbook')
      } else {
        throw error
      }
    }
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
