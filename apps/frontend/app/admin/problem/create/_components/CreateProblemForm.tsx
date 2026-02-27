'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  CREATE_PROBLEM,
  UPLOAD_TESTCASE_ZIP_LEGACY
} from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateProblemInput } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { TestcaseFieldRef } from '../../_components/TestcaseField'
import { ZipUploadModal } from '../../_components/ZipUploadModal'
import { validateScoreWeight } from '../../_libs/utils'

interface CreateProblemFormProps {
  methods: UseFormReturn<CreateProblemInput>
  children: ReactNode
  testcaseFieldRef?: React.RefObject<TestcaseFieldRef | null>
}

export function CreateProblemForm({
  methods,
  children,
  testcaseFieldRef
}: CreateProblemFormProps) {
  const { t } = useTranslate()
  const [message, setMessage] = useState('')
  const [showCautionModal, setShowCautionModal] = useState(false)
  const [isUploadingZip, setIsUploadingZip] = useState(false)

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  const [createProblem] = useMutation(CREATE_PROBLEM, {
    onError: () => {
      toast.error(t('failed_to_create_problem'))
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

      toast.success(t('problem_created_successfully'))
      router.push('/admin/problem')
      router.refresh()
    }
  })

  const [uploadTestcaseZipLegacy] = useMutation(UPLOAD_TESTCASE_ZIP_LEGACY, {
    onError: (error) => {
      toast.error(
        t('failed_to_upload_testcase_zip', { message: error.message })
      )
      setIsUploadingZip(false)
    },
    onCompleted: () => {
      // ZIP 업로드 완료 (진행률 추적 불필요)
    }
  })

  const validate = () => {
    const testcases = methods.getValues('testcases')
    if (!validateScoreWeight(testcases)) {
      setShowCautionModal(true)
      setMessage(t('scoring_ratios_not_specified'))
      return false
    }
    return true
  }

  const onSubmit = methods.handleSubmit(async () => {
    if (!validate()) {
      return
    }

    const regularTestcases = (methods.getValues('testcases') || []).filter(
      (tc) => !('isZipUploaded' in tc) || !tc.isZipUploaded
    )

    const input = {
      ...methods.getValues(),
      testcases: regularTestcases
    }

    const result = await createProblem({
      variables: {
        input
      }
    })

    const problemId = result.data?.createProblem?.id
    if (problemId && testcaseFieldRef?.current) {
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
                problemId: Number(problemId),
                isHidden: zipData.isHidden,
                scoreWeights
              }
            }
          })
        }

        toast.success(t('problem_created_successfully'))
        setIsUploadingZip(false)
        router.push('/admin/problem')
        router.refresh()
      }
    }
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
      <ZipUploadModal isOpen={isUploadingZip} />
    </>
  )
}
