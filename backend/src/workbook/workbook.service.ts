import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateWorkbookDto } from './dto/create-workbook.dto'
import { UpdateWorkbookDto } from './dto/update-workbook.dto'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  private prismaFindWhereOption: object = { visible: true }

  async getWorkbooksByGroupId(groupId: number, isAdmin: boolean) {
    const whereOption = isAdmin ? {} : this.prismaFindWhereOption
    const workbooks = await this.prisma.workbook.findMany({
      where: {
        group_id: groupId,
        ...whereOption
      }
    })
    return workbooks
  }

  async getWorkbookById(workbookId: number, isAdmin: boolean) {
    const whereOption = isAdmin ? {} : this.prismaFindWhereOption
    const workbook = await this.prisma.workbook.findFirst({
      where: { id: workbookId, ...whereOption },
      rejectOnNotFound: () => new EntityNotExistException('workbook')
    })
    return workbook
  }

  async createWorkbook(groupId: number, createWorkbookDto: CreateWorkbookDto) {
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
  ) {
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

  async deleteWorkbook(workbookId: number) {
    const deletedWorkbook = await this.prisma.workbook.delete({
      where: {
        id: workbookId
      }
    })
    return deletedWorkbook
  }
}
