import { Injectable } from '@nestjs/common'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 공지사항 목록을 페이징하여 조회합니다.
   * @param cursor - 커서 기반 페이징을 위한 기준 ID (null 가능)
   * @param take - 한 페이지에 가져올 데이터 개수
   * @param search - 제목 검색 키워드 (선택)
   * @param fixed - 상단 고정된 공지사항 여부 (기본값: false)
   * @returns 가공된 공지사항 목록과 전체 검색 결과 개수
   */
  async getNotices({
    cursor,
    take,
    search,
    fixed = false
  }: {
    cursor: number | null
    take: number
    search?: string
    fixed?: boolean
  }) {
    const paginator = this.prisma.getPaginator(cursor)
    const notices = await this.prisma.notice.findMany({
      ...paginator,
      where: {
        isVisible: true,
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        }
      },
      take,
      select: {
        id: true,
        title: true,
        createTime: true,
        isFixed: true,
        createdBy: {
          select: {
            username: true
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    const data = notices.map((notice) => {
      return {
        ...notice,
        createdBy: notice.createdBy?.username
      }
    })
    const total = await this.prisma.notice.count({
      where: {
        isVisible: true,
        isFixed: fixed,
        title: {
          contains: search,
          mode: 'insensitive'
        }
      }
    })

    return { data, total }
  }

  /**
   * 특정 ID의 공지사항 상세 정보와 이전/다음 글 링크를 조회합니다.
   * @param id - 조회하고자 하는 공지사항의 고유 ID
   * @returns 현재 글 정보, 이전 글, 다음 글 정보를 포함한 객체 
   */
  async getNoticeByID(id: number) {
    const notice = await this.prisma.notice.findUniqueOrThrow({
      where: {
        id,
        isVisible: true
      },
      select: {
        title: true,
        content: true,
        createTime: true,
        updateTime: true,
        createdBy: {
          select: {
            username: true
          }
        }
      }
    })

    const current = { ...notice, createdBy: notice.createdBy?.username }

    const navigate = (pos: 'prev' | 'next') => {
      type Order = 'asc' | 'desc'
      const options =
        pos === 'prev'
          ? { compare: { lt: id }, order: 'desc' as Order }
          : { compare: { gt: id }, order: 'asc' as Order }
      return {
        where: {
          id: options.compare,
          isVisible: true
        },
        orderBy: {
          id: options.order
        },
        select: {
          id: true,
          title: true
        }
      }
    }

    return {
      current,
      prev: await this.prisma.notice.findFirst(navigate('prev')),
      next: await this.prisma.notice.findFirst(navigate('next'))
    }
  }
}
