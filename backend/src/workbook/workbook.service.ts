import { Injectable } from '@nestjs/common'
import { Workbook } from '@prisma/client'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  private prismaAdminFindWhereOption: object = { visible: true }

  async getWorkbooksByGroupId(
    groupId: number,
    isAdmin: boolean
  ): Promise<Workbook[]> {
    const whereOption = isAdmin ? {} : this.prismaAdminFindWhereOption
    const workbooks = await this.prisma.workbook.findMany({
      where: {
        group_id: groupId,
        ...whereOption
      }
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
    groupId: number,
    createWorkbookDto: CreateWorkbookDto
  ): Promise<Workbook> {
    const newWorkbook = await this.prisma.workbook.create({
      data: {
        group_id: groupId,
        ...createWorkbookDto
      }
    })
    return newWorkbook
  }

  async updateWorkbook(
    workbookId: number,
    updateWorkbookDto: UpdateWorkbookDto
  ): Promise<Workbook> {
    const updatedWorkbook = await this.prisma.workbook.update({
      where: {
        id: workbookId
      },
      data: {
        ...updateWorkbookDto
      }
    })
    return updatedWorkbook
  }

  async deleteWorkbook(workbookId: number): Promise<Workbook> {
    const deletedWorkbook = await this.prisma.workbook.delete({
      where: {
        id: workbookId
      }
    })
    return deletedWorkbook
  }
}
