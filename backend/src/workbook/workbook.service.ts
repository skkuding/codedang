import { Injectable } from '@nestjs/common'
import { EntityNotExistException } from 'src/common/exception/business.exception'
import { PrismaService } from 'src/prisma/prisma.service'

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
}
