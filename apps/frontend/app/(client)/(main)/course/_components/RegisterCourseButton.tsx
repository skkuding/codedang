'use client'

import { Button } from '@/components/shadcn/button'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import personFillIcon from '@/public/icons/person-fill.svg'
import plusCircleIcon from '@/public/icons/plus-circle.svg'
import type { Course } from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '../../_components/Modal'

export function RegisterCourseButton() {
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
        setVerificationFailedTitle('Invalid Code')
        setVerificationFailedDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      } else {
        setVerificationFailedTitle('Invalid Request')
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
      toast.success('Successfully registered course.')
      setIsVerifyDialogOpen(false)
      setIsRegisterDialogOpen(false)
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setVerificationFailedTitle('Already requested or joined the group')
        setVerificationFailedDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      } else if (isHttpError(error) && error.response.status === 404) {
        setVerificationFailedTitle('Group not found')
        setVerificationFailedDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      } else if (isHttpError(error) && error.response.status === 403) {
        setVerificationFailedTitle('Not authorized for this course')
        setVerificationFailedDescription(
          'The instructor of this course has not approved the enrollment for this student ID. If the issue persists, please contact the instructor or administrator.'
        )
      } else {
        setVerificationFailedTitle('Invalid Code')
        setVerificationFailedDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      }
      setIsVerified(false)
      setInvitationCode('')
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsRegisterDialogOpen(true)}
        className="border-primary flex h-8 w-[127px] items-center justify-center gap-2 rounded-full border hover:bg-[#EAF3FF]"
      >
        <Image src={plusCircleIcon} alt="plusIcon" />
        <span className="text-primary text-lg font-semibold">Register</span>
      </Button>
      <Modal
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
        size="small"
        title="Course Register"
        onClose={() => setIsRegisterDialogOpen(false)}
        primaryButtonText="Register"
        primaryButtonAction={handleFindCourseByInvitation}
        type="input"
        inputValue={invitationCode}
        setInput={setInvitationCode}
        inputType="text"
        inputPlaceholder="Invitation Code"
      />
      <Modal
        open={isVerifyDialogOpen && isVerified}
        onOpenChange={setIsVerifyDialogOpen}
        size="small"
        title="Verified"
        description="Are you sure you want to register this course?"
        onClose={() => setIsVerifyDialogOpen(false)}
        primaryButtonText="Register"
        primaryButtonAction={handleRegisterCourse}
        secondaryButtonText="Cancel"
        secondaryButtonAction={() => setIsVerifyDialogOpen(false)}
        type="confirm"
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
      </Modal>
      <Modal
        open={isVerifyDialogOpen && !isVerified}
        onOpenChange={setIsVerifyDialogOpen}
        size="small"
        title={verificationFailedTitle}
        description={verificationFailedDescription}
        onClose={() => setIsVerifyDialogOpen(false)}
        type="warning"
      />
    </>
  )
}
