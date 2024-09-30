'use client'

import { createSchema } from '@/app/admin/problem/utils'
import { Level, type CreateProblemInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { CautionDialog } from '../../_components/CautionDialog'
import { validateScoreWeight } from '../../_libs/utils'
import CreateProblemAlertDialog from './CreateProblemAlertDialog'

interface CreateProblemFormProps {
  children: ReactNode
}

export default function CreateProblemForm({
  children
}: CreateProblemFormProps) {
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

  const [message, setMessage] = useState('')
  const [showCautionModal, setShowCautionModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const onSubmit = methods.handleSubmit(() => {
    if (!validate()) return
    setShowCreateModal(true)
  })

  return (
    <>
      <form className="flex w-[760px] flex-col gap-6" onSubmit={onSubmit}>
        <FormProvider {...methods}>
          {children}
          <CreateProblemAlertDialog
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        </FormProvider>
      </form>
      <CautionDialog
        isOpen={showCautionModal}
        onClose={() => setShowCautionModal(false)}
        description={message}
      />
    </>
  )
}
