'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import { CREATE_PROBLEM } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateProblemInput } from '@generated/graphql'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { validateScoreWeight } from '../../_libs/utils'

interface CreateProblemFormProps {
  methods: UseFormReturn<CreateProblemInput>
  children: ReactNode
}

export function CreateProblemForm({
  methods,
  children
}: CreateProblemFormProps) {
  const [message, setMessage] = useState('')
  const [showCautionModal, setShowCautionModal] = useState(false)

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  const [createProblem] = useMutation(CREATE_PROBLEM, {
    onError: () => {
      toast.error('Failed to create problem')
    },
    onCompleted: () => {
      setShouldSkipWarning(true)
      toast.success('Problem created successfully')
      router.push('/admin/problem')
      router.refresh()
    }
  })

  const validate = () => {
    const testcases = methods.getValues('testcases')
    if (!validateScoreWeight(testcases)) {
      setShowCautionModal(true)
      setMessage(
        'The scoring ratios have not been specified correctly.\nPlease review and correct them.'
      )
      return false
    }
    return true
  }

  const onSubmit = methods.handleSubmit(async () => {
    if (!validate()) {
      return
    }
    const input = methods.getValues()
    await createProblem({
      variables: {
        input
      }
    })
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
    </>
  )
}
