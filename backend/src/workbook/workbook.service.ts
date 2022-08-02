import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class WorkbookService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicWorkbooks() {
    return
  }

  async getGroupWorkbooks() {
    return
  }

  async getWorkbookInfo() {
    return
  }

  async getWorkbookProblems() {
    return
  }

  async createWorkbook() {
    return
  }

  async updateWorkbook() {
    return
  }

  async deleteWorkbook() {
    return
  }
}
