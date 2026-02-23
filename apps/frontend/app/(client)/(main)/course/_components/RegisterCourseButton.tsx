'use client'

import { AlertModal } from '@/components/AlertModal'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import personFillIcon from '@/public/icons/person-fill.svg'
import plusCircleIcon from '@/public/icons/plus-circle.svg'
import type { Course } from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

export function RegisterCourseButton() {
  const { t } = useTranslate()
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationFailedTitle, setVerificationFailedTitle] = useState('')
  const [verificationFailedDescription, setVerificationFailedDescription] =
    useState('')
  const [invitationCode, setInvitationCode] = useState('')

  const [foundCourse, setFoundCourse] = useState<null | Course>(null)
  const queryClient = useQueryClient()

  const handleFindCourseByInvitation = async () => {
    try {
      const data = await safeFetcherWithAuth
        .get('course/invite', {
          searchParams: { invitation: invitationCode }
        })
        .json<Course>()
      setIsVerified(true)
      setIsVerifyDialogOpen(true)
      setIsRegisterDialogOpen(false)
      setFoundCourse(data)
    } catch (error) {
      if (isHttpError(error) && error.response.status === 404) {
        setVerificationFailedTitle(t('invalid_code_title'))
        setVerificationFailedDescription(t('invalid_code_persist_message'))
      } else {
        setVerificationFailedTitle(t('invalid_request_title'))
        setVerificationFailedDescription('')
      }
      setInvitationCode('')
      setIsVerified(false)
      setIsVerifyDialogOpen(true)
    }
  }

  const handleRegisterCourse = async () => {
    try {
      await safeFetcherWithAuth.post(`course/${foundCourse?.id}/join`, {
        searchParams: { invitation: invitationCode }
      })
      queryClient.invalidateQueries({ queryKey: ['joinedCourses'] })
      toast.success(t('successfully_registered_course'))
      setIsVerifyDialogOpen(false)
      setIsRegisterDialogOpen(false)
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setVerificationFailedTitle(t('already_requested_or_joined'))
        setVerificationFailedDescription(t('invalid_code_persist_message'))
      } else if (isHttpError(error) && error.response.status === 404) {
        setVerificationFailedTitle(t('group_not_found_title'))
        setVerificationFailedDescription(t('invalid_code_persist_message'))
      } else if (isHttpError(error) && error.response.status === 403) {
        setVerificationFailedTitle(t('not_authorized_title'))
        setVerificationFailedDescription(t('not_authorized_message'))
      } else {
        setVerificationFailedTitle(t('invalid_code_title'))
        setVerificationFailedDescription(t('invalid_code_persist_message'))
      }
      setIsVerified(false)
      setInvitationCode('')
      setIsVerifyDialogOpen(true)
    }
  }

  return (
    <>
      <Modal
        trigger={
          <Button
            variant="outline"
            className="border-primary flex h-8 w-[127px] items-center justify-center gap-2 rounded-full border hover:bg-[#EAF3FF]"
          >
            <Image src={plusCircleIcon} alt="plusIcon" />
            <span className="text-primary text-lg font-semibold">
              {t('register_button')}
            </span>
          </Button>
        }
        open={isRegisterDialogOpen}
        size="sm"
        title={t('course_register_title')}
        primaryButton={{
          text: t('register_button'),
          onClick: handleFindCourseByInvitation
        }}
        inputProps={{
          type: 'text',
          placeholder: t('invitation_code_placeholder'),
          value: invitationCode,
          onChange: (value) => setInvitationCode(value)
        }}
        type="input"
      />
      <AlertModal
        open={isVerifyDialogOpen && isVerified}
        onOpenChange={setIsVerifyDialogOpen}
        title={t('verified_title')}
        description={t('confirm_registration_message')}
        onClose={() => setIsVerifyDialogOpen(false)}
        primaryButton={{
          text: t('register_button'),
          onClick: handleRegisterCourse
        }}
        type="confirm"
        showIcon={false}
      >
        <div
          key="course-info"
          className="flex w-full flex-col gap-2 rounded-[10px] bg-[#F2F6F7] px-6 py-4"
        >
          <p className="text-primary text-base font-semibold">
            [{foundCourse?.courseInfo?.courseNum}-
            {foundCourse?.courseInfo?.classNum}] {foundCourse?.groupName}
          </p>
          <div className="flex gap-2">
            <Image
              src={personFillIcon}
              alt="person-fill"
              width={16}
              height={16}
            />
            <p className="text-sm font-medium text-[#8A8A8A]">
              Prof. {foundCourse?.courseInfo?.professor}
            </p>
          </div>
        </div>
      </AlertModal>
      <Modal
        open={isVerifyDialogOpen && !isVerified}
        onOpenChange={setIsVerifyDialogOpen}
        size="sm"
        title={verificationFailedTitle}
        footerDescription={verificationFailedDescription}
        onClose={() => setIsVerifyDialogOpen(false)}
        type="warning"
      />
    </>
  )
}
