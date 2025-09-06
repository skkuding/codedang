import { HttpService } from '@nestjs/axios'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Language,
  Prisma,
  Problem,
  ResultStatus,
  Role,
  Submission,
  TestSubmission
} from '@prisma/client'
import { AxiosRequestConfig } from 'axios'
import { Cache } from 'cache-manager'
import { plainToInstance } from 'class-transformer'
import { Request } from 'express'
import { Span } from 'nestjs-otel'
import {
  testKey,
  testcasesKey,
  userTestKey,
  userTestcasesKey
} from '@libs/cache'
import { MIN_DATE, TEST_SUBMISSION_EXPIRE_TIME } from '@libs/constants'
import {
  ConflictFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException
} from '@libs/exception'
import { PrismaService } from '@libs/prisma'
import {
  CreateSubmissionDto,
  CreateUserTestSubmissionDto,
  Snippet,
  Template
} from './class/create-submission.dto'
import { SubmissionPublicationService } from './submission-pub.service'

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name)
  private req: Request | undefined

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly publish: SubmissionPublicationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  // setRequest(req: Request) {
  //   this.req = req
  // }

  /**
   * 아직 채점되지 않은 제출 기록을 만들고, 채점 요청 큐에 메세지를 발행합니다.
   *
   * 주어진 입력을 기반으로 문제의 유효성을 검사하고, 제출 후 결과를 반환
   * 만약 문제가 존재하지 않거나 제출하는 사용자가 문제에 접근 권한이 없는 경우 예외를 발생
   *
   * @param {CreateSubmissionDto} submissionDto - 코드 제출 DTO
   * @param {string} userIp - 사용자의 IP 주소
   * @param {number} userId - 제출하는 사용자의 ID
   * @param {number} problemId - 제출할 문제의 ID
   * @returns {Promise<Submission>} 생성된 제출물 객체
   * @throws {EntityNotExistException} 주어진 조건에 맞는 문제가 없는 경우
   */
  @Span()
  async submitToProblem({
    submissionDto,
    userIp,
    userId,
    problemId
  }: {
    submissionDto: CreateSubmissionDto
    userIp: string
    userId: number
    problemId: number
  }) {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        visibleLockTime: {
          equals: MIN_DATE
        }
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }
    const submission = await this.createSubmission({
      submissionDto,
      problem,
      userId,
      userIp
    })

    if (submission) {
      this.logger.log(
        `Submission ${submission.id} is created for problem ${problem.id} by ip ${userIp}`
      )
      return submission
    }
  }

  /**
   * 진행중인 대회 문제에 대해 아직 채점되지 않은 제출 기록을 만들고, 채점 요청 큐에 메세지를 발행합니다.
   *
   * 1. 주어진 contestId와 groupId에 해당하는 진행 중인 대회가 있는지 확인
   * 2. 사용자가 해당 대회에 등록되어 있는지 확인
   * 3. 대회가 진행 중인지 및 그룹 조건을 만족하는지 확인
   * 4. 제출하고자 하는 문제가 해당 대회에 속해 있는지 확인
   * 5. 유효성이 검증된 경우 제출물을 생성하고 반환
   *
   * @param {CreateSubmissionDto} submissionDto - 코드 제출 DTO
   * @param {string} userIp - 사용자의 IP 주소
   * @param {number} userId - 제출을 수행하는 사용자의 ID
   * @param {number} problemId - 제출할 문제의 ID
   * @param {number} contestId - 문제가 속한 대회의 ID
   * @returns {Promise<Submission>} 생성된 제출 객체
   * @throws {EntityNotExistException} 아래의 경우에 발생합니다
   *   - 유효한 진행 중인 대회가 없을 경우 (Contest)
   *   - 사용자가 대회에 등록되어 있지 않은 경우 (ContestRecord)
   *   - 문제를 찾을 수 없거나 대회와 매칭되지 않는 경우 (ContestProblem)
   * @throws {ConflictFoundException} 아래의 경우에 발생합니다
   *   - 대회가 진행중이지 않을 경우
   */
  @Span()
  async submitToContest({
    submissionDto,
    userIp,
    userId,
    problemId,
    contestId
  }: {
    submissionDto: CreateSubmissionDto
    userIp: string
    userId: number
    problemId: number
    contestId: number
  }) {
    const now = new Date()

    // 진행 중인 대회인지 확인합니다.
    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId,
        startTime: {
          lte: now
        },
        endTime: {
          gt: now
        }
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }

    // 대회에 등록되어 있는지 확인합니다.
    const contestRecord = await this.prisma.contestRecord.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_userId: {
          contestId,
          userId
        }
      },
      select: {
        contest: {
          select: {
            startTime: true,
            endTime: true
          }
        }
      }
    })
    if (!contestRecord) {
      throw new EntityNotExistException('ContestRecord')
    }
    if (
      contestRecord.contest.startTime > now ||
      contestRecord.contest.endTime <= now
    ) {
      throw new ConflictFoundException(
        'Submission is only allowed to ongoing contests'
      )
    }

    const contestProblem = await this.prisma.contestProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        contestId_problemId: {
          problemId,
          contestId
        }
      },
      include: {
        problem: true
      }
    })
    if (!contestProblem) {
      throw new EntityNotExistException('ContestProblem')
    }
    const { problem } = contestProblem

    const submission = await this.createSubmission({
      submissionDto,
      problem,
      userId,
      userIp,
      idOptions: {
        contestId
      },
      stopOnNotAccepted: true,
      judgeOnlyHiddenTestcases: !contest.evaluateWithSampleTestcase
    })

    return submission
  }

  /**
   * 진행중인 과제 문제에 대해 아직 채점되지 않은 제출 기록을 만들고, 채점 요청 큐에 메세지를 발행합니다.
   *
   * 1. 주어진 assignmentId와 groupId에 해당하는 진행 중인 과제가 있는지 확인
   * 2. 사용자가 해당 과제에 등록되어 있는지 확인
   * 3. 과제가 진행 중인지 및 그룹 조건을 만족하는지 확인
   * 4. 제출하고자 하는 문제가 해당 과제에 속해 있는지 확인
   * 5. 유효성이 검증된 경우 제출물을 생성하고 반환
   *
   * @param {CreateSubmissionDto} submissionDto - 코드 제출 DTO
   * @param {string} userIp - 사용자의 IP 주소
   * @param {number} userId - 제출을 수행하는 사용자의 ID
   * @param {number} problemId - 제출할 문제의 ID
   * @param {number} assignmentId - 문제가 속한 과제의 ID
   * @param {number} groupId - 사용자 및 과제가 속한 그룹 ID
   * @returns {Promise<Submission>} 생성된 제출 객체
   * @throws {EntityNotExistException} 아래의 경우에 발생합니다
   *   - 유효한 진행 중인 과제가 없을 경우 (Assignment)
   *   - 사용자가 과제에 등록되어 있지 않은 경우 (AssignmentRecord)
   *   - 문제를 찾을 수 없거나 과제와 매칭되지 않는 경우 (AssignmentProblem)
   * @throws {ConflictFoundException} 아래의 경우에 발생합니다
   *   - 과제가 진행중이지 않을 경우
   */
  @Span()
  async submitToAssignment({
    submissionDto,
    userIp,
    userId,
    problemId,
    assignmentId
  }: {
    submissionDto: CreateSubmissionDto
    userIp: string
    userId: number
    problemId: number
    assignmentId: number
  }) {
    const now = new Date()

    // 진행 중인 과제인지 확인합니다.
    const assignment = await this.prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        startTime: {
          lte: now
        },
        OR: [
          {
            dueTime: { gt: now }
          },
          {
            AND: [{ dueTime: null }, { endTime: { gt: now } }]
          }
        ]
      }
    })
    if (!assignment) {
      throw new EntityNotExistException('Assignment')
    }

    // 과제에 등록되어 있는지 확인합니다.
    const assignmentRecord = await this.prisma.assignmentRecord.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_userId: {
          assignmentId,
          userId
        }
      },
      select: {
        assignment: {
          select: {
            startTime: true,
            dueTime: true,
            endTime: true
          }
        }
      }
    })
    if (!assignmentRecord) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }
    if (
      assignmentRecord.assignment.startTime > now ||
      (assignmentRecord.assignment.dueTime ??
        assignmentRecord.assignment.endTime) <= now
    ) {
      throw new ConflictFoundException(
        'Submission is only allowed to ongoing assignments'
      )
    }

    const assignmentProblem = await this.prisma.assignmentProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_problemId: {
          problemId,
          assignmentId
        }
      },
      include: {
        problem: true
      }
    })
    if (!assignmentProblem) {
      throw new EntityNotExistException('AssignmentProblem')
    }
    const { problem } = assignmentProblem

    await this.prisma.assignmentProblemRecord.upsert({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        assignmentId_userId_problemId: {
          assignmentId,
          userId,
          problemId: problem.id
        }
      },
      create: {
        assignmentId,
        userId,
        problemId: problem.id,
        isSubmitted: true
      },
      update: {
        isSubmitted: true
      }
    })

    const submission = await this.createSubmission({
      submissionDto,
      problem,
      userId,
      userIp,
      idOptions: {
        assignmentId
      }
    })

    return submission
  }

  /**
   * 워크북 문제에 대해 아직 채점되지 않은 제출 기록을 만들고, 채점 요청 큐에 메세지를 발행합니다.
   *
   * 1. 주어진 workbookId와 problemId에 매칭되는 WorkbookProblem을 찾음
   * 2. 해당 문제가 주어진 groupId에 속하고, visibleLockTime 조건을 만족하는지 확인
   * 3. 조건을 만족하지 않으면 예외를 발생
   * 4. 유효성이 검증된 경우 createSubmission 메서드를 호출하여 제출 기록을 생성하고 반환
   *
   * @param {CreateSubmissionDto} submissionDto - 제출물 생성을 위한 데이터 전송 객체
   * @param {string} userIp - 사용자의 IP 주소
   * @param {number} userId - 제출을 수행하는 사용자의 ID
   * @param {number} problemId - 제출할 문제의 ID
   * @param {number} workbookId - 제출이 속한 워크북의 ID
   * @param {number} groupId - 문제 그룹 ID
   * @returns {Promise<Submission>} 생성된 제출물 객체
   * @throws {EntityNotExistException}
   *   - 해당 workbookId와 problemId에 매칭되는 WorkbookProblem을 찾을 수 없는 경우
   *   - 문제의 groupId가 일치하지 않거나 visibleLockTime 조건을 만족하지 않는 경우
   */
  @Span()
  async submitToWorkbook({
    submissionDto,
    userIp,
    userId,
    problemId,
    workbookId
  }: {
    submissionDto: CreateSubmissionDto
    userIp: string
    userId: number
    problemId: number
    workbookId: number
  }) {
    const workbookProblem = await this.prisma.workbookProblem.findUnique({
      where: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        workbookId_problemId: {
          problemId,
          workbookId
        }
      },
      include: {
        problem: true
      }
    })
    if (!workbookProblem) {
      throw new EntityNotExistException('WorkbookProblem')
    }
    const { problem } = workbookProblem
    if (problem.visibleLockTime.getTime() !== MIN_DATE.getTime()) {
      throw new EntityNotExistException('Problem')
    }

    const submission = await this.createSubmission({
      submissionDto,
      problem,
      userId,
      userIp,
      idOptions: {
        workbookId
      }
    })

    return submission
  }

  /**
   * 주어진 문제와 사용자 정보를 바탕으로 아직 채점되지 않은 제출 기록을 만들고, 채점 요청 큐에 메세지를 발행합니다.
   *
   * 1. 문제에서 지원하는 프로그래밍 언어인지 확인
   * 2. 사용자가 문제의 템플릿을 수정했는지 검증
   * 3. 제출 데이터를 구성하여 데이터베이스에 저장
   * 4. 제출 결과를 초기화하고 채점 요청 메시지를 발행하는 메서드를 호출
   *
   * @param {CreateSubmissionDto} submissionDto - 코드 제출 DTO
   * @param {Problem} problem - 제출 대상 문제 레코드
   * @param {number} userId - 사용자의 ID
   * @param {string} userIp - 사용자의 IP 주소
   * @param {{ contestId?: number; assignmentId?: number; workbookId?: number }} [idOptions] 제출 종류에 따라 전달하는 옵셔널 파라미터
   *   - contestId: 대회 제출인 경우 제공해야 함
   *   - assignmentId: 과제 제출인 경우 제공해야 함
   *   - workbookId: 워크북 제출인 경우 제공해야 함
   * @returns {Promise<Submission>} 생성된 제출 기록
   * @throws {ConflictFoundException} 아래와 같은 경우에 발생합니다
   *   - 문제에서 해당 언어를 지원하지 않을 경우
   *   - 제출한 코드가 템플릿이 변경 된 코드인 경우
   * @throws {UnprocessableDataException} 아래와 같은 경우에 발생합니다
   *   - 제출물을 생성하는 도중 데이터 처리에 실패한 경우
   */
  @Span()
  async createSubmission({
    submissionDto,
    problem,
    userId,
    userIp,
    idOptions,
    stopOnNotAccepted = false,
    judgeOnlyHiddenTestcases = false
  }: {
    submissionDto: CreateSubmissionDto
    problem: Problem
    userId: number
    userIp: string
    idOptions?: {
      contestId?: number
      assignmentId?: number
      workbookId?: number
    }
    stopOnNotAccepted?: boolean
    judgeOnlyHiddenTestcases?: boolean
  }) {
    if (!problem.languages.includes(submissionDto.language)) {
      throw new ConflictFoundException(
        `This problem does not support language ${submissionDto.language}`
      )
    }
    const { code, ...data } = submissionDto
    if (
      !this.isValidCode(
        code,
        submissionDto.language,
        plainToInstance(Template, problem.template)
      )
    ) {
      throw new ConflictFoundException('Modifying template is not allowed')
    }

    const submissionData = {
      code: code.map((snippet) => ({ ...snippet })), // convert to plain object
      result: ResultStatus.Judging,
      userId,
      userIp,
      problemId: problem.id,
      codeSize: new TextEncoder().encode(code[0].text).length,
      ...data
    }

    try {
      const submission = await this.prisma.submission.create({
        data: {
          ...submissionData,
          contestId: idOptions?.contestId,
          assignmentId: idOptions?.assignmentId,
          workbookId: idOptions?.workbookId
        }
      })

      await this.createSubmissionResults(submission, judgeOnlyHiddenTestcases)

      await this.publish.publishJudgeRequestMessage({
        code,
        submission,
        stopOnNotAccepted,
        judgeOnlyHiddenTestcases
      })
      return submission
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new UnprocessableDataException('Failed to create submission')
      }
      throw error
    }
  }

  /**
   * 전달한 제출 기록에 대해 아직 채점되지 않은 테스트케이스 채점 결과들을 생성합니다.
   *
   * 제출된 문제에 연결된 모든 테스트 케이스를 조회한 후,
   * 각 테스트 케이스에 대해 제출 결과 레코드를 생성하고 초기 상태(ResultStatus.Judging)로 설정
   *
   * @param {Submission} submission - 테스트 케이스 결과를 생성할 제출 기록
   * @returns {Promise<void>}
   */
  @Span()
  async createSubmissionResults(
    submission: Submission,
    judgeOnlyHiddenTestcases: boolean
  ): Promise<void> {
    let testcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId: submission.problemId
      },
      select: { id: true, isHidden: true }
    })

    if (judgeOnlyHiddenTestcases) {
      testcases = testcases.filter((testcase) => testcase.isHidden)
    }

    await this.prisma.submissionResult.createMany({
      data: testcases.map((testcase) => {
        return {
          submissionId: submission.id,
          result: ResultStatus.Judging,
          problemTestcaseId: testcase.id
        }
      })
    })
  }

  /**
   * 주어진 코드 스니펫 배열이 해당 프로그래밍 언어에 대한 문제 템플릿과 일치하는지 검사합니다.
   *
   * 1. 해당 언어에 대한 템플릿을 찾습니다. 템플릿이 없거나 비어있으면 유효하다고 간주하여 true를 반환
   * 2. 템플릿과 제출된 코드의 스니펫 수가 다른 경우 false를 반환
   * 3. 템플릿과 코드를 지정된 순서대로 정렬
   * 4. 각 스니펫을 순차적으로 비교
   *    - 템플릿과 코드의 스니펫 ID가 일치하지 않으면 false를 반환
   *    - 템플릿 스니펫이 잠긴 상태(locked)인데 코드의 내용(text)이 템플릿과 다르면 false를 반환
   * 5. 모든 검사 통과 시 true를 반환
   *
   * @param {Snippet[]} code - 제출된 코드 스니펫 배열
   * @param {Language} language - 제출된 코드의 프로그래밍 언어
   * @param {Template[]} templates - 문제에 대한 템플릿 배열
   * @returns {boolean} 제출된 코드가 템플릿을 준수하면 true, 그렇지 않으면 false
   */
  isValidCode(
    code: Snippet[],
    language: Language,
    templates: Template[]
  ): boolean {
    const template = templates.find((code) => code.language === language)?.code
    if (!template || template.length === 0) return true

    if (template.length !== code.length) return false
    template.sort(this.snippetOrderCompare)
    code.sort(this.snippetOrderCompare)

    for (let i = 0; i < template.length; i++) {
      if (template[i].id !== code[i].id) return false
      else if (template[i].locked && template[i].text !== code[i].text)
        return false
    }
    return true
  }

  /**
   * 코드 스니펫 정렬 비교 함수
   *
   * @param {Snippet} a - 비교할 첫 번째 스니펫
   * @param {Snippet} b - 비교할 두 번째 스니펫
   * @returns {number} 정렬 순서 결정 값 (-1, 0, 1)
   */
  snippetOrderCompare(a: Snippet, b: Snippet): number {
    if (a.id < b.id) {
      return -1
    } else if (a.id > b.id) {
      return 1
    }
    return 0
  }

  /**
   * 임의의 6자리 16진수 문자열을 생성합니다.
   *
   * @returns {string} 생성된 6자리 16진수 문자열
   */
  hash(): string {
    return Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  }

  /**
   * 아직 채점 되지 않은 테스트 제출 기록을 생성합니다.
   *
   * 1. 주어진 문제 ID에 해당하는 문제를 조회, 문제를 찾지 못하면 예외를 발생
   * 2. 제출한 언어가 문제에서 지원하는 언어인지 확인, 지원하지 않으면 예외를 발생
   * 3. 제출한 코드가 템플릿을 수정했는지 검증, 템플릿을 수정했으면 예외를 발생
   * 4. 테스트 제출 객체(`testSubmission`)를 생성, 테스트 제출 정보를 저장하는 임시 객체
   * 5. `isUserTest` 플래그에 따라 사용자 테스트 케이스와 공개 테스트 케이스를 구분하여 채점 요청 큐에 적절한 메시지를 발행
   *    - 사용자 테스트 케이스인 경우: `publishUserTestMessage`를 호출하여 사용자 테스트 케이스에 대해 제출을 처리
   *    - 공개 테스트 케이스인 경우: `publishTestMessage`를 호출하여 공개 테스트 케이스에 대해 제출을 처리
   * 6. `containHiddenTestcases` 플래그에 따라 히든 테스트 케이스에 대한 결과를 포함할 지 결정
   *    - isGroupLeader: 해당 문제가 속한 UserGroup의 GroupLeader인 경우 포함
   *    - isContestStaff: 해당 문제가 속한 Contest의 Admin / Manager / Reviewer인 경우 포함
   * @param {number} userId - 테스트 제출 기록을 생성할 사용자의 ID
   * @param {number} problemId - 테스트 제출 기록을 생성할 문제의 ID
   * @param {CreateSubmissionDto} submissionDto - 제출할 코드 및 관련 데이터
   * @param {boolean} [isUserTest=false] - 사용자 테스트 케이스인지 여부 (기본값: false)
   * @returns {Promise<TestSubmission>}
   * @throws {EntityNotExistException} 다음과 같은 경우에 발생합니다
   *   - 주어진 문제가 존재하지 않는 경우
   * @throws {ConflictFoundException} 다음과 같은 경우에 발생합니다
   *   - 문제에서 해당 언어를 지원하지 않는 경우
   *   - 제출 코드가 문제 템플릿을 수정한 경우
   */
  async submitTest(
    userId: number,
    problemId: number,
    userIp: string,
    submissionDto: CreateSubmissionDto,
    isUserTest = false
  ): Promise<TestSubmission> {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId
      },
      include: {
        sharedGroups: {
          select: {
            userGroup: {
              where: {
                userId,
                isGroupLeader: true
              }
            }
          }
        },
        contestProblem: {
          select: {
            contest: {
              select: {
                userContest: {
                  where: {
                    userId,
                    role: { in: ['Admin', 'Manager', 'Reviewer'] }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    if (!problem.languages.includes(submissionDto.language)) {
      throw new ConflictFoundException(
        `This problem does not support language ${submissionDto.language}`
      )
    }
    const { code } = submissionDto
    if (
      !this.isValidCode(
        code,
        submissionDto.language,
        plainToInstance(Template, problem.template)
      )
    ) {
      throw new ConflictFoundException('Modifying template is not allowed')
    }

    // User Testcase에 대한 TEST 요청인 경우
    if (isUserTest) {
      const testSubmission = await this.createTestSubmission(
        { ...submissionDto, problemId, userId, userIp },
        code,
        true
      )

      await this.publishUserTestMessage(
        submissionDto.code,
        testSubmission,
        (submissionDto as CreateUserTestSubmissionDto).userTestcases
      )
      return testSubmission
    }

    // problem.sharedGroups 중에서 userGroup들 중에서 userId가 주어진 userId이고,
    // isGroupLeader = True인 userGroup이 존재하면
    const isGroupLeader = problem.sharedGroups.some(
      (sharedGroup) => sharedGroup.userGroup.length > 0
    )

    // 해당 problem이 포함된 contest에 대한 Admin / Manager / Reviewer인지 확인
    const isContestStaff = problem.contestProblem.some(
      (contestProblem) => contestProblem.contest.userContest.length > 0
    )

    const containHiddenTestcases = isGroupLeader || isContestStaff

    // Open Testcase에 대한 TEST 요청인 경우
    const testSubmission = await this.createTestSubmission(
      { ...submissionDto, problemId, userId, userIp },
      code,
      false
    )
    await this.publishTestMessage(
      problemId,
      submissionDto.code,
      testSubmission,
      containHiddenTestcases
    )
    return testSubmission
  }

  /**
   * 공개 테스트 케이스에 대해 아직 채점되지 않은 테스트케이스 채점 결과들을 생성하고, 채점 요청 메시지를 발행합니다.
   *
   * 1. 주어진 문제 ID(problemId)에 해당하는 모든 공개 테스트케이스를 조회
   * 2. 각 테스트케이스에 대해 캐시에 결과 상태를 'Judging'으로 저장하고,
   *    테스트케이스 ID를 수집
   * 3. 수집된 테스트케이스 ID 목록을 캐시에 저장
   * 4. publishJudgeRequestMessage 메서드를 호출하여 채점 요청 메시지를 게시
   *
   * @param {number} problemId - 문제 ID
   * @param {Snippet[]} code - 제출된 코드 스니펫 배열
   * @param {Submission} testSubmission - 테스트 제출 객체
   * @param {boolean} containHiddenTestcases - Hidden Testcase 포함 여부
   * @returns {Promise<void>}
   */
  async publishTestMessage(
    problemId: number,
    code: Snippet[],
    testSubmission: TestSubmission,
    containHiddenTestcases: boolean
  ): Promise<void> {
    const rawTestcases = await this.prisma.problemTestcase.findMany({
      where: {
        problemId,
        ...(containHiddenTestcases ? {} : { isHidden: false })
      }
    })

    const testcaseIds: number[] = []
    for (const rawTestcase of rawTestcases) {
      await this.cacheManager.set(
        testKey(testSubmission.id, rawTestcase.id),
        { id: rawTestcase.id, result: 'Judging' },
        TEST_SUBMISSION_EXPIRE_TIME
      )
      testcaseIds.push(rawTestcase.id)
    }

    await this.cacheManager.set(testcasesKey(testSubmission.id), testcaseIds)

    await this.publish.publishJudgeRequestMessage({
      code,
      submission: testSubmission,
      isTest: true,
      stopOnNotAccepted: false,
      containHiddenTestcases
    })
  }

  /**
   * 사용자 테스트 케이스에 대해 아직 채점되지 않은 테스트케이스 채점 결과들을 생성하고, 채점 요청 메시지를 발행합니다.
   *
   *
   * 1. 전달된 사용자 테스트케이스 목록(userTestcases)을 순회하며,
   *    각 테스트케이스에 대해 캐시에 결과 상태를 'Judging'으로 저장하고,
   *    테스트케이스 ID를 수집
   * 2. 수집된 사용자 테스트케이스 ID 목록을 캐시에 저장
   * 3. publishJudgeRequestMessage 메서드를 호출하여 사용자 테스트케이스에 대한
   *    채점 요청 메시지를 게시
   *
   * @param {Snippet[]} code - 제출된 코드 스니펫 배열
   * @param {Submission} testSubmission - 테스트 제출 객체
   * @param {{ id: number; in: string; out: string }[]} userTestcases - 사용자 정의 테스트케이스 배열
   * @returns {Promise<void>} 모든 작업이 완료되면 반환되는 프로미스
   */
  async publishUserTestMessage(
    code: Snippet[],
    testSubmission: TestSubmission,
    userTestcases: { id: number; in: string; out: string }[]
  ): Promise<void> {
    const testcaseIds = userTestcases.map((tc) => tc.id)

    await this.cacheManager.set(
      userTestcasesKey(testSubmission.id),
      testcaseIds,
      TEST_SUBMISSION_EXPIRE_TIME
    )

    for (const testcase of userTestcases) {
      await this.cacheManager.set(
        userTestKey(testSubmission.id, testcase.id),
        {
          id: testcase.id,
          result: ResultStatus.Judging
        },
        TEST_SUBMISSION_EXPIRE_TIME
      )
    }

    await this.publish.publishJudgeRequestMessage({
      code,
      submission: testSubmission,
      isUserTest: true,
      userTestcases,
      stopOnNotAccepted: false
    })
  }

  @Span()
  async createTestSubmission(
    testSubmissionData: Pick<
      Submission,
      'problemId' | 'language' | 'userId' | 'userIp'
    >,
    codeSnippet: Snippet[],
    isUserTest = false
  ): Promise<TestSubmission> {
    const problem = await this.prisma.problem.findFirst({
      where: {
        id: testSubmissionData.problemId
      }
    })

    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    if (!problem.languages.includes(testSubmissionData.language)) {
      throw new ConflictFoundException(
        `This problem does not support language ${testSubmissionData.language}`
      )
    }
    if (
      !this.isValidCode(
        codeSnippet,
        testSubmissionData.language,
        plainToInstance(Template, problem.template)
      )
    ) {
      throw new ConflictFoundException('Modifying template is not allowed')
    }

    const submissionData = {
      code: codeSnippet.map((snippet) => ({ ...snippet })),
      userId: testSubmissionData.userId,
      userIp: testSubmissionData.userIp,
      problemId: testSubmissionData.problemId,
      codeSize: new TextEncoder().encode(codeSnippet[0].text).length,
      language: testSubmissionData.language
    }

    const submission = await this.prisma.testSubmission.create({
      data: {
        ...submissionData,
        isUserTest
      }
    })

    return submission
  }

  async getTestResult(userId: number, isUserTest = false) {
    // 가장 최신의 Test Submission 불러오기
    const testSubmissionId = (
      await this.prisma.testSubmission.findFirst({
        where: {
          userId,
          isUserTest
        },
        orderBy: {
          id: 'desc'
        }
      })
    )?.id

    if (!testSubmissionId) {
      return []
    }

    const testCasesKey = isUserTest
      ? userTestcasesKey(testSubmissionId)
      : testcasesKey(testSubmissionId)

    const testcases =
      (await this.cacheManager.get<number[]>(testCasesKey)) ?? []

    const results: { id: number; result: ResultStatus; output?: string }[] = []
    for (const testcaseId of testcases) {
      const key = isUserTest
        ? userTestKey(testSubmissionId, testcaseId)
        : testKey(testSubmissionId, testcaseId)
      const testcase = await this.cacheManager.get<{
        id: number
        result: ResultStatus
        output?: string
      }>(key)
      if (testcase) {
        results.push(testcase)
      }
    }
    return results
  }

  /**
   * 특정 큐의 현재 consumer capacity을 조회하고,
   * 설정된 threshold와 비교하여 지연 여부를 판단합니다.
   *
   * 1. RabbitMQ API URL과 자격 증명을 구성
   * 2. 지정된 큐(`JUDGE_SUBMISSION_QUEUE_NAME`)의 정보를 GET 요청으로 조회
   * 3. 응답 상태가 200(성공)인 경우:
   *    - 소비자 용량이 설정된 임계값보다 높으면 지연이 없는 것으로 판단
   *    - 그렇지 않으면 지연이 있다고 판단하고, 원인을 'Judge server is not working.'으로 설정
   * 4. 응답 상태가 200이 아닌 경우 RabbitMQ 서버 자체의 문제로 판단하여 지연이 있다고 판단
   *
   * @returns {Promise<{ isDelay: boolean; cause?: string }>}
   *   - isDelay: 지연 여부 (true=지연 발생)
   *   - cause: 지연 원인
   */
  @Span()
  async checkDelay(): Promise<{ isDelay: boolean; cause?: string }> {
    const baseUrl = this.configService.get(
      'RABBITMQ_API_URL',
      'http://127.0.0.1:15672/api'
    )

    const url =
      baseUrl +
      '/queues/' +
      this.configService.get('RABBITMQ_DEFAULT_VHOST') +
      '/' +
      this.configService.get('JUDGE_SUBMISSION_QUEUE_NAME')

    const config: AxiosRequestConfig = {
      method: 'GET',
      withCredentials: true,
      auth: {
        username: this.configService.get('RABBITMQ_DEFAULT_USER', ''),
        password: this.configService.get('RABBITMQ_DEFAULT_PASS', '')
      }
    }
    const res = await this.httpService.axiosRef(url, config)
    const threshold = 0.9

    if (res.status == 200) {
      if (res.data.consumer_capacity > threshold) return { isDelay: false }
      return { isDelay: true, cause: 'Judge server is not working.' }
    } else {
      return { isDelay: true, cause: 'RabbitMQ is not working.' }
    }
  }

  /**
   * 주어진 문제에 대한 제출 기록 목록을 불러옵니다.
   *
   * 1. 지정된 문제와 그룹에 대해 visibleLockTime이 초기값(MIN_DATE)인 문제를 조회
   * 2. 페이징 옵션을 적용하여 해당 문제에 대한 제출 기록 목록을 조회
   * 3. 해당 문제에 대한 총 제출 기록 수 계산
   * 4. 제출물 목록과 총 개수를 포함하는 객체를 반환
   *
   * @param {number} id - Submission ID
   * @param {number} problemId - 제출 기록을 조회할 문제 ID
   * @param {number} userId - 제출 기록을 조회할 사용자 ID
   * @param {Role} userRole - 사용자의 역할 (Admin, SuperAdmin 등)
   * @param {number | null} contestId - 대회 ID (null인 경우 대회 제출 아님)
   * @param {number | null} assignmentId - 과제 ID (null인 경우 과제 제출 아님)
   * @returns 문제에 대한 제출 기록 목록과 총 제출 기록 수
   * @throws {EntityNotExistException} 주어진 조건에 맞는 문제가 존재하지 않을 경우
   */
  @Span()
  async getSubmission({
    id,
    problemId,
    userId,
    userRole,
    contestId,
    assignmentId
  }: {
    id: number
    problemId: number
    userId: number
    userRole: Role
    contestId: number | null
    assignmentId: number | null
  }) {
    const now = new Date()
    let contest: {
      startTime: Date
      endTime: Date
      isJudgeResultVisible: boolean
    } | null = null
    let assignment: {
      startTime: Date
      endTime: Date
      isJudgeResultVisible: boolean
    } | null = null
    let isJudgeResultVisible: boolean | null = null
    let isHiddenTestcaseVisible: boolean | null = null

    if (contestId) {
      const contestRecord = await this.prisma.contestRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: {
            contestId,
            userId
          }
        },
        select: {
          contest: {
            select: {
              startTime: true,
              endTime: true,
              isJudgeResultVisible: true
            }
          }
        }
      })
      if (!contestRecord) {
        throw new EntityNotExistException('ContestRecord')
      }
      contest = contestRecord.contest
      isJudgeResultVisible = contest.isJudgeResultVisible
    } else if (assignmentId) {
      const assignmentRecord = await this.prisma.assignmentRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_userId: {
            assignmentId,
            userId
          }
        },
        select: {
          assignment: {
            select: {
              groupId: true,
              startTime: true,
              endTime: true,
              isJudgeResultVisible: true
            }
          }
        }
      })
      if (!assignmentRecord) {
        throw new EntityNotExistException('AssignmentRecord')
      }
      assignment = assignmentRecord.assignment
      isHiddenTestcaseVisible = assignment.isJudgeResultVisible
    }

    let problem
    if (!contestId && !assignmentId) {
      problem = await this.prisma.problem.findFirst({
        where: {
          id: problemId,
          visibleLockTime: {
            equals: MIN_DATE // contestId와 assignmentId가 없는 경우에는 공개된 문제인 경우에만 제출 내역을 가져와야 함
          }
        }
      })
      if (!problem) {
        throw new EntityNotExistException('Problem')
      }
    } else {
      problem = await this.prisma.problem.findFirst({
        where: {
          id: problemId
        }
      })
      if (!problem) {
        throw new EntityNotExistException('Problem')
      }
    }

    const submission = await this.prisma.submission.findFirst({
      where: {
        id,
        problemId,
        contestId,
        assignmentId
      },
      select: {
        userId: true,
        user: {
          select: {
            username: true
          }
        },
        language: true,
        code: true,
        createTime: true,
        result: true,
        submissionResult: {
          include: {
            problemTestcase: {
              select: { isHidden: true }
            }
          }
        },
        codeSize: true
      }
    })
    if (!submission) {
      throw new EntityNotExistException('Submission')
    }

    // 본인이나 관리자가 아닐 경우
    if (
      submission.userId !== userId &&
      userRole !== Role.Admin &&
      userRole !== Role.SuperAdmin
    ) {
      if (
        contest &&
        contest.startTime <= now &&
        contest.endTime > now &&
        userRole === Role.User
      ) {
        // 진행 중인 contest에서 다른 사람의 제출을 볼 수 없음
        throw new ForbiddenAccessException(
          "Contest should end first before you browse other people's submissions"
        )
      } else if (
        assignment &&
        assignment.startTime <= now &&
        assignment.endTime > now &&
        userRole === Role.User
      ) {
        // 진행 중인 assignment에서 다른 사람의 제출을 볼 수 없음
        throw new ForbiddenAccessException(
          "Assignment should end first before you browse other people's submissions"
        )
      }

      // contest/assignment가 종료되었거나 일반 problem인 경우, 문제를 풀었는지 확인
      if (contestId || (!contestId && !assignmentId)) {
        const acceptedCount = await this.prisma.submission.count({
          where: { userId, problemId, result: 'Accepted' }
        })
        if (acceptedCount === 0) {
          throw new ForbiddenAccessException(
            "You must pass the problem first to browse other people's submissions"
          )
        }
      } else {
        // assignment의 경우 문제를 풀어도 다른 사람의 코드를 볼 수 없음
        throw new ForbiddenAccessException(
          "You cannot view other people's submissions for an assignment."
        )
      }
    }

    const code = plainToInstance(Snippet, submission.code)
    const results = submission.submissionResult
      .filter(
        (result) =>
          !assignmentId ||
          isHiddenTestcaseVisible ||
          !result.problemTestcase.isHidden
      )
      .map((result) => {
        return {
          ...result,
          // TODO: 채점 속도가 너무 빠른경우에 대한 수정 필요 (0ms 미만)
          cpuTime:
            result.cpuTime || result.cpuTime === BigInt(0)
              ? result.cpuTime.toString()
              : null
        }
      })

    results.sort((a, b) => a.problemTestcaseId - b.problemTestcaseId)

    if (contestId && !isJudgeResultVisible) {
      results.map((r) => {
        r.result = 'Blind'
        r.cpuTime = null
        r.memoryUsage = null
      })
    }

    if (assignmentId && !isHiddenTestcaseVisible) {
      submission.result = this.getSampleTestcaseSubmissionResult(
        submission.submissionResult
      )
    }

    return {
      problemId,
      username: submission.user?.username,
      code: code.map((snippet) => snippet.text).join('\n'),
      language: submission.language,
      createTime: submission.createTime,
      result: !contestId || isJudgeResultVisible ? submission.result : 'Blind',
      testcaseResult: results
    }
  }

  // FIXME: Workbook 구분
  @Span()
  async getSubmissions({
    problemId,
    cursor = null,
    take = 10
  }: {
    problemId: number
    cursor?: number | null
    take?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const problem = await this.prisma.problem.findFirst({
      where: {
        id: problemId,
        visibleLockTime: {
          equals: MIN_DATE
        }
      }
    })
    if (!problem) {
      throw new EntityNotExistException('Problem')
    }

    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        problemId
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true,
        codeSize: true
      },
      orderBy: [{ id: 'desc' }, { createTime: 'desc' }]
    })

    const total = await this.prisma.submission.count({ where: { problemId } })

    return { data: submissions, total }
  }

  @Span()
  async getContestSubmissions({
    problemId,
    contestId,
    userId,
    cursor = null,
    take = 10
  }: {
    problemId: number
    contestId: number
    userId: number
    cursor?: number | null
    take?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const isAdmin = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: 'Admin'
      }
    })

    if (!isAdmin) {
      const contestRecord = await this.prisma.contestRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          contestId_userId: {
            contestId,
            userId
          }
        }
      })
      if (!contestRecord) {
        throw new EntityNotExistException('ContestRecord')
      }
    }

    const contestProblem = await this.prisma.contestProblem.findFirst({
      where: {
        problem: {
          id: problemId
        },
        contestId
      }
    })
    if (!contestProblem) {
      throw new EntityNotExistException('ContestProblem')
    }

    const contest = await this.prisma.contest.findFirst({
      where: {
        id: contestId
      },
      select: {
        isJudgeResultVisible: true
      }
    })
    if (!contest) {
      throw new EntityNotExistException('Contest')
    }
    const isJudgeResultVisible = contest.isJudgeResultVisible

    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        problemId,
        contestId,
        userId: isAdmin ? undefined : userId // Admin 계정인 경우 자신이 생성한 submission이 아니더라도 조회가 가능
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true,
        codeSize: true,
        problemId: true,
        problem: {
          select: {
            title: true
          }
        }
      },
      orderBy: [{ id: 'desc' }, { createTime: 'desc' }]
    })

    if (!isJudgeResultVisible) {
      submissions.map((submission) => (submission.result = 'Blind'))
    }

    const total = await this.prisma.submission.count({
      where: { problemId, contestId }
    })

    return { data: submissions, total }
  }

  /**
   * 주어진 문제에 대한 제출 기록 목록을 불러옵니다.
   *
   * 1. 지정된 문제와 그룹에 대해 visibleLockTime이 초기값(MIN_DATE)인 문제를 조회
   * 2. 페이징 옵션을 적용하여 해당 문제에 대한 제출 기록 목록을 조회
   * 3. 해당 문제에 대한 총 제출 기록 수 계산
   * 4. 제출물 목록과 총 개수를 포함하는 객체를 반환
   *
   * @param {Object} params - 제출 기록 조회를 위한 파라미터
   * @param {number} params.problemId - 제출 기록을 조회할 문제 ID
   * @param {number} params.assignmentId - 제출 기록을 조회할 과제 ID
   * @param {number} params.userId - 제출 기록을 조회할 사용자 ID
   * @param {number | null} [params.cursor=null] - 페이징을 위한 커서 값
   * @param {number} [params.take=10] - 한 번에 가져올 제출 기록의 개수
   * @returns 제출 기록 목록과 총 개수를 포함하는 객체
   * @throws {EntityNotExistException} 주어진 조건에 맞는 문제가 존재하지 않을 경우
   */
  @Span()
  async getAssignmentSubmissions({
    problemId,
    assignmentId,
    userId,
    cursor = null,
    take = 10
  }: {
    problemId: number
    assignmentId: number
    userId: number
    cursor?: number | null
    take?: number
  }) {
    const paginator = this.prisma.getPaginator(cursor)

    const isAdmin = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: 'Admin'
      }
    })

    if (!isAdmin) {
      const assignmentRecord = await this.prisma.assignmentRecord.findUnique({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          assignmentId_userId: {
            assignmentId,
            userId
          }
        }
      })
      if (!assignmentRecord) {
        throw new EntityNotExistException('AssignmentRecord')
      }
    }

    const assignmentProblem = await this.prisma.assignmentProblem.findFirst({
      where: {
        problem: {
          id: problemId
        },
        assignmentId
      },
      select: {
        order: true,
        problem: {
          select: {
            id: true,
            title: true
          }
        },
        assignment: {
          select: {
            id: true,
            isJudgeResultVisible: true,
            title: true
          }
        }
      }
    })

    if (!assignmentProblem) {
      throw new EntityNotExistException('AssignmentProblem')
    }

    const { assignment } = assignmentProblem

    const isHiddenTestcaseVisible = assignment.isJudgeResultVisible

    const submissions = await this.prisma.submission.findMany({
      ...paginator,
      take,
      where: {
        problemId,
        assignmentId,
        userId: isAdmin ? undefined : userId // Admin 계정인 경우 자신이 생성한 submission이 아니더라도 조회가 가능
      },
      select: {
        id: true,
        user: {
          select: {
            username: true
          }
        },
        createTime: true,
        language: true,
        result: true,
        codeSize: true,
        submissionResult: {
          select: {
            result: true,
            problemTestcase: {
              select: {
                isHidden: true
              }
            }
          }
        }
      },
      orderBy: [{ id: 'desc' }, { createTime: 'desc' }]
    })

    if (!isHiddenTestcaseVisible) {
      submissions.forEach((submission) => {
        submission.result = this.getSampleTestcaseSubmissionResult(
          submission.submissionResult
        )
      })
    }

    const total = await this.prisma.submission.count({
      where: { problemId, assignmentId }
    })

    return { data: submissions, total, assignmentProblem }
  }

  /**
   * 특정 과제 문제에 대한 사용자의 가장 최근 제출 기록을 가져옵니다.
   *
   * 1. 사용자가 과제에 참여했는지 확인
   * 2. 과제의 채점 결과 공개 여부를 확인
   * 3. 가장 최근 제출 기록을 조회
   * 4. 히든 테스트케이스 결과를 필터링하여 반환
   *
   * @param {number} problemId - 제출 기록을 조회할 문제 ID
   * @param {number} assignmentId - 제출 기록을 조회할 과제 ID
   * @param {number} userId - 제출 기록을 조회할 사용자 ID
   * @returns 가장 최근 제출 기록 객체
   * @throws {ForbiddenAccessException} 사용자가 과제에 참여하지 않은 경우
   * @throws {NotFoundException} 과제 또는 제출 기록이 존재하지 않는 경우
   */
  async getLatestAssignmentProblemSubmission(
    problemId: number,
    assignmentId: number,
    userId: number
  ) {
    const isParticipated = await this.prisma.assignmentRecord.findUnique({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { assignmentId_userId: { assignmentId, userId } }
    })

    if (!isParticipated) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }

    const isHiddenTestcaseVisible = (
      await this.prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
          isJudgeResultVisible: true
        }
      })
    )?.isJudgeResultVisible

    if (isHiddenTestcaseVisible === undefined) {
      throw new NotFoundException('Assignment')
    }

    const rawSubmission = await this.prisma.submission.findFirst({
      where: { userId, assignmentId, problemId },
      orderBy: {
        createTime: 'desc'
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            username: true
          }
        },
        language: true,
        code: true,
        createTime: true,
        result: true,
        submissionResult: {
          include: {
            problemTestcase: {
              select: {
                isHidden: true
              }
            }
          }
        },
        codeSize: true
      }
    })

    if (!rawSubmission) {
      throw new NotFoundException('Submission')
    }

    const filteredSubmissionResult = rawSubmission.submissionResult
      .filter(
        (result) => isHiddenTestcaseVisible || !result.problemTestcase.isHidden
      )
      .map(({ id, cpuTime, memoryUsage, problemTestcaseId, result }) => ({
        id,
        cpuTime: cpuTime?.toString(),
        memoryUsage,
        problemTestcaseId,
        result
      }))

    if (!isHiddenTestcaseVisible) {
      rawSubmission.result = this.getSampleTestcaseSubmissionResult(
        rawSubmission.submissionResult
      )
    }

    return { ...rawSubmission, submissionResult: filteredSubmissionResult }
  }

  /**
   * 특정 과제에 과제에 속한 문제별로 사용자의 제출 요약 정보를 가져옵니다.
   * Submission Result, Testcase 개수와 accepted Testcase 개수를 포함합니다.
   *
   * 1. 사용자가 과제에 참여했는지 확인
   * 2. 과제의 문제 목록을 조회
   * 3. 사용자의 제출 기록을 조회하고 문제별로 요약 정보 생성
   *
   * @param {number} assignmentId - 제출 요약 정보를 조회할 과제 ID
   * @param {number} userId - 제출 요약 정보를 조회할 사용자 ID
   * @returns 과제 문제별 제출 요약 정보 배열
   * @throws {ForbiddenAccessException} 사용자가 과제에 참여하지 않은 경우
   */
  async getAssignmentSubmissionSummary(assignmentId: number, userId: number) {
    const [isParticipated, assignmentProblems] = await Promise.all([
      this.prisma.assignmentRecord.findUnique({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        where: { assignmentId_userId: { assignmentId, userId } },
        select: {
          assignment: {
            select: {
              isJudgeResultVisible: true
            }
          }
        }
      }),
      this.prisma.assignmentProblem.findMany({
        where: { assignmentId },
        select: {
          problemId: true
        }
      })
    ])

    if (!isParticipated) {
      throw new ForbiddenAccessException(
        'User not participated in the assignment'
      )
    }

    const { assignment } = isParticipated
    const isHiddenTestcaseVisible = assignment.isJudgeResultVisible

    if (assignmentProblems.length === 0) {
      return []
    }

    const submissions = await this.prisma.submission.findMany({
      where: { userId, assignmentId },
      select: {
        problemId: true,
        createTime: true,
        result: true,
        submissionResult: {
          select: {
            result: true,
            problemTestcase: {
              select: {
                isHidden: true
              }
            }
          }
        }
      },
      orderBy: {
        createTime: 'desc'
      }
    })

    const submissionMap = new Map<
      number,
      {
        submissionTime: Date
        submissionResult: string
        testcaseCount: number | null
        acceptedTestcaseCount: number | null
      }
    >()

    for (const submission of submissions) {
      if (!submissionMap.has(submission.problemId)) {
        const filteredSubmissionResult = submission.submissionResult.filter(
          (result) =>
            isHiddenTestcaseVisible || !result.problemTestcase.isHidden
        )

        submissionMap.set(submission.problemId, {
          submissionTime: submission.createTime,
          submissionResult: isHiddenTestcaseVisible
            ? submission.result
            : this.getSampleTestcaseSubmissionResult(
                submission.submissionResult
              ),
          testcaseCount: filteredSubmissionResult.length,
          acceptedTestcaseCount: filteredSubmissionResult.reduce(
            (acc, { result }) => {
              if (result === ResultStatus.Accepted) return acc + 1
              else return acc
            },
            0
          )
        })
      }
    }

    return assignmentProblems.map(({ problemId }) => ({
      problemId,
      submission: submissionMap.get(problemId) ?? null
    }))
  }

  /**
   * 히든 테스트케이스를 제외한 제출 결과를 기반으로 샘플 테스트케이스의 결과를 계산합니다.
   *
   * 1. 히든 테스트케이스를 필터링하여 제외
   * 2. 모든 테스트케이스가 Accepted 상태인지 확인
   * 3. 모든 테스트케이스가 Accepted 상태라면 Accepted를 반환
   * 4. 그렇지 않으면 첫 번째 실패한 테스트케이스의 결과를 반환
   * 5. 실패한 테스트케이스가 없으면 ServerError를 반환
   *
   * @param {Array<{
   *   result: ResultStatus;
   *   problemTestcase: { isHidden: boolean };
   * }>} submissionResults - Testcase result 배열
   * @returns {ResultStatus} 샘플 테스트케이스만 반영한 Submission Result
   */
  private getSampleTestcaseSubmissionResult(
    submissionResults: Array<{
      result: ResultStatus
      problemTestcase: {
        isHidden: boolean
      }
    }>
  ) {
    const filteredResults = submissionResults.filter(
      (result) => !result.problemTestcase.isHidden
    )

    const allAccepted = filteredResults.every(
      (testcaseResult) => testcaseResult.result === ResultStatus.Accepted
    )

    return allAccepted
      ? ResultStatus.Accepted
      : (filteredResults.find(
          (submissionResult) =>
            submissionResult.result !== ResultStatus.Accepted
        )?.result ?? ResultStatus.ServerError)
  }
}
