'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  UPDATE_PROBLEM,
  UPLOAD_TESTCASE_ZIP_LEGACY
} from '@/graphql/problem/mutations'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type {
  Solution,
  Template,
  Testcase,
  UpdateProblemInput
} from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { useRef, useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { TestcaseFieldRef } from '../../../_components/TestcaseField'
import { ZipUploadModal } from '../../../_components/ZipUploadModal'
import { validateScoreWeight } from '../../../_libs/utils'
import { useEditProblemContext } from './EditProblemContext'
import { ScoreCautionDialog } from './ScoreCautionDialog'

interface EditProblemFormProps {
  problemId: number
  children: ReactNode
  methods: UseFormReturn<UpdateProblemInput>
  isTestcaseEditBlocked: boolean
  testcaseFieldRef?: React.RefObject<TestcaseFieldRef | null>
}

export function EditProblemForm({
  problemId,
  children,
  methods,
  testcaseFieldRef
}: EditProblemFormProps) {
  const { t } = useTranslate()
  const [message, setMessage] = useState('')
  const [showCautionModal, setShowCautionModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [isUploadingZip, setIsUploadingZip] = useState(false)
  const { setIsSampleUploadedByZip, setIsHiddenUploadedByZip } =
    useEditProblemContext()
  const initialValues = useRef<{
    testcases: Testcase[]
    timeLimit: number
    memoryLimit: number
  } | null>(null)
  const pendingInput = useRef<UpdateProblemInput | null>(null)

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  useQuery(GET_PROBLEM, {
    variables: {
      id: Number(problemId)
    },
    onCompleted: (problemData) => {
      const data = problemData.getProblem

      // HACK: This is a workaround for migrating testcase to separated query/mutation.
      // After migration, testcase input/output is not going to passed through 'getProblem' and 'updateProblem'
      const testcases = data.testcase.map((tc) => ({
        id: Number(tc.id),
        input: tc.input ?? '',
        output: tc.output ?? '',
        isHidden: tc.isHidden,
        scoreWeightNumerator: tc.scoreWeightNumerator,
        scoreWeightDenominator: tc.scoreWeightDenominator
      }))

      const initialFormValues = {
        testcases,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit
      }
      initialValues.current = initialFormValues
      setIsSampleUploadedByZip(data.isSampleUploadedByZip || false)
      setIsHiddenUploadedByZip(data.isHiddenUploadedByZip || false)

      methods.reset({
        id: Number(problemId),
        title: data.title,
        isVisible: data.isVisible,
        difficulty: data.difficulty,
        languages: data.languages ?? [],
        tags: {
          create: data.tag.map(({ tag }) => Number(tag.id)),
          delete: data.tag.map(({ tag }) => Number(tag.id))
        },
        description: data.description,
        inputDescription: data.inputDescription || '<p></p>',
        outputDescription: data.outputDescription || '<p></p>',
        testcases,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit,
        hint: data.hint,
        source: data.source
      })

      if (data.template) {
        const templates = JSON.parse(data.template[0])
        templates.map((template: Template, index: number) => {
          methods.setValue(`template.${index}`, {
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
      if (data.solution) {
        const solutions = data.solution
        solutions.map((solution: Solution, index: number) => {
          methods.setValue(`solution.${index}`, {
            language: solution.language,
            code: solution.code
          })
        })
      }
    }
  })

  const [updateProblem] = useMutation(UPDATE_PROBLEM, {
    onError: () => {
      toast.error(t('update_problem_error'))
      setIsUploadingZip(false)
    },
    onCompleted: () => {
      setShouldSkipWarning(true)

      if (testcaseFieldRef?.current) {
        const zipUploadedTestcases =
          testcaseFieldRef.current.getZipUploadedTestcases()
        if (Object.keys(zipUploadedTestcases).length > 0) {
          setIsUploadingZip(true)
          return
        }
      }

      toast.success(t('update_problem_success'))
      router.push('/admin/problem')
      router.refresh()
    }
  })

  const [uploadTestcaseZipLegacy] = useMutation(UPLOAD_TESTCASE_ZIP_LEGACY, {
    onError: (error) => {
      toast.error(t('upload_zip_error', { message: error.message }))
      setIsUploadingZip(false)
    }
  })

  const validate = () => {
    const testcases = methods.getValues('testcases') ?? []
    if (!validateScoreWeight(testcases)) {
      setShowCautionModal(true)
      setMessage(t('scoring_ratios_incorrect'))
      return false
    }
    return true
  }

  const handleUpdate = async () => {
    if (pendingInput.current) {
      const regularTestcases = (methods.getValues('testcases') || []).filter(
        (tc) => !('isZipUploaded' in tc) || !tc.isZipUploaded
      )

      await updateProblem({
        variables: {
          input: {
            ...pendingInput.current,
            testcases: regularTestcases
          }
        }
      })

      if (testcaseFieldRef?.current) {
        const zipUploadedTestcases =
          testcaseFieldRef.current.getZipUploadedTestcases()

        if (Object.keys(zipUploadedTestcases).length > 0) {
          for (const [, zipData] of Object.entries(zipUploadedTestcases)) {
            const scoreWeights = zipData.testcases
              .sort((a, b) => a.index - b.index)
              .map((tc) => ({
                scoreWeight: tc.scoreWeight,
                scoreWeightNumerator: tc.scoreWeightNumerator,
                scoreWeightDenominator: tc.scoreWeightDenominator
              }))

            await uploadTestcaseZipLegacy({
              variables: {
                input: {
                  file: zipData.file,
                  problemId,
                  isHidden: zipData.isHidden,
                  scoreWeights
                }
              }
            })
          }

          toast.success(t('problem_update_success'))
          setIsUploadingZip(false)
          router.push('/admin/problem')
          router.refresh()
        }
      }
    }
  }

  const onSubmit = methods.handleSubmit(async (input: UpdateProblemInput) => {
    if (!validate()) {
      return
    }
    pendingInput.current = input
    if (initialValues.current) {
      const currentValues = methods.getValues()
      let scoreCalculationChanged = false

      if (
        JSON.stringify(currentValues.testcases) !==
        JSON.stringify(initialValues.current.testcases)
      ) {
        scoreCalculationChanged = true
      } else if (currentValues.timeLimit !== initialValues.current.timeLimit) {
        scoreCalculationChanged = true
      } else if (
        currentValues.memoryLimit !== initialValues.current.memoryLimit
      ) {
        scoreCalculationChanged = true
      }

      if (scoreCalculationChanged) {
        setShowScoreModal(true)
        return
      }
    }
    await handleUpdate()
  })

  return (
    <>
      <form className="flex w-[1004px] flex-col gap-6" onSubmit={onSubmit}>
        <FormProvider {...methods}>{children}</FormProvider>
      </form>
      <CautionDialog
        isOpen={showCautionModal}
        onClose={() => setShowCautionModal(false)}
        description={message}
      />
      <ScoreCautionDialog
        isOpen={showScoreModal}
        onCancel={() => setShowScoreModal(false)}
        onConfirm={async () => {
          await handleUpdate()
          setShowScoreModal(false)
        }}
        problemId={problemId}
      />
      <ZipUploadModal isOpen={isUploadingZip} />
    </>
  )
}
