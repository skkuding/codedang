import { Separator } from '@/components/shadcn/separator'
import assignmentIcon from '@/public/icons/assignment.svg'
// import examIcon from '@/public/icons/exam.svg'
import gradeIcon from '@/public/icons/grade.svg'
// import homeIcon from '@/public/icons/home.svg'
// import noticeIcon from '@/public/icons/notice.svg'
// import qnaIcon from '@/public/icons/qna.svg'
import Image from 'next/image'
import Link from 'next/link'
import { CourseInfoBox } from './CourseInfoBox'

interface CourseSidebarProps {
  courseId: string
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const navItems = [
    // { name: 'Home', path: `/course/${courseId}` as const, icon: homeIcon },
    // {
    //   name: 'Notice',
    //   path: `/course/${courseId}/notice` as const,
    //   icon: noticeIcon
    // },
    // {
    //   name: 'Exam',
    //   path: `/course/${courseId}/exam` as const,
    //   icon: examIcon
    // },
    {
      name: 'Assignment',
      path: `/course/${courseId}/assignment` as const,
      icon: assignmentIcon
    },
    {
      name: 'Grade',
      path: `/course/${courseId}/grade` as const,
      icon: gradeIcon
    }
    // {
    //   name: 'Q&A',
    //   path: `/course/${courseId}/qna` as const,
    //   icon: qnaIcon
    // }
  ]

  return (
    <div className="flex flex-col">
      <CourseInfoBox courseId={courseId} />
      <Separator className="my-6" />
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex gap-2 rounded-full px-4 py-2"
          >
            <Image src={item.icon} alt={item.name} width={16} height={16} />
            <span className="font-pretendard text-base font-medium text-[#474747]">
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
