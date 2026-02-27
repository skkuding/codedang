'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { announcementSchema } from '@/app/admin/contest/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'
import { CREATE_CONTEST_ANNOUNCEMENT } from '@/graphql/contest/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import checkBoxGrayIcon from '@/public/icons/checkbox_gray.svg'
import checkBoxWhiteIcon from '@/public/icons/checkbox_white.svg'
import infoBlueIcon from '@/public/icons/icon-info-blue.svg'
import { useQuery, useMutation } from '@apollo/client'
import type { CreateAnnouncementInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { ProblemDropdown } from './ProblemDropdown'
import { ProblemSelector } from './ProblemSelector'

export function CreateContestAnnouncement({
  contestId
}: {
  contestId: number
}) {
  const { t } = useTranslate()
  const txtMaxLength = 400
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { data: problemData, loading: isLoadingProblems } = useQuery(
    GET_CONTEST_PROBLEMS,
    {
      variables: { contestId }
    }
  )

  const [createAnnouncement] = useMutation(CREATE_CONTEST_ANNOUNCEMENT)

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    resetField,
    formState: { errors }
  } = useForm<CreateAnnouncementInput>({
    resolver: valibotResolver(announcementSchema)
  })

  const problemOptions =
    problemData?.getContestProblems?.map((problem) => ({
      order: problem.order,
      title: problem.problem.title,
      label: `${problem.problem.title}`
    })) || []

  const isContestStarted = true

  const txtlength = (watch('content') || '').replace(/\s/g, '').length

  const onSubmitAnnouncement: SubmitHandler<CreateAnnouncementInput> = async (
    data
  ) => {
    try {
      await createAnnouncement({
        variables: {
          contestId,
          input: {
            content: data.content,
            problemOrder: data.problemOrder
          }
        }
      })
      resetField('content')
      resetField('problemOrder')
      toast.success(t('create_announcement_success'))
    } catch (error) {
      console.error('Error with creating Announcement:', error)
      toast.error(t('unexpected_error_occurred'))
    }
  }

  const handleProblemChange = (problemOrder: number | null) => {
    setValue('problemOrder', problemOrder, {
      shouldValidate: true
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitAnnouncement)}>
      <p className="mb-5 text-2xl font-semibold leading-[33.6px] tracking-[-0.72px] text-black">
        {t('post_new_announcement')}
      </p>
      <div className="flex w-full flex-col gap-[6px]">
        <ProblemSelector
          watch={watch}
          problemOptions={problemOptions}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
        />
        <ProblemDropdown
          watch={watch}
          setValue={setValue}
          problemOptions={problemOptions}
          isOpen={isDropdownOpen && !isLoadingProblems}
          onClose={() => setIsDropdownOpen(false)}
          isContestStarted={isContestStarted}
          onValueChange={handleProblemChange}
        />
        {errors.problemOrder && (
          <ErrorMessage message={errors.problemOrder.message} />
        )}
        <div className="relative mt-1">
          <Textarea
            {...register('content')}
            placeholder={t('enter_your_announcement')}
            maxLength={txtMaxLength}
            className={cn(
              'border-line min-h-[280px] resize-none rounded-[12px] border bg-white px-[30px] py-6 text-base font-normal leading-[24px] tracking-[-0.48px] text-black',
              'placeholder:text-color-neutral-90 placeholder:text-base placeholder:font-normal placeholder:leading-[24px] placeholder:tracking-[-0.48px] focus-visible:ring-0'
            )}
          />
          {errors.content && <ErrorMessage />}
          <p className="text-color-neutral-80 absolute bottom-[30px] right-[30px] text-base font-medium leading-[22.4px] tracking-[-0.48px]">
            {txtlength}/400
          </p>
        </div>
        <div className="mb-[14px] flex items-center justify-start">
          <Image src={infoBlueIcon} alt="infoblue" width={16} />
          <p className="text-primary ml-[2px] text-xs font-normal leading-[16.8px] tracking-[-0.36px]">
            {t('posted_announcement_cannot_be_edited')}
          </p>
        </div>
        <Button
          type="submit"
          disabled={txtlength <= 0}
          className={`mb-[100px] h-[46px] w-full rounded-[1000px] border px-[22px] pb-[11px] pt-[10px] text-lg font-medium leading-[25.2px] tracking-[-0.54px] ${txtlength > 0 ? 'bg-primary text-white' : 'bg-color-neutral-95 text-color-neutral-70'}`}
        >
          {txtlength > 0 ? (
            <Image src={checkBoxWhiteIcon} alt="checkbox-white" width={20} />
          ) : (
            <Image src={checkBoxGrayIcon} alt="checkbox-gray" width={20} />
          )}
          <span className="ml-[6px]">{t('post')}</span>
        </Button>
      </div>
    </form>
  )
}
