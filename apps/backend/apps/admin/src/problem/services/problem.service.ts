import { ForbiddenException, Injectable, StreamableFile } from '@nestjs/common'
import type {} from '@generated'
import {
  Language,
  Level,
  Problem,
  ProblemWhereInput,
  UpdateHistory
} from '@generated'
import { ContestRole, ProblemField, Role } from '@prisma/client'
import { Workbook } from 'exceljs'
import { Response } from 'express'
import { Readable } from 'stream'
import { MAX_DATE, MIN_DATE } from '@libs/constants'
import {
  EntityNotExistException,
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import { StorageService } from '@libs/storage'
import { ImportedProblemHeader } from '../model/problem.constants'
import {
  CreateProblemInput,
  FilterProblemsInput,
  UpdateProblemInput,
  UploadFileInput
} from '../model/problem.input'
import type { ProblemWithIsVisible } from '../model/problem.output'
import type { Solution } from '../model/solution.input'
import type { Template } from '../model/template.input'
import type { Testcase } from '../model/testcase.input'
import { TagService } from './tag.service'
import { TestcaseService } from './testcase.service'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly testcaseService: TestcaseService,
    private readonly tagService: TagService
  ) {}

  async createProblem(
    input: CreateProblemInput,
    userId: number,
    userRole: Role
  ) {
    const {
      languages,
      template,
      solution,
      tagIds,
      testcases,
      isVisible,
      ...data
    } = input

    if (userRole == Role.User && isVisible == true) {
      throw new UnprocessableDataException(
        'User cannot set a problem to public'
      )
    }

    if (!languages.length) {
      throw new UnprocessableDataException(
        'A problem should support at least one language'
      )
    }

    // 문제가 탬플릿의 언어를 지원하는지 확인합니다.
    const seen = new Set<Language>()
    template.forEach((template: Template) => {
      const lang = template.language as Language
      if (!languages.includes(lang)) {
        throw new UnprocessableDataException(
          `This problem does not support ${lang}`
        )
      }
      if (seen.has(lang)) {
        throw new UnprocessableDataException(
          `Duplicate language ${lang} in template`
        )
      }
      seen.add(lang)
    })

    // 문제가 솔루션의 언어를 지원하는지 확인합니다.
    seen.clear()
    solution.forEach((solution: Solution) => {
      const lang = solution.language as Language
      if (!languages.includes(lang)) {
        throw new UnprocessableDataException(
          `This problem does not support ${lang}`
        )
      }
      if (seen.has(lang)) {
        throw new UnprocessableDataException(
          `Duplicate language ${lang} in solution`
        )
      }
      seen.add(lang)
    })

    const problem = await this.prisma.problem.create({
      data: {
        ...data,
        solution,
        visibleLockTime: isVisible ? MIN_DATE : MAX_DATE,
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
    // TODO: do not create testcases in createProblem
    await this.testcaseService.createTestcasesLegacy(problem.id, testcases)
    return this.changeVisibleLockTimeToIsVisible(problem)
  }

  async uploadProblems(input: UploadFileInput, userId: number, userRole: Role) {
    const { filename, mimetype, createReadStream } = await input.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    )
      throw new UnprocessableDataException(
        'Extensions except Excel(.xlsx, .xls) are not supported'
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
    worksheet.eachRow(function (row, rowNumber) {
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
      const solution: Solution[] = []
      const level: Level = Level['Level' + levelText]
      const template: Template[] = []
      for (let text of languagesText) {
        if (text === 'Python') {
          text = 'Python3'
        }
        if (!(text in Language)) continue
        const language = text as keyof typeof Language
        const sampleCode = row.getCell(header[`${language}SampleCode`]).text
        if (sampleCode !== '') {
          template.push({
            language,
            code: [
              {
                id: 1,
                text: sampleCode,
                locked: false
              }
            ]
          })
        }
        languages.push(Language[language])

        const solutionCode = row.getCell(header[`${language}AnswerCode`]).text
        if (solutionCode !== '') {
          solution.push({
            language,
            code: solutionCode
          })
        }
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
        isVisible: false,
        outputDescription: '',
        hint: '',
        template,
        solution,
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
        const problem = await this.createProblem(data, userId, userRole)
        return problem
      })
    )
  }

  /**
   * 특정 조건에 따라 문제 목록을 조회합니다.
   *
   * @param {number} userId - 조회를 요청한 사용자의 ID
   * @param {FilterProblemsInput} input - 난이도∙언어 필터 옵션 DTO
   * @param {(number | null)} cursor - 가져올 문제의 시작점
   * @param {number} take - 한 번에 조회할 문제 최대 개수
   * @param {'my'|'shared'|'contest'} mode - 조회 모드
   * @param {(number | null)} contestId - 특정 대회 문제만 조회할 contest ID (contest 모드에서 필요)
   * @returns {Promise<ProblemWithIsVisible[]>} - isVisible 필드가 추가된 문제 배열
   * @throws {ForbiddenException} 아래의 경우에 발생합니다
   *   - contestId로 필터링 시 해당 대회의 Admin/Manager가 아닌 경우
   *   - contestId가 contest 모드에서 제공되지 않은 경우
   *   - 잘못된 mode 사용 시
   */
  async getProblems({
    userId,
    input,
    cursor,
    take,
    mode,
    contestId
  }: {
    userId: number
    input: FilterProblemsInput
    cursor: number | null
    take: number
    mode: 'my' | 'shared' | 'contest'
    contestId?: number | null
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const whereOptions: ProblemWhereInput =
      await this.buildProblemWhereOptionsWithMode(userId, mode, contestId)

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
        ...whereOptions
      },
      take,
      include: {
        createdBy: true
      }
    })
    return this.changeVisibleLockTimeToIsVisible(problems)
  }

  private async buildProblemWhereOptionsWithMode(
    userId: number,
    mode: 'my' | 'shared' | 'contest',
    contestId?: number | null
  ): Promise<ProblemWhereInput> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    const isSuper = user?.role === Role.SuperAdmin

    // SuperAdmin의 경우 mode에 관계 없이 모든 문제 조회 가능
    if (isSuper) {
      return {}
    }

    switch (mode) {
      case 'my':
        return { createdById: { equals: userId } }

      case 'contest': {
        if (!contestId) {
          return { createdById: { equals: userId } }
        }
        const user = await this.prisma.userContest.findUnique({
          where: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            userId_contestId: { userId, contestId }
          },
          select: { role: true }
        })
        if (
          !user ||
          (user.role !== ContestRole.Admin && user.role !== ContestRole.Manager)
        ) {
          throw new ForbiddenException(
            'You must be Admin/Manager of this contest'
          )
        }
        const contestManagers = await this.prisma.userContest.findMany({
          where: {
            contestId,
            role: { in: [ContestRole.Admin, ContestRole.Manager] }
          },
          select: { userId: true }
        })
        const contestManagerIds = contestManagers
          .map((manager) => manager.userId)
          .filter((id): id is number => id !== null)
        return {
          createdById: {
            in: [userId, ...contestManagerIds]
          }
        }
      }

      case 'shared': {
        const leaderGroupIds = (
          await this.prisma.userGroup.findMany({
            where: {
              userId,
              isGroupLeader: true
            }
          })
        ).map((group) => group.groupId)
        return {
          sharedGroups: {
            some: {
              id: { in: leaderGroupIds }
            }
          }
        }
      }

      default:
        throw new ForbiddenException('Invalid mode')
    }
  }

  async getProblem(id: number, userRole: Role, userId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id
      },
      include: {
        sharedGroups: true
      }
    })
    if (userRole != Role.Admin && userRole != Role.SuperAdmin) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          }
        })
      ).map((group) => group.groupId)
      const sharedGroupIds = problem.sharedGroups.map((group) => group.id)
      const hasShared = sharedGroupIds.some((v) =>
        new Set(leaderGroupIds).has(v)
      )
      if (!hasShared && problem.createdById != userId) {
        throw new ForbiddenException(
          'User can only retrieve problems they created or were shared with'
        )
      }
    }
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

  async updateProblem(
    input: UpdateProblemInput,
    userRole: Role,
    userId: number
  ) {
    const {
      id,
      languages,
      template,
      solution,
      testcases,
      isVisible,
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      tags,
      ...data
    } = input

    // Admin 이상 권한이 있으면 항상 visible 설정 가능
    if (
      userRole !== Role.SuperAdmin &&
      userRole !== Role.Admin &&
      isVisible == true
    ) {
      // Contest의 Admin/Manager인 경우에만 visible 설정 가능
      const contestProblems = await this.prisma.contestProblem.findMany({
        where: { problemId: id },
        include: {
          contest: {
            include: {
              userContest: {
                where: {
                  userId,
                  role: {
                    in: [ContestRole.Admin, ContestRole.Manager]
                  }
                }
              }
            }
          }
        }
      })
      const hasPermission = contestProblems.some(
        (contestProblem) => contestProblem.contest.userContest.length > 0
      )
      if (!hasPermission) {
        throw new UnprocessableDataException(
          'Only SuperAdmin/Admin or Contest Admin/Manager can set a problem to public'
        )
      }
    }

    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id },
      include: {
        sharedGroups: {
          select: {
            id: true
          }
        }
      }
    })
    if (userRole == Role.User && problem.createdById != userId) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          }
        })
      ).map((group) => group.groupId)
      const sharedGroupIds = problem.sharedGroups.map((group) => group.id)
      const hasShared = sharedGroupIds.some((v) =>
        new Set(leaderGroupIds).has(v)
      )
      if (!hasShared) {
        throw new ForbiddenException(
          'User can only edit problems they created or were shared with'
        )
      }
    }

    const updatedByid = userId

    const updatedFields: ProblemField[] = []

    const fields = [
      'title',
      'languages',
      'description',
      'timeLimit',
      'memoryLimit',
      'hint'
    ]

    const updatedInfos = fields.map((field) => ({
      updatedField: field,
      current: problem[field],
      previous: problem[field]
    }))

    updatedInfos.forEach((info) => {
      if (
        input[info.updatedField] &&
        input[info.updatedField] !== info.previous
      ) {
        updatedFields.push(ProblemField[info.updatedField])
        info.current = input[info.updatedField]
      }
    })

    if (testcases?.length) {
      const existingTestcases = await this.prisma.problemTestcase.findMany({
        where: {
          problemId: id,
          isOutdated: false
        }
      })
      if (
        JSON.stringify(testcases) !==
        JSON.stringify(
          existingTestcases.map((tc) => ({
            id: tc.id,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden,
            scoreWeight: tc.scoreWeight,
            scoreWeightDenominator: tc.scoreWeightDenominator,
            scoreWeightNumerator: tc.scoreWeightNumerator
          }))
        )
      ) {
        updatedFields.push(ProblemField.testcase)
      }
    }
    if (userRole == Role.User && problem.createdById != userId) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          }
        })
      ).map((group) => group.groupId)
      const sharedGroupIds = problem.sharedGroups.map((group) => group.id)
      const hasShared = sharedGroupIds.some((v) =>
        new Set(leaderGroupIds).has(v)
      )
      if (!hasShared) {
        throw new ForbiddenException(
          'User can only edit problems they created or were shared with'
        )
      }
    }

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
        'Unable to set the visible property until the assignment/contest is over'
      )
    }
    const supportedLangs = languages ?? problem.languages
    // Check if the problem supports the language in the template
    const seen = new Set<Language>()
    template?.forEach((template: Template) => {
      const lang = template.language as Language
      if (!supportedLangs.includes(lang)) {
        throw new UnprocessableDataException(
          `This problem does not support ${lang}`
        )
      }
      if (seen.has(lang)) {
        throw new UnprocessableDataException(
          `Duplicate language ${lang} in template`
        )
      }
      seen.add(lang)
    })

    // Check if the problem supports the language in the solution
    seen.clear()
    solution?.forEach((solution: Solution) => {
      const lang = solution.language as Language
      if (!supportedLangs.includes(lang)) {
        throw new UnprocessableDataException(
          `This problem does not support ${lang}`
        )
      }
      if (seen.has(lang)) {
        throw new UnprocessableDataException(
          `Duplicate language ${lang} in solution`
        )
      }
      seen.add(lang)
    })

    // TODO: Problem Edit API 호출 방식 수정 후 롤백 예정
    // const submission = await this.prisma.submission.findFirst({
    //   where: {
    //     problemId: id
    //   }
    // })

    // if (submission && testcases) {
    //   throw new UnprocessableDataException(
    //     'Cannot update testcases if submission exists'
    //   )
    // }

    // TODO: fix problemTag duplication problem
    // const problemTag = tags
    //   ? await this.tagService.updateProblemTag(id, tags)
    //   : undefined

    if (testcases?.length) {
      await this.testcaseService.syncTestcases(
        id,
        problem.isSampleUploadedByZip,
        problem.isHiddenUploadedByZip,
        testcases
      )
    }

    const updatedInfo = updatedInfos
      .filter((info) => info.current !== info.previous)
      .map(({ updatedField, current, previous }) => ({
        updatedField,
        current,
        previous
      }))

    const updatedProblem = await this.prisma.problem.update({
      where: { id },
      data: {
        ...data,
        ...(isVisible != undefined && {
          visibleLockTime: isVisible ? MIN_DATE : MAX_DATE
        }),
        ...(languages && { languages }),
        ...(template && { template: [JSON.stringify(template)] }),
        ...(solution && { solution }),
        ...(updatedFields.length > 0 && {
          updateHistory: {
            create: [
              {
                updatedFields,
                updatedAt: new Date(),
                updatedBy: { connect: { id: updatedByid } },
                updatedInfo
              }
            ]
          }
        }),
        updateContentTime: new Date()
      },
      include: {
        updateHistory: true // 항상 updateHistory 포함
      }
    })

    return this.changeVisibleLockTimeToIsVisible(updatedProblem)
  }

  async getProblemUpdateHistory(problemId: number): Promise<UpdateHistory[]> {
    return await this.prisma.updateHistory.findMany({
      where: {
        problemId
      },
      include: {
        updatedBy: true
      }
    })
  }

  async deleteProblem(id: number, userRole: Role, userId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id }
    })

    if (userRole == Role.User && problem.createdById !== userId) {
      throw new ForbiddenException('User can only delete problems they created')
    }

    // Problem description에 이미지가 포함되어 있다면 삭제
    const uuidImageFileNames = this.extractUUIDs(problem.description)
    if (uuidImageFileNames) {
      await this.prisma.file.deleteMany({
        where: {
          filename: {
            in: uuidImageFileNames
          }
        }
      })

      const deleteFromS3Results = uuidImageFileNames.map((filename: string) => {
        return this.storageService.deleteFile(filename)
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

  async getSharedGroups(problemId: number) {
    return await this.prisma.problem
      .findUnique({
        where: {
          id: problemId
        }
      })
      .sharedGroups()
  }

  async downloadProblem({
    userId,
    problemId,
    res
  }: {
    userId: number
    problemId: number
    res: Response
  }) {
    const leaderGroupIds = (
      await this.prisma.userGroup.findMany({
        where: {
          userId,
          isGroupLeader: true
        }
      })
    ).map((group) => group.groupId)

    const problem = await this.prisma.problem.findUnique({
      where: {
        id: problemId,
        OR: [
          { createdById: { equals: userId } },
          {
            sharedGroups: {
              some: {
                id: { in: leaderGroupIds }
              }
            }
          }
        ]
      }
    })

    if (!problem) {
      res
        .status(404)
        .json({ error: 'there is no problem that matches the conditions' })
      throw new EntityNotExistException(
        'there is no problem that matches the conditions'
      )
    }

    const testcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId
      }
    })

    const filename = `codedang-${problem.title}.json`

    const dataString = JSON.stringify(
      {
        problem,
        testcases
      },
      null,
      2
    )

    const stream = Readable.from(dataString)

    res.set({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`
    })
    return new StreamableFile(stream)
  }

  changeVisibleLockTimeToIsVisible(
    problems: Problem | Problem[]
  ): ProblemWithIsVisible | ProblemWithIsVisible[] {
    if (Array.isArray(problems)) {
      return problems.map((problem) => {
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
    } else {
      const { visibleLockTime, ...data } = problems
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
    }
  }
}
