import { Injectable } from '@nestjs/common'
import { Workbook } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAdminFindWhereOption: object = { isVisible: true }

  async getWorkbooksByGroupId(
    groupId: number,
    isAdmin: boolean
  ): Promise<Partial<Workbook>[]> {
    const whereOption = isAdmin ? {} : this.prismaAdminFindWhereOption
    const workbooks = await this.prisma.workbook.findMany({
      where: {
        groupId,
        ...whereOption
      },
      select: { title: true, description: true, updateTime: true }
    })
    return workbooks
  }

  async getWorkbookById(
    workbookId: number,
    isAdmin: boolean
  ): Promise<Workbook> {
    const whereOption = isAdmin ? {} : this.prismaAdminFindWhereOption
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, ...whereOption },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async createWorkbook(
    userId: number,
    groupId: number,
    createWorkbookDto: CreateWorkbookDto
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
}
