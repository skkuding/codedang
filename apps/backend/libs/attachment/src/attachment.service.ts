import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { StorageService } from '@libs/storage'
import { buildMediaUrl } from './media-url'

/**
 * 본문 HTML에 data-attachment-id로 삽입되는 첨부 파일의 공통 기능을 제공한다.
 *
 * 특정 도메인(Problem 등)이나 소유 관계에 의존하지 않으며,
 * 도메인별 귀속·삭제 대상 판단은 각 도메인 서비스가 담당한다.
 */
@Injectable()
export class AttachmentService {
  constructor(
    private readonly config: ConfigService,
    private readonly storageService: StorageService
  ) {}

  /**
   * HTML 목록에서 data-attachment-id 값을 추출한다. (중복 제거)
   */
  extractIds(htmls: Array<string | null | undefined>): string[] {
    throw new Error('Not implemented')
  }

  /**
   * 수정 전후 첨부 ID의 차이를 계산한다.
   */
  diff(
    prevIds: string[],
    nextIds: string[]
  ): { added: string[]; removed: string[] } {
    throw new Error('Not implemented')
  }

  /**
   * filename으로 공개 접근 URL을 만든다. (기존 업로드 응답과 같은 형식)
   */
  toUrl(filename: string): string {
    return buildMediaUrl(this.config, filename)
  }

  /**
   * 트랜잭션 커밋 후 스토리지에서 파일을 삭제한다.
   * 실패해도 예외를 던지지 않고 로그만 남긴다.
   */
  async deleteFromStorage(filenames: string[]): Promise<void> {
    throw new Error('Not implemented')
  }

  /**
   * 설정이 활성화된 경우, HTML에 스토리지 URL이 직접 들어 있으면 거부한다.
   * 첨부를 ID 방식으로 관리하는 필드에만 적용해야 한다.
   * (기존 데이터 마이그레이션 완료 후 활성화)
   */
  assertNoStorageUrl(htmls: Array<string | null | undefined>): void {
    throw new Error('Not implemented')
  }
}
