'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { CREATE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_TAGS } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import {
  Level,
  type CreateProblemInput,
  type Sample,
  type Testcase
} from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { toast } from 'sonner'
import DescriptionForm from '../../_components/DescriptionForm'
import FormSection from '../../_components/FormSection'
import SwitchField from '../../_components/SwitchField'
import TitleForm from '../../_components/TitleForm'
import AddBadge from '../_components/AddBadge'
import AddableForm from '../_components/AddableForm'
import InfoForm from '../_components/InfoForm'
import LimitForm from '../_components/LimitForm'
import PopoverVisibleInfo from '../_components/PopoverVisibleInfo'
import TemplateField from '../_components/TemplateField'
import VisibleForm from '../_components/VisibleForm'
import { createSchema } from '../utils'

export default function Page() {
  const { data: tagsData } = useQuery(GET_TAGS)
  const tags =
    tagsData?.getTags.map(({ id, name }) => ({ id: Number(id), name })) ?? []

  const [isCreating, setIsCreating] = useState(false)

  const router = useRouter()

  const methods = useForm<CreateProblemInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      difficulty: Level.Level1,
      tagIds: [],
      samples: [{ input: '', output: '' }],
      testcases: [{ input: '', output: '' }],
      hint: '',
      source: '',
      template: [],
      isVisible: true
    }
  })

  const { handleSubmit, setValue, getValues } = methods

  const [createProblem, { error }] = useMutation(CREATE_PROBLEM)
  const onSubmit = async (input: CreateProblemInput) => {
    setIsCreating(true)
    await createProblem({
      variables: {
        groupId: 1,
        input
      }
    })
    if (error) {
      toast.error('Failed to create problem')
      setIsCreating(false)
      return
    }
    toast.success('Problem created successfully')
    router.push('/admin/problem')
    router.refresh()
  }

  const addExample = (type: 'samples' | 'testcases') => {
    setValue(type, [...getValues(type), { input: '', output: '' }])
  }

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href="/admin/problem">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Create Problem</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <FormProvider {...methods}>
            <div className="flex gap-6">
              <FormSection title="Title">
                <TitleForm placeholder="Name your problem" />
              </FormSection>

              <FormSection title="Visible">
                <PopoverVisibleInfo />
                <VisibleForm />
              </FormSection>
            </div>

            <FormSection title="info">
              <InfoForm tags={tags} tagName="tagIds" />
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

            <FormSection title="Sample">
              <AddBadge onClick={() => addExample('samples')} />
              <AddableForm<Sample>
                type="samples"
                fieldName="samples"
                minimumRequired={1}
              />
            </FormSection>

            <FormSection title="Testcases">
              <AddBadge onClick={() => addExample('testcases')} />
              <AddableForm<Testcase>
                type="testcases"
                fieldName="testcases"
                minimumRequired={1}
              />
            </FormSection>

            <FormSection title="Limit">
              <LimitForm />
            </FormSection>

            <SwitchField
              name="hint"
              title="Hint"
              placeholder="Enter a hint"
              formElement="textarea"
            />
            <SwitchField
              name="source"
              title="Source"
              placeholder="Enter a source"
              formElement="input"
            />

            <TemplateField />

            <Button
              type="submit"
              className="flex h-[36px] w-[100px] items-center gap-2 px-0"
              disabled={isCreating}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
          </FormProvider>
        </form>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
