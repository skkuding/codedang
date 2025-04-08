import { ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Language } from '@generated'
import {
  AssignmentProblem,
  ContestProblem,
  Problem,
  Tag,
  WorkbookProblem
} from '@generated'
import { Level } from '@generated'
import type { ProblemWhereInput, UpdateHistory } from '@generated'
import { ProblemField, Role } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'
import { isEqual } from 'es-toolkit'
import { Workbook } from 'exceljs'
import type { FileUpload } from 'graphql-upload/GraphQLUpload.mjs'
import type { Readable } from 'stream'
import { Parse } from 'unzipper'
import {
  MAX_DATE,
  MAX_IMAGE_SIZE,
  MAX_ZIP_SIZE,
  MIN_DATE
} from '@libs/constants'
import {
  DuplicateFoundException,
  EntityNotExistException,
  UnprocessableDataException,
  UnprocessableFileDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import type { ProblemScoreInput } from '@admin/contest/model/problem-score.input'
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
import { ImportedTestcaseHeader } from './model/testcase.constants'
import type { Testcase } from './model/testcase.input'

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly config: ConfigService
  ) {}

  async createProblem(
    input: CreateProblemInput,
    userId: number,
    userRole: Role
  ) {
    const { languages, template, tagIds, testcases, isVisible, ...data } = input

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

    // Check if the problem supports the language in the template
    template.forEach((template: Template) => {
      if (!languages.includes(template.language as Language)) {
        throw new UnprocessableDataException(
          `This problem does not support ${template.language as Language}`
        )
      }
    })

    const problem = await this.prisma.problem.create({
      data: {
        ...data,
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
    await this.createTestcases(problem.id, testcases)
    return this.changeVisibleLockTimeToIsVisible(problem)
  }

  async removeAllTestcaseFiles(problemId: number) {
    const testcaseDir = problemId + '/'
    const files = await this.storageService.listObjects(testcaseDir, 'testcase')
    await Promise.all(
      files.map(async (file) => {
        if (!file.Key) return
        await this.storageService.deleteObject(file.Key, 'testcase')
      })
    )
    await this.prisma.problemTestcase.deleteMany({
      where: { problemId }
    })
  }

  async uploadTestcaseZip(file: FileUpload, problemId: number) {
    const { filename, mimetype, createReadStream } = file

    if (!filename.endsWith('.zip') || mimetype !== 'application/zip') {
      throw new UnprocessableDataException('Only zip files are accepted')
    }

    // Just check if the file size is less than maximum size
    await this.getFileSize(createReadStream(), MAX_ZIP_SIZE)

    // Testcase files are uploaded under s3://{bucketName}/{problemId}/{testcaseId}.{in|out}
    // Before upload, delete all objects under the problemId directory
    await this.removeAllTestcaseFiles(problemId)

    // Under zip, it's expected to have the following structure:
    //
    // {name}.zip/
    //   {chunkName1}.in
    //   {chunkName1}.out
    //   {chunkName2}.in
    //   {chunkName2}.out
    //   ...
    //
    // Then each {chunkName} is registered to the database with {testcaseId} as primary key
    // and the object is uploaded to S3 with the name {problemId}/{testcaseId}.{in|out}
    //
    // s3://{bucketName}/{problemId}/
    //  {testcaseId1}.{in}
    //  {testcaseId1}.{out}
    //  {testcaseId2}.{in}
    //  {testcaseId2}.{out}
    //  ...

    /** Mapper between chunk name and testcase ID. { [chunkName]: testcaseId } */
    const testcaseIdMapper: Record<string, number> = {}

    const inFiles = new Set<string>()
    const outFiles = new Set<string>()

    const stream = createReadStream().pipe(Parse({ forceStream: true }))

    try {
      for await (const chunk of stream) {
        // e.g) chunk.path: 'name.in' => chunkName: 'name', extension: 'in'
        const chunkName = chunk.path.split('.').slice(0, -1).join('.')
        const extension = chunk.path.split('.').pop()

        if (extension !== 'in' && extension !== 'out') {
          throw new UnprocessableDataException(
            'Testcase files must end with .in or .out'
          )
        }
        if (!(chunkName in testcaseIdMapper)) {
          const testcase = await this.prisma.problemTestcase.create({
            data: { problemId }
          })
          testcaseIdMapper[chunkName] = testcase.id
        }

        if (extension === 'in') {
          inFiles.add(chunkName)
        } else if (extension === 'out') {
          outFiles.add(chunkName)
        }

        const objectName = `${problemId}/${testcaseIdMapper[chunkName]}.${extension}`
        const defaultTags = { hidden: 'true' } // s3 object tags are read from iris

        await this.storageService.uploadObject(
          objectName,
          chunk,
          'txt',
          defaultTags
        )
      }

      // Check if all .in/.out files have corresponding .out/.in files
      if (!isEqual(inFiles, outFiles)) {
        throw new UnprocessableDataException(
          'Testcase files must have corresponding .in/.out files'
        )
      }
    } catch (error) {
      await this.removeAllTestcaseFiles(problemId)
      throw error
    }

    // Set the testcase order by alphabetical order of original file name
    // e.g) [aaa.(in|out), aab.(in|out), aac.(in|out), ...]
    const originalFileNames = Object.keys(testcaseIdMapper).sort()

    originalFileNames.forEach(async (name, index) => {
      const id = testcaseIdMapper[name]
      await this.prisma.problemTestcase.update({
        where: { id },
        data: { order: index + 1 }
      })
    })

    const testcaseIds = originalFileNames.map((name) => ({
      testcaseId: testcaseIdMapper[name]
    }))
    return testcaseIds
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

  async createTestcase(problemId: number, testcase: Testcase) {
    try {
      const problemTestcase = await this.prisma.problemTestcase.create({
        data: {
          problem: { connect: { id: problemId } },
          input: testcase.input,
          output: testcase.output,
          scoreWeight: testcase.scoreWeight,
          isHidden: testcase.isHidden
        }
      })
      return problemTestcase
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new EntityNotExistException('problem')

      throw error
    }
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
        isVisible: false,
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
        const problem = await this.createProblem(data, userId, userRole)
        return problem
      })
    )
  }

  async uploadTestcase(
    fileInput: UploadFileInput,
    problemId: number,
    userRole: Role,
    userId: number
  ) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: { id: problemId },
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

    const { filename, mimetype, createReadStream } = await fileInput.file
    if (
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ].includes(mimetype) === false
    ) {
      throw new UnprocessableDataException(
        'Extensions except Excel(.xlsx, .xls) are not supported.'
      )
    }
    const header = {}
    const workbook = new Workbook()
    const worksheet = (await workbook.xlsx.read(createReadStream()))
      .worksheets[0]
    worksheet.getRow(1).eachCell((cell, idx) => {
      if (!ImportedTestcaseHeader.includes(cell.text))
        throw new UnprocessableFileDataException(
          `Field ${cell.text} is not supported: ${1}`,
          filename
        )
      header[cell.text] = idx
    })
    worksheet.spliceRows(1, 1)
    const row = worksheet.getRow(1)

    if (!header['Input'] || !header['Output']) {
      throw new UnprocessableFileDataException(
        'Input and Output fields are required',
        filename
      )
    }
    const input = row.getCell(header['Input']).text
    const output = row.getCell(header['Output']).text
    const scoreWeight =
      header['scoreWeight'] === undefined ||
      row.getCell(header['scoreWeight']).text.trim() === ''
        ? 1
        : parseInt(row.getCell(header['scoreWeight']).text.trim(), 10) || 1
    const isHidden =
      header['isHidden'] === undefined ||
      row.getCell(header['isHidden']).text.trim() === ''
        ? false
        : row.getCell(header['isHidden']).text.trim() === 'O'
    const testcase: Testcase = {
      input,
      output,
      scoreWeight,
      isHidden
    }

    return await this.createTestcase(problemId, testcase)
  }

  async uploadFile(input: UploadFileInput, userId: number, isImage: boolean) {
    const { mimetype, createReadStream } = await input.file
    const newFilename = randomUUID()

    if (isImage && !mimetype.includes('image/')) {
      throw new UnprocessableDataException('Only image files can be accepted')
    }

    if (!isImage && mimetype !== 'application/pdf') {
      throw new UnprocessableDataException('Only pdf files can be accepted')
    }

    const fileSize = await this.getFileSize(createReadStream(), isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE)
    try {
      await this.storageService.uploadFile({
        filename: newFilename,
        fileSize,
        content: createReadStream(),
        type: mimetype
      })
      await this.prisma.file.create({
        data: {
          filename: newFilename,
          createdById: userId
        }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        await this.storageService.deleteFile(newFilename) // 파일이 S3에 업로드되었지만, DB에 파일 정보 등록을 실패한 경우 rollback
      }
      throw new UnprocessableFileDataException(
        'Error occurred during file upload.',
        newFilename
      )
    }

    const APP_ENV = this.config.get('APP_ENV')
    const MEDIA_BUCKET_NAME = this.config.get('MEDIA_BUCKET_NAME')
    const STORAGE_BUCKET_ENDPOINT_URL = this.config.get(
      'STORAGE_BUCKET_ENDPOINT_URL'
    )

    return {
      src:
        APP_ENV === 'production'
          ? `https://${MEDIA_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${newFilename}`
          : APP_ENV === 'stage'
            ? `https://stage.codedang.com/bucket/${MEDIA_BUCKET_NAME}/${newFilename}`
            : `${STORAGE_BUCKET_ENDPOINT_URL}/${MEDIA_BUCKET_NAME}/${newFilename}`
    }
  }

  async deleteFile(filename: string, userId: number) {
    const file = this.prisma.file.delete({
      where: {
        filename,
        createdById: userId
      }
    })
    const s3FileDeleteResult = this.storageService.deleteFile(filename)

    const [resolvedFile] = await Promise.all([file, s3FileDeleteResult])
    return resolvedFile
  }

  async getFileSize(readStream: Readable, maxSize: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      readStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)

        const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        if (totalSize > maxSize) {
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
            'Error occurred during calculating file size.'
          )
        )
      })
    })
  }

  async getProblems({
    userId,
    input,
    cursor,
    take,
    my,
    shared
  }: {
    userId: number
    input: FilterProblemsInput
    cursor: number | null
    take: number
    my: boolean
    shared: boolean
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const whereOptions: ProblemWhereInput = {}

    if (my) {
      whereOptions.createdById = {
        equals: userId
      }
    }
    if (shared) {
      const leaderGroupIds = (
        await this.prisma.userGroup.findMany({
          where: {
            userId,
            isGroupLeader: true
          }
        })
      ).map((group) => group.groupId)
      whereOptions.sharedGroups = {
        some: {
          id: { in: leaderGroupIds }
        }
      }
    }

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

  async getProblem(id: number, userRole: Role, userId: number) {
    const problem = await this.prisma.problem.findFirstOrThrow({
      where: {
        id
      },
      include: {
        sharedGroups: true
      }
    })
    if (userRole != Role.Admin) {
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
    const { id, languages, template, tags, testcases, isVisible, ...data } =
      input

    if (userRole == Role.User && isVisible == true) {
      throw new UnprocessableDataException(
        'User cannot set a problem to public'
      )
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
        where: { problemId: id }
      })
      if (
        JSON.stringify(testcases) !==
        JSON.stringify(
          existingTestcases.map((tc) => ({
            input: tc.input,
            output: tc.output,
            scoreWeight: tc.scoreWeight,
            isHidden: tc.isHidden
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
    template?.forEach((template) => {
      if (!supportedLangs.includes(template.language as Language)) {
        throw new UnprocessableDataException(
          `This problem does not support ${template.language as Language}`
        )
      }
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

    const problemTag = tags ? await this.updateProblemTag(id, tags) : undefined

    if (testcases?.length) {
      await this.updateTestcases(id, testcases)
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
        problemTag,
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
        })
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

    return {
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
    contestId: number
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId }
    })
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId }
    })
    return contestProblems
  }

  async updateContestProblemsScore(
    contestId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId }
    })

    const queries = problemIdsWithScore.map((record) => {
      return this.prisma.contestProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_problemId: {
            contestId,
            problemId: record.problemId
          }
        },
        data: { score: record.score }
      })
    })

    return await this.prisma.$transaction(queries)
  }

  async updateContestProblemsOrder(
    contestId: number,
    orders: number[]
  ): Promise<Partial<ContestProblem>[]> {
    await this.prisma.contest.findFirstOrThrow({
      where: { id: contestId }
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
      if (newOrder === -1) {
        throw new UnprocessableDataException(
          'There is a problemId in the contest that is missing from the provided orders.'
        )
      }
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

  async getAssignmentProblems(
    groupId: number,
    assignmentId: number
  ): Promise<Partial<AssignmentProblem>[]> {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })
    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: { assignmentId }
    })
    return assignmentProblems
  }

  async updateAssignmentProblemsScore(
    groupId: number,
    assignmentId: number,
    problemIdsWithScore: ProblemScoreInput[]
  ): Promise<Partial<AssignmentProblem>[]> {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })

    const queries = problemIdsWithScore.map((record) => {
      return this.prisma.assignmentProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_problemId: {
            assignmentId,
            problemId: record.problemId
          }
        },
        data: { score: record.score }
      })
    })

    return await this.prisma.$transaction(queries)
  }

  async updateAssignmentProblemsOrder(
    groupId: number,
    assignmentId: number,
    orders: number[]
  ): Promise<Partial<AssignmentProblem>[]> {
    await this.prisma.assignment.findFirstOrThrow({
      where: { id: assignmentId, groupId }
    })

    const assignmentProblems = await this.prisma.assignmentProblem.findMany({
      where: { assignmentId }
    })

    if (orders.length !== assignmentProblems.length) {
      throw new UnprocessableDataException(
        'the length of orders and the length of assignmentProblem are not equal.'
      )
    }

    const queries = assignmentProblems.map((record) => {
      const newOrder = orders.indexOf(record.problemId)
      if (newOrder === -1) {
        throw new UnprocessableDataException(
          'There is a problemId in the assignment that is missing from the provided orders.'
        )
      }

      return this.prisma.assignmentProblem.update({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_problemId: {
            assignmentId,
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
    // 존재하는 태그일 경우 에러를 throw합니다
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

      throw error
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

  async getSharedGroups(problemId: number) {
    return await this.prisma.problem
      .findUnique({
        where: {
          id: problemId
        }
      })
      .sharedGroups()
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
