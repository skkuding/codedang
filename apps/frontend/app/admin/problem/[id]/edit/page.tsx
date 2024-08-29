'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { UPDATE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { Template, UpdateProblemInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { toast } from 'sonner'
import DescriptionForm from '../../../_components/DescriptionForm'
import FormSection from '../../../_components/FormSection'
import SwitchField from '../../../_components/SwitchField'
import TitleForm from '../../../_components/TitleForm'
import InfoForm from '../../_components/InfoForm'
import LimitForm from '../../_components/LimitForm'
import PopoverVisibleInfo from '../../_components/PopoverVisibleInfo'
import TemplateField from '../../_components/TemplateField'
import TestcaseField from '../../_components/TestcaseForm'
import VisibleForm from '../../_components/VisibleForm'
import { editSchema } from '../../utils'

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()

  const methods = useForm<UpdateProblemInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      template: []
    }
  })

  const { handleSubmit, setValue, getValues } = methods

  const [showHint, setShowHint] = useState<boolean>(false)
  const [showSource, setShowSource] = useState<boolean>(false)

  useQuery(GET_PROBLEM, {
    variables: {
      groupId: 1,
      id: +id
    },
    onCompleted: (problemData) => {
      const data = problemData.getProblem
      setValue('id', +id)
      setValue('title', data.title)
      setValue('isVisible', data.isVisible)
      setValue('difficulty', data.difficulty)
      setValue('languages', data.languages ?? [])
      setValue(
        'tags.create',
        data.tag.map(({ tag }) => Number(tag.id))
      )
      setValue(
        'tags.delete',
        data.tag.map(({ tag }) => Number(tag.id))
      )
      setValue('description', data.description)
      setValue('inputDescription', data.inputDescription)
      setValue('outputDescription', data.outputDescription)
      setValue('testcases', data.testcase)
      setValue('timeLimit', data.timeLimit)
      setValue('memoryLimit', data.memoryLimit)
      setValue('hint', data.hint)
      if (data.hint !== '') setShowHint(true)
      setValue('source', data.source)
      if (data.source !== '') setShowSource(true)
      if (data.template) {
        const templates = JSON.parse(data.template[0])
        templates.map((template: Template, index: number) => {
          setValue(`template.${index}`, {
            language: template.language,
            code: [
              {
                id: template.code[0].id,
                text: template.code[0].text,
                locked: template.code[0].locked
              }
            ]
          })
        })
      }
    }
  })

  const [updateProblem, { error }] = useMutation(UPDATE_PROBLEM)
  const onSubmit = async (input: UpdateProblemInput) => {
    const tagsToDelete = getValues('tags.delete')
    const tagsToCreate = getValues('tags.create')
    input.tags!.create = tagsToCreate.filter(
      (tag) => !tagsToDelete.includes(tag)
    )
    input.tags!.delete = tagsToDelete.filter(
      (tag) => !tagsToCreate.includes(tag)
    )

    await updateProblem({
      variables: {
        groupId: 1,
        input
      }
    })
    if (error) {
      toast.error('Failed to update problem')
      return
    }
    toast.success('Succesfully updated problem')
    router.push('/admin/problem')
    router.refresh()
  }

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="-ml-8 flex items-center gap-4">
          <Link href={`/admin/problem/${id}`}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Edit Problem</span>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <FormProvider {...methods}>
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
              {getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>

            <div className="flex justify-between">
              <div className="w-[360px]">
                <FormSection title="Input Description">
                  {getValues('inputDescription') && (
                    <DescriptionForm name="inputDescription" />
                  )}
                </FormSection>
              </div>
              <div className="w-[360px]">
                <FormSection title="Output Description">
                  {getValues('outputDescription') && (
                    <DescriptionForm name="outputDescription" />
                  )}
                </FormSection>
              </div>
            </div>

            {getValues('testcases') && <TestcaseField />}

            <FormSection title="Limit">
              <LimitForm />
            </FormSection>
            <TemplateField />
            <SwitchField
              name="hint"
              title="Hint"
              placeholder="Enter a hint"
              formElement="textarea"
              hasValue={showHint}
            />
            <SwitchField
              name="source"
              title="Source"
              placeholder="Enter a source"
              formElement="input"
              hasValue={showSource}
            />

            <Button
              type="submit"
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </FormProvider>
        </form>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
