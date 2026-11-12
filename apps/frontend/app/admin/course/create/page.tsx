'use client'

import { CourseFormFields } from '@/app/admin/course/_components/CourseFormFields'
import { CreateCourseForm } from '@/app/admin/course/_components/CreateCourseForm'
import { Button } from '@/components/shadcn/button'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { ScrollBar } from '@/components/shadcn/scroll-area'
import ArrowLeftIcon from '@/public/icons/arrow-left-thin.svg'
import XCircleIcon from '@/public/icons/x-circle.svg'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmNavigation } from '../../_components/ConfirmNavigation'

export const dynamic = 'force-dynamic'

export default function Page() {
  const router = useRouter()
  return (
    <ConfirmNavigation>
      <ScrollArea className="shrink-0">
        <main className="flex w-full flex-col gap-10 px-20 py-16">
          <div className="flex items-center gap-2">
            <Link href="/admin/course">
              <ArrowLeftIcon className="size-7 hover:text-gray-700/80" />
            </Link>
            <span className="text-head2_b_32">CREATE COURSE</span>
          </div>

          <CreateCourseForm onSuccess={() => router.push('/admin/course')}>
            <CourseFormFields />

            <div className="mb-[50px] mt-5 flex items-center justify-end gap-1">
              <Button
                size="large"
                variant="lined"
                onClick={() => router.push('/admin/course')}
                className="text-sub3_sb_16 h-[56px] w-[127px] gap-[6px]"
              >
                <XCircleIcon className="size-6" />
                Cancel
              </Button>
              <Button
                size="large"
                variant="default"
                className="text-sub3_sb_16 h-[56px] w-[127px]"
              >
                Save
              </Button>
            </div>
          </CreateCourseForm>
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
