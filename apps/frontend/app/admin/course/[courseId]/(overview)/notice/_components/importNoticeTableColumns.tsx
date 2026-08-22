import type { ColumnDef } from '@tanstack/react-table'

export interface NoticeItem {
  id: number
  title: string
  date: string
  course: string
  creator: string
}

// 커스텀 테이블(ImportNoticeTableContent)에서 row.original로 직접 렌더링하므로
// 여기서는 tanstack에 필요한 accessorKey/정렬 가능 여부만 정의한다.
export const importNoticeColumns: ColumnDef<NoticeItem>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: false
  },
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'course',
    header: 'Course',
    enableSorting: false
  },
  {
    accessorKey: 'creator',
    header: 'Creator'
  }
]
