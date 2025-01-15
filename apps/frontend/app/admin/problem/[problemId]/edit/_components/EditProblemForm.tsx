'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import { UPDATE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_PROBLEM } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { Template, Testcase, UpdateProblemInput } from '@generated/graphql'
import { useRouter } from 'next/navigation'
import { useRef, useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { CautionDialog } from '../../../_components/CautionDialog'
import { validateScoreWeight } from '../../../_libs/utils'
import { ScoreCautionDialog } from './ScoreCautionDialog'

interface EditProblemFormProps {
  problemId: number
  children: ReactNode
  methods: UseFormReturn<UpdateProblemInput>
}

export default function EditProblemForm({
  problemId,
  children,
  methods
}: EditProblemFormProps) {
  const [message, setMessage] = useState('')
  const [showCautionModal, setShowCautionModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)

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
      groupId: 1,
      id: Number(problemId)
    },
    onCompleted: (problemData) => {
      const data = problemData.getProblem

      const initialFormValues = {
        testcases: data.testcase,
        timeLimit: data.timeLimit,
        memoryLimit: data.memoryLimit
      }
      initialValues.current = initialFormValues

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
        inputDescription: data.inputDescription || '<p>Change this</p>',
        outputDescription: data.outputDescription || '<p>Change this</p>',
        testcases: data.testcase,
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
    }
  })

  const [updateProblem] = useMutation(UPDATE_PROBLEM, {
    onError: () => {
      toast.error('Failed to update problem')
    },
    onCompleted: () => {
      setShouldSkipWarning(true)
      toast.success('Problem updated successfully')
      router.push('/admin/problem')
      router.refresh()
    }
  })

  const validate = () => {
    const testcases = methods.getValues('testcases') as Testcase[]
    if (!validateScoreWeight(testcases)) {
      setShowCautionModal(true)
      setMessage(
        'The scoring ratios have not been specified correctly.\nPlease review and correct them.'
      )
      return false
    }
    return true
  }

  const handleUpdate = async () => {
    if (pendingInput.current) {
      await updateProblem({
        variables: {
          groupId: 1,
          input: pendingInput.current
        }
      })
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
      <form className="flex w-[760px] flex-col gap-6" onSubmit={onSubmit}>
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
    </>
  )
}
