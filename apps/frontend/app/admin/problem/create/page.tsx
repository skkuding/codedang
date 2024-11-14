import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import Link from 'next/link'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import ConfirmNavigation from '../../_components/ConfirmNavigation'
import DescriptionForm from '../../_components/DescriptionForm'
import FormSection from '../../_components/FormSection'
import SwitchField from '../../_components/SwitchField'
import TitleForm from '../../_components/TitleForm'
import InfoForm from '../_components/InfoForm'
import LimitForm from '../_components/LimitForm'
import PopoverVisibleInfo from '../_components/PopoverVisibleInfo'
import TemplateField from '../_components/TemplateField'
import TestcaseField from '../_components/TestcaseField'
import VisibleForm from '../_components/VisibleForm'
import CreateProblemForm from './_components/CreateProblemForm'

export default function Page() {
  return (
    <ConfirmNavigation>
      <ScrollArea className="shrink-0">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div className="-ml-8 flex items-center gap-4">
            <Link href="/admin/problem">
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">Create Problem</span>
          </div>

          <CreateProblemForm>
            <div className="flex gap-32">
              <FormSection title="Title">
                <TitleForm placeholder="Enter a problem name" />
              </FormSection>

              <FormSection title="Visible">
                <PopoverVisibleInfo />
                <VisibleForm />
              </FormSection>
            </div>

            <FormSection title="Info">
              <InfoForm />
            </FormSection>

            <FormSection title="Description">
              <DescriptionForm name="description" />
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
                <FormSection title="Input Description">
                  <DescriptionForm name="inputDescription" />
                </FormSection>
              </div>
              <div className="w-[360px]">
                <FormSection title="Output Description">
                  <DescriptionForm name="outputDescription" />
                </FormSection>
              </div>
            </div>

            <TestcaseField />

            <FormSection title="Limit">
              <LimitForm />
            </FormSection>

            <TemplateField />

            <SwitchField
              name="hint"
              title="Hint"
              formElement="textarea"
              placeholder="Enter a hint"
            />

            <SwitchField
              name="source"
              title="Source"
              placeholder="Enter a source"
              formElement="input"
            />

            <Button
              type="submit"
              className="flex h-[36px] w-[100px] items-center gap-2 px-0"
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
          </CreateProblemForm>
        </main>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ConfirmNavigation>
  )
}
