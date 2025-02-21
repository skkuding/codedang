'use client'

import { CREATE_NOTICE } from '@/graphql/notice/mutation'
import { useMutation } from '@apollo/client'
import type { CreateNoticeInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createSchema } from '../_libs/schemas'

interface CreateNoticeFormProps {
  children: ReactNode
}

export function CreateNoticeForm({ children }: CreateNoticeFormProps) {
  const methods = useForm<CreateNoticeInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      title: '',
      content: '',
      isFixed: false,
      isVisible: true
    }
  })
  const router = useRouter()

  const [createNotice] = useMutation(CREATE_NOTICE, {
    onError: () => {
      toast.error('Failed to create problem')
    },
    onCompleted: (data) => {
      const noticeId = data.createNotice.id
      toast.success('Notice created successfully')
      router.push(`/admin/notice/${noticeId}`)
      router.refresh()
    }
  })

  const onSubmit = methods.handleSubmit(async () => {
    const noticeInput = methods.getValues()
    await createNotice({
      variables: {
        groupId: 1,
        noticeInput
      }
    })
  })

  return (
    <form className="flex w-[760px] flex-col gap-6" onSubmit={onSubmit}>
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}
