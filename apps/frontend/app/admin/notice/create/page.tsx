import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import Link from 'next/link'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { DescriptionForm } from '../../_components/DescriptionForm'
import { FormSection } from '../../_components/FormSection'
import { TitleForm } from '../../_components/TitleForm'
import { VisibleForm } from '../../_components/VisibleForm'
import { CreateNoticeForm } from '../_components/CreateNoticeForm'
import { FixedForm } from '../_components/FixedForm'

export default function Page() {
  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="-ml-8 flex items-center gap-4">
          <Link href="/admin/problem">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Create Notice</span>
        </div>

        <CreateNoticeForm>
          <div className="flex gap-32">
            <FormSection title="Visible">
              <VisibleForm />
            </FormSection>

            <FormSection title="Fixed">
              <FixedForm />
            </FormSection>
          </div>

          <FormSection title="Title">
            <TitleForm placeholder="Enter a notice title" />
          </FormSection>

          <FormSection title="Content">
            <DescriptionForm name="content" />
          </FormSection>

          <Button
            type="submit"
            className="flex h-[36px] w-[100px] items-center gap-2 px-0"
          >
            <IoMdCheckmarkCircleOutline fontSize={20} />
            <div className="mb-[2px] text-base">Create</div>
          </Button>
        </CreateNoticeForm>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
