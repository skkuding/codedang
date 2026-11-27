import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { AttachmentService } from '@libs/attachment'

/**
 * 첨부(이미지/PDF)를 data-attachment-id로 관리하는 Problem 필드 목록
 */
export const PROBLEM_ATTACHMENT_FIELDS = [
  'description',
  'inputDescription',
  'outputDescription'
] as const

export type ProblemAttachmentField = (typeof PROBLEM_ATTACHMENT_FIELDS)[number]

export type ProblemAttachmentFields = Partial<
  Record<ProblemAttachmentField, string | null | undefined>
>

type TransactionClient = Prisma.TransactionClient

/**
 * Problem 본문 첨부 파일의 검증·귀속·정리를 담당한다.
 *
 * 도메인과 무관한 공통 기능(ID 추출, 비교, URL 생성, 스토리지 삭제, URL 검사)은
 * `AttachmentService`(@libs/attachment)에 위임하고,
 * `File.problemId`에 의존하는 귀속·삭제 대상 판단만 이 서비스가 직접 담당한다.
 *
 * DB를 변경하는 메서드는 호출자의 트랜잭션 클라이언트를 받아서,
 * Problem 생성/수정/삭제와 같은 트랜잭션에서 처리되도록 한다.
 * S3 삭제는 트랜잭션 커밋 이후에 `deleteFromStorage`로 수행한다.
 */
@Injectable()
export class ProblemAttachmentService {
  constructor(private readonly attachmentService: AttachmentService) {}

  /**
   * 필드 HTML에서 data-attachment-id 값을 추출한다. (중복 제거)
   */
  extractIds(fields: ProblemAttachmentFields): string[] {
    return this.attachmentService.extractIds(this.toHtmls(fields))
  }

  /**
   * 첨부 ID를 검증하고 본인이 올린 Temporary 파일을 Attached로 전환한다.
   * - 이미 같은 문제에 Attached된 ID는 그대로 둔다.
   * - 존재하지 않음 / Unmanaged / 타인의 Temporary / 다른 문제에 Attached는 거부한다.
   * 하나라도 실패하면 UnprocessableDataException을 던져 트랜잭션 전체를 롤백시킨다.
   */
  async attach(
    tx: TransactionClient,
    args: { problemId: number; userId: number; ids: string[] }
  ): Promise<void> {
    throw new Error('Not implemented')
  }

  /**
   * 수정 전후 첨부 ID의 차이를 계산한다.
   */
  diff(
    prevIds: string[],
    nextIds: string[]
  ): { added: string[]; removed: string[] } {
    return this.attachmentService.diff(prevIds, nextIds)
  }

  /**
   * 해당 문제에 Attached된 파일 중 삭제 대상 filename을 조회한다.
   * `ids`를 생략하면 해당 문제의 모든 첨부를 반환한다.
   */
  async findDeletable(
    tx: TransactionClient,
    problemId: number,
    ids?: string[]
  ): Promise<string[]> {
    throw new Error('Not implemented')
  }

  /**
   * filename으로 공개 접근 URL을 만든다. (기존 업로드 응답과 같은 형식)
   */
  toUrl(filename: string): string {
    return this.attachmentService.toUrl(filename)
  }

  /**
   * 트랜잭션 커밋 후 S3에서 파일을 삭제한다.
   * 실패해도 예외를 던지지 않고 로그만 남긴다.
   */
  async deleteFromStorage(filenames: string[]): Promise<void> {
    return this.attachmentService.deleteFromStorage(filenames)
  }

  /**
   * 설정이 활성화된 경우, 필드 HTML에 스토리지 URL이 직접 들어 있으면 거부한다.
   * (기존 데이터 마이그레이션 완료 후 활성화)
   */
  assertNoStorageUrl(fields: ProblemAttachmentFields): void {
    this.attachmentService.assertNoStorageUrl(this.toHtmls(fields))
  }

  private toHtmls(fields: ProblemAttachmentFields) {
    return PROBLEM_ATTACHMENT_FIELDS.map((field) => fields[field])
  }
}
