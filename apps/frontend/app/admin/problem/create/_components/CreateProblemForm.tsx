'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import { createSchema } from '@/app/admin/problem/_libs/schemas'
import { CREATE_PROBLEM } from '@/graphql/problem/mutations'
import { useSession } from '@/libs/hooks/useSession'
import { useMutation } from '@apollo/client'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CautionDialog } from '../../_components/CautionDialog'
import { validateScoreWeight } from '../../_libs/utils'

interface CreateProblemFormProps {
  children: ReactNode
}

export function CreateProblemForm({ children }: CreateProblemFormProps) {
  const session = useSession()
  const isAdmin = session?.user?.role !== 'User'

  const methods = useForm<CreateProblemInput>({
    resolver: valibotResolver(createSchema),
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
      isVisible: isAdmin
    }
  })

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
      <form className="flex w-[760px] flex-col gap-6" onSubmit={onSubmit}>
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
