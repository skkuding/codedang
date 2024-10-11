'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { CREATE_PROBLEM } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { toast } from 'sonner'
import { useConfirmNavigation } from '../../_components/ConfirmNavigation'
import DescriptionForm from '../../_components/DescriptionForm'
import FormSection from '../../_components/FormSection'
import SwitchField from '../../_components/SwitchField'
import TitleForm from '../../_components/TitleForm'
import { CautionDialog } from '../_components/CautionDialog'
import InfoForm from '../_components/InfoForm'
import LimitForm from '../_components/LimitForm'
import PopoverVisibleInfo from '../_components/PopoverVisibleInfo'
import TemplateField from '../_components/TemplateField'
import TestcaseField from '../_components/TestcaseField'
import VisibleForm from '../_components/VisibleForm'
import { validateScoreWeight } from '../_libs/utils'
import { createSchema } from '../utils'

export default function Page() {
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogDescription, setDialogDescription] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const shouldSkipWarning = useRef(false)
  const router = useRouter()

  useConfirmNavigation(shouldSkipWarning)

  const methods = useForm<CreateProblemInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      difficulty: Level.Level1,
      tagIds: [],
      testcases: [
        { input: '', output: '', isHidden: false, scoreWeight: null },
        { input: '', output: '', isHidden: true, scoreWeight: null }
      ],
      timeLimit: 2000,
      memoryLimit: 512,
      hint: '',
      source: '',
      template: [],
      isVisible: true
    }
  })

  const { handleSubmit, getValues } = methods

  const [createProblem, { error }] = useMutation(CREATE_PROBLEM)
  const onSubmit = async () => {
    const input = methods.getValues()
    setIsCreating(true)
    const testcases = getValues('testcases')
    if (validateScoreWeight(testcases) === false) {
      setDialogDescription(
        'The scoring ratios have not been specified correctly.\nPlease review and correct them.'
      )
      setDialogOpen(true)
      setIsCreating(false)
      return
    }
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

    shouldSkipWarning.current = true
    toast.success('Problem created successfully')
    router.push('/admin/problem')
    router.refresh()
  }

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="-ml-8 flex items-center gap-4">
          <Link href="/admin/problem">
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">Create Problem</span>
        </div>

        <form
          onSubmit={handleSubmit(() => {
            setShowCreateModal(true)
          })}
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
              disabled={isCreating}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
            <AlertDialog open={showCreateModal}>
              <AlertDialogContent className="p-8">
                <AlertDialogHeader className="gap-2">
                  <AlertDialogTitle>Create Problem?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Once this problem is included in a contest and a user submit
                    any
                    <br />
                    code in the contest, testcases or time/memory limit{' '}
                    <span className="underline">cannot</span> be
                    <br />
                    modified.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    type="button"
                    className="rounded-md px-4 py-2"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      type="button"
                      disabled={isCreating}
                      onClick={() => onSubmit()}
                    >
                      Create
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </FormProvider>
        </form>
      </main>
      <ScrollBar orientation="horizontal" />
      <CautionDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        description={dialogDescription}
      />
    </ScrollArea>
  )
}
