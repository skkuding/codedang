import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  // TODO: test 작성
  async isPublicAndVisibleWorkbook(workbookId: number): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: {
        id: workbookId,
        visible: true,
        isPublic: true
      }
    }))
  }

  async isVisibleWorkbookOfGroup(
    groupId: number,
    workbookId: number
  ): Promise<boolean> {
    return !!(await this.prisma.workbook.count({
      where: {
        id: workbookId,
        visible: true,
        groupId: groupId
      }
    }))
  }
}
