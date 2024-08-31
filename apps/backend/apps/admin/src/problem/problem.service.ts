import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from '@nestjs/cache-manager'
import {
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Language } from '@generated'
import type { ContestProblem, Problem, Tag, WorkbookProblem } from '@generated'
import { Level } from '@generated'
import type { ProblemWhereInput } from '@generated'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'
import { Workbook } from 'exceljs'
import type { ReadStream } from 'fs'
import { MAX_DATE, MAX_IMAGE_SIZE, MIN_DATE } from '@libs/constants'
import {
  DuplicateFoundException,
  EntityNotExistException,
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@admin/storage/storage.service'
import { ImportedProblemHeader } from './model/problem.constants'
import type {
  CreateProblemInput,
  UploadFileInput,
  FilterProblemsInput,
  UpdateProblemInput,
  UpdateProblemTagInput
} from './model/problem.input'
import type { ProblemWithIsVisible } from './model/problem.output'
import type { Template } from './model/template.input'
import type { Testcase } from './model/testcase.input'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async createProblem(
    input: CreateProblemInput,
    userId: number,
    groupId: number
  ) {
    const { languages, template, tagIds, testcases, isVisible, ...data } = input
    if (!languages.length) {
      throw new UnprocessableDataException(
        'A problem should support at least one language'
      )
    }
    template.forEach((template) => {
      if (!languages.includes(template.language)) {
        throw new UnprocessableDataException(
          `This problem does not support ${template.language}`
        )
      }
    })

    const problem = await this.prisma.problem.create({
      data: {
        ...data,
        visibleLockTime: isVisible ? MIN_DATE : MAX_DATE,
        groupId,
        createdById: userId,
        languages,
        template: [JSON.stringify(template)],
        problemTag: {
          create: tagIds.map((tagId) => {
            return { tagId }
          })
        }
      }
    })
    await this.createTestcases(problem.id, testcases)
    return this.changeVisibleLockTimeToIsVisible(problem)
  }

  async createTestcases(problemId: number, testcases: Array<Testcase>) {
    await Promise.all(
      testcases.map(async (tc, index) => {
        const problemTestcase = await this.prisma.problemTestcase.create({
          data: {
            problemId,
            input: tc.input,
            output: tc.output,
            scoreWeight: tc.scoreWeight,
            isHidden: tc.isHidden
          }
        })
        return { index, id: problemTestcase.id }
      })
    )
  }

  async uploadProblems(
    input: UploadFileInput,
    userId: number,
    groupId: number
  ) {
    const { filename, mimetype, createReadStream } = await input.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    )
      throw new UnprocessableDataException(
        'Extensions except Excel(.xlsx, .xls) are not supported.'
      )
    const header = {}
    const problems: CreateProblemInput[] = []
    const workbook = new Workbook()
    const worksheet = (await workbook.xlsx.read(createReadStream()))
      .worksheets[0]
    worksheet.getRow(1).eachCell((cell, idx) => {
      if (!ImportedProblemHeader.includes(cell.text))
        throw new UnprocessableFileDataException(
          `Field ${cell.text} is not supported: ${1}`,
          filename
        )
      header[cell.text] = idx
    })
    worksheet.spliceRows(1, 1)
    const unsupportedFields = [
      header['InputFileName'],
      header['InputFilePath'],
      header['OutputFileName'],
      header['OutputFilePath']
    ]
    worksheet.eachRow(async function (row, rowNumber) {
      for (const colNumber of unsupportedFields) {
        if (row.getCell(colNumber).text !== '')
          throw new UnprocessableFileDataException(
            `Using inputFile, outputFile is not supported: ${rowNumber + 1}`,
            filename
          )
      }
      const title = row.getCell(header['문제제목']).text
      const description = row.getCell(header['문제내용']).text
      const languagesText = row.getCell(header['지원언어']).text.split(',')
      const levelText = row.getCell(header['난이도']).text
      const languages: Language[] = []
      const level: Level = Level['Level' + levelText]
      const template: Template[] = []
      for (let text of languagesText) {
        if (text === 'Python') {
          text = 'Python3'
        }
        if (!(text in Language)) continue
        const language = text as keyof typeof Language
        const code = row.getCell(header[`${language}SampleCode`]).text
        template.push({
          language,
          code: [
            {
              id: 1,
              text: code,
              locked: false
            }
          ]
        })
        languages.push(Language[language])
      }
      if (!languages.length) {
        throw new UnprocessableFileDataException(
          `A problem should support at least one language: ${rowNumber + 1}`,
          filename
        )
      }
      //TODO: specify timeLimit, memoryLimit(default: 2sec, 512mb)
      const testCnt = parseInt(row.getCell(header['TestCnt']).text)
      const inputText = row.getCell(header['Input']).text
      const outputs = row.getCell(header['Output']).text.split('::')
      const scoreWeights = row.getCell(header['Score']).text.split('::')
      if (testCnt === 0) return
      let inputs: string[] = []
      if (inputText === '' && testCnt !== 0) {
        for (let i = 0; i < testCnt; i++) inputs.push('')
      } else {
        inputs = inputText.split('::')
      }
      if (
        (inputs.length !== testCnt || outputs.length !== testCnt) &&
        inputText != ''
      ) {
        throw new UnprocessableFileDataException(
          `TestCnt must match the length of Input and Output. Or Testcases should not include ::. :${rowNumber + 1}`,
          filename
        )
      }
      const testcaseInput: Testcase[] = []
      for (let i = 0; i < testCnt; i++) {
        testcaseInput.push({
          input: inputs[i],
          output: outputs[i],
          scoreWeight: parseInt(scoreWeights[i]) || undefined,
          isHidden: false
        })
      }

      problems.push({
        title,
        description,
        inputDescription: '',
        isVisible: true,
        outputDescription: '',
        hint: '',
        template,
        languages,
        timeLimit: 2000,
        memoryLimit: 512,
        difficulty: level,
        source: '',
        testcases: testcaseInput,
        tagIds: []
      })
    })
    return await Promise.all(
      problems.map(async (data) => {
        const problem = await this.createProblem(data, userId, groupId)
        return problem
      })
    )
  }

  async uploadImage(input: UploadFileInput, userId: number) {
    const { mimetype, createReadStream } = await input.file
    const newFilename = randomUUID()

    if (!mimetype.includes('image/')) {
      throw new UnprocessableDataException('Only image files can be accepted')
    }

    const fileSize = await this.getFileSize(createReadStream())
    try {
      await this.storageService.uploadImage(
        newFilename,
        fileSize,
        createReadStream(),
        mimetype
      )
      await this.prisma.image.create({
        data: {
          filename: newFilename,
          createdById: userId
        }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        await this.storageService.deleteImage(newFilename) // 이미지가 S3에 업로드되었지만, DB에 이미지 정보 등록을 실패한 경우 rollback
      }
      throw new UnprocessableFileDataException(
        'Error occurred during image upload.',
        newFilename
      )
    }

    const baseUrlForImage =
      this.config.get('APP_ENV') == 'stage'
        ? 'https://stage.codedang.com/bucket'
        : this.config.get('STORAGE_BUCKET_ENDPOINT_URL')

    return {
      src:
        baseUrlForImage +
        '/' +
        this.config.get('MEDIA_BUCKET_NAME') +
        '/' +
        newFilename
    }
  }

  async deleteImage(filename: string, userId: number) {
    const image = this.prisma.image.delete({
      where: {
        filename,
        createdById: userId
      }
    })
    const s3ImageDeleteResult = this.storageService.deleteImage(filename)

    const [resolvedImage] = await Promise.all([image, s3ImageDeleteResult])
    return resolvedImage
  }

  async getFileSize(readStream: ReadStream): Promise<number> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      readStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)

        const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        if (totalSize > MAX_IMAGE_SIZE) {
          readStream.destroy()
          reject(
            new UnprocessableDataException('File size exceeds maximum limit')
          )
        }
      })

      readStream.on('end', () => {
        const fileSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        resolve(fileSize)
      })

      readStream.on('error', () => {
        reject(
          new UnprocessableDataException(
            'Error occurred during calculating image size.'
          )
        )
      })
    })
  }

  async getProblems(
    input: FilterProblemsInput,
    groupId: number,
    cursor: number | null,
    take: number
  ) {
    const paginator = this.prisma.getPaginator(cursor)

    const whereOptions: ProblemWhereInput = {}
    if (input.difficulty) {
      whereOptions.difficulty = {
        in: input.difficulty
      }
    }
    if (input.languages) {
      whereOptions.languages = { hasSome: input.languages }
    }

    const problems: Problem[] = await this.prisma.problem.findMany({
      ...paginator,
      where: {
        ...whereOptions,
        groupId
      },
      take
    })
    return this.changeVisibleLockTimeToIsVisible(problems)
  }

  async getProblem(id: number, groupId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id,
        groupId
      }
    })
    return this.changeVisibleLockTimeToIsVisible(problem)
  }

  async getProblemById(id: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id
      }
    })
    return this.changeVisibleLockTimeToIsVisible(problem)
  }

  async updateProblem(input: UpdateProblemInput, groupId: number) {
    const { id, languages, template, tags, testcases, isVisible, ...data } =
      input
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id,
        groupId
      }
    })

    if (languages && !languages.length) {
      throw new UnprocessableDataException(
        'A problem should support at least one language'
      )
    }
    if (
      isVisible != undefined &&
      new Date() < problem.visibleLockTime &&
      problem.visibleLockTime.getTime() !== MAX_DATE.getTime()
    ) {
      throw new UnprocessableDataException(
        'Unable to set the visible property until the contest is over'
      )
    }
    const supportedLangs = languages ?? problem.languages
    template?.forEach((template) => {
      if (!supportedLangs.includes(template.language)) {
        throw new UnprocessableDataException(
          `This problem does not support ${template.language}`
        )
      }
    })
    const submissions = await this.prisma.submission.findMany({
      where: {
        problemId: id
      }
    })
    if (submissions.length && testcases?.length) {
      throw new UnprocessableDataException(
        'Cannot update testcases if submission exists'
      )
    }

    const problemTag = tags ? await this.updateProblemTag(id, tags) : undefined

    if (testcases?.length) {
      await this.updateTestcases(id, testcases)
    }

    const updatedProblem = await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        ...(isVisible != undefined && {
          visibleLockTime: isVisible ? MIN_DATE : MAX_DATE
        }),
        ...(languages && { languages }),
        ...(template && { template: [JSON.stringify(template)] }),
        problemTag
      }
    })
    return this.changeVisibleLockTimeToIsVisible(updatedProblem)
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

    return await {
      create: await Promise.all(createIds),
      delete: await Promise.all(deleteIds)
    }
  }

  async updateTestcases(problemId: number, testcases: Array<Testcase>) {
    await Promise.all([
      this.prisma.problemTestcase.deleteMany({
        where: {
          problemId
        }
      })
    ])

    for (const tc of testcases) {
      await this.prisma.problemTestcase.create({
        data: {
          problemId,
          input: tc.input,
          output: tc.output,
          scoreWeight: tc.scoreWeight,
          isHidden: tc.isHidden
        }
      })
    }
  }

  async deleteProblem(id: number, groupId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id,
        groupId
      }
    })

    // Problem description에 이미지가 포함되어 있다면 삭제
    const uuidImageFileNames = this.extractUUIDs(problem.description)
    if (uuidImageFileNames) {
      await this.prisma.image.deleteMany({
        where: {
          filename: {
            in: uuidImageFileNames
          }
        }
      })

      const deleteFromS3Results = uuidImageFileNames.map((filename: string) => {
        return this.storageService.deleteImage(filename)
      })

      await Promise.all(deleteFromS3Results)
    }

    return await this.prisma.problem.delete({
      where: { id }
    })
  }

  extractUUIDs(input: string) {
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    const matches = input.match(uuidRegex)
    if (!matches) {
      return []
    }
    return matches
  }

  async getWorkbookProblems(
    groupId: number,
    workbookId: number
  ): Promise<Partial<WorkbookProblem>[]> {
    // id를 받은 workbook이 현재 접속된 group의 것인지 확인
    // 아니면 에러 throw
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: workbookId, groupId }
    })
    const workbookProblems = await this.prisma.workbookProblem.findMany({
      where: { workbookId }
    })

    return workbookProblems
  }

  async updateWorkbookProblemsOrder(
    groupId: number,
    workbookId: number,
    // orders는 항상 workbookId에 해당하는 workbookProblems들이 모두 딸려 온다.
    orders: number[]
  ): Promise<Partial<WorkbookProblem>[]> {
    // id를 받은 workbook이 현재 접속된 group의 것인지 확인
    await this.prisma.workbook.findFirstOrThrow({
      where: { id: workbookId, groupId }
    })
    // workbookId를 가지고 있는 workbookProblem을 모두 가져옴
    const workbookProblemsToBeUpdated =
      await this.prisma.workbookProblem.findMany({
        where: { workbookId }
      })
    // orders 길이와  찾은 workbookProblem 길이가 같은지 확인
    if (orders.length !== workbookProblemsToBeUpdated.length) {
      throw new UnprocessableDataException(
        'the len of orders and the len of workbookProblem are not equal.'
      )
    }
    //problemId 기준으로 오름차순 정렬
    workbookProblemsToBeUpdated.sort((a, b) => a.problemId - b.problemId)
    const queries = workbookProblemsToBeUpdated.map((record) => {
      const newOrder = orders.indexOf(record.problemId) + 1
      return this.prisma.workbookProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          workbookId_problemId: {
            workbookId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })
    return await this.prisma.$transaction(queries)
  }

  async getContestProblems(
    groupId: number,
    contestId: number
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId, groupId }
    })
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    return contestProblems
  }

  async updateContestProblemsOrder(
    groupId: number,
    contestId: number,
    orders: number[]
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId, groupId }
    })

    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })

    if (orders.length !== contestProblems.length) {
      throw new UnprocessableDataException(
        'the length of orders and the length of contestProblem are not equal.'
      )
    }

    const queries = contestProblems.map((record) => {
      const newOrder = orders.indexOf(record.problemId)
      return this.prisma.contestProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId,
            problemId: record.problemId
          }
        },
        data: { order: newOrder }
      })
    })

    return await this.prisma.$transaction(queries)
  }

  /**
   * 새로운 태그를 생성합니다
   * @param tagName - unique한 태그이름
   * @returns
   * @throws DuplicateFoundException - 이미 존재하는 태그일 경우
   */
  async createTag(tagName: string): Promise<Tag> {
    // throw error if tag already exists
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

      throw new InternalServerErrorException(error)
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

  async getProblemTestcases(problemId: number) {
    return await this.prisma.problemTestcase.findMany({
      where: {
        problemId
      }
    })
  }

  changeVisibleLockTimeToIsVisible(
    problems: Problem[] | Problem
  ): ProblemWithIsVisible[] | ProblemWithIsVisible {
    const problemsWithIsVisible = (
      Array.isArray(problems) ? problems : [problems]
    ).map((problem: Problem) => {
      const { visibleLockTime, ...data } = problem
      return {
        isVisible:
          visibleLockTime.getTime() === MIN_DATE.getTime()
            ? true
            : visibleLockTime < new Date() ||
                visibleLockTime.getTime() === MAX_DATE.getTime()
              ? false
              : null,
        ...data
      }
    })
    return problemsWithIsVisible.length == 1
      ? problemsWithIsVisible[0]
      : problemsWithIsVisible
  }
}
