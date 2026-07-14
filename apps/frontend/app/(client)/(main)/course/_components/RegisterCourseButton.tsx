'use client'

import { AlertModal } from '@/components/AlertModal'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import PersonFillIcon from '@/public/icons/person-fill.svg'
import type { Course } from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

interface JoinErrorBody {
  reason?: 'WHITELIST_VIOLATION' | 'ENROLLMENT_LOCKED'
  attemptsRemaining?: number
}

const LOCKED_TITLE = 'Verification Failed'
const LOCKED_DESCRIPTION =
  "We couldn't match your Student ID to this course's roster. Access is not available. If you believe this is a mistake, please contact the instructor or administrator."

export function RegisterCourseButton() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationFailedTitle, setVerificationFailedTitle] = useState('')
  const [verificationFailedDescription, setVerificationFailedDescription] =
    useState('')
  const [invitationCode, setInvitationCode] = useState('')

  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false)
  const [manualStudentId, setManualStudentId] = useState('')
  const [enrollmentNotice, setEnrollmentNotice] = useState('')

  const [foundCourse, setFoundCourse] = useState<null | Course>(null)
  const queryClient = useQueryClient()

  const showFailure = (title: string, description: string) => {
    setVerificationFailedTitle(title)
    setVerificationFailedDescription(description)
    setIsVerified(false)
    setInvitationCode('')
    setIsVerifyDialogOpen(true)
  }

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
        showFailure(
          'Invalid Code',
          'If the issue persists, please contact the instructor or administrator.'
        )
      } else {
        showFailure('Invalid Request', '')
      }
    }
  }

  const onJoinSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['joinedCourses'] })
    toast.success('Successfully registered course.')
    setIsVerifyDialogOpen(false)
    setIsRegisterDialogOpen(false)
    setIsEnrollmentModalOpen(false)
  }

  /** Falls back to the pre-existing generic error copy when the 403 isn't a
   *  whitelist-related one (or the body couldn't be read). */
  const handleGenericJoinError = (error: unknown) => {
    if (isHttpError(error) && error.response.status === 409) {
      showFailure(
        'Already requested or joined the group',
        'If the issue persists, please contact the instructor or administrator.'
      )
    } else if (isHttpError(error) && error.response.status === 404) {
      showFailure(
        'Group not found',
        'If the issue persists, please contact the instructor or administrator.'
      )
    } else if (isHttpError(error) && error.response.status === 403) {
      showFailure(
        'Not authorized for this course',
        'The instructor of this course has not approved the enrollment for this student ID. If the issue persists, please contact the instructor or administrator.'
      )
    } else {
      showFailure(
        'Invalid Code',
        'If the issue persists, please contact the instructor or administrator.'
      )
    }
  }

  const joinCourse = (stage: 'auto' | 'manual', studentId?: string) =>
    safeFetcherWithAuth.post(`course/${foundCourse?.id}/join`, {
      searchParams: {
        invitation: invitationCode,
        stage,
        ...(studentId ? { studentId } : {})
      }
    })

  const readJoinErrorBody = async (
    error: unknown
  ): Promise<JoinErrorBody | null> => {
    if (!isHttpError(error) || error.response.status !== 403) {
      return null
    }
    try {
      return await error.response.json()
    } catch {
      return null
    }
  }

  const handleRegisterCourse = async () => {
    try {
      await joinCourse('auto')
      onJoinSuccess()
    } catch (error) {
      const body = await readJoinErrorBody(error)
      if (body?.reason === 'ENROLLMENT_LOCKED') {
        showFailure(LOCKED_TITLE, LOCKED_DESCRIPTION)
        return
      }
      if (body?.reason === 'WHITELIST_VIOLATION') {
        setIsVerifyDialogOpen(false)
        setManualStudentId('')
        setEnrollmentNotice('')
        setIsEnrollmentModalOpen(true)
        return
      }
      handleGenericJoinError(error)
    }
  }

  const handleVerifyEnrollment = async () => {
    try {
      await joinCourse('manual', manualStudentId)
      onJoinSuccess()
    } catch (error) {
      const body = await readJoinErrorBody(error)
      if (body?.reason === 'ENROLLMENT_LOCKED') {
        setIsEnrollmentModalOpen(false)
        showFailure(LOCKED_TITLE, LOCKED_DESCRIPTION)
        return
      }
      if (body?.reason === 'WHITELIST_VIOLATION') {
        const remaining = body.attemptsRemaining
        setEnrollmentNotice(
          remaining === 1
            ? "Student ID not found on this course's roster. This is your last attempt before access is locked."
            : `Student ID not found on this course's roster. ${remaining} attempts remaining.`
        )
        return
      }
      setIsEnrollmentModalOpen(false)
      handleGenericJoinError(error)
    }
  }

  return (
    <>
      <Modal
        trigger={
          <Button
            variant="outline"
            className="border-primary flex h-9 w-[90px] items-center justify-center rounded-full border hover:bg-[#EAF3FF]"
          >
            <span className="text-primary text-sm font-medium tracking-[-0.42px]">
              Register
            </span>
          </Button>
        }
        open={isRegisterDialogOpen}
        size="sm"
        title="Course Register"
        primaryButton={{
          text: 'Register',
          onClick: handleFindCourseByInvitation
        }}
        inputProps={{
          type: 'text',
          placeholder: 'Invitation Code',
          value: invitationCode,
          onChange: (value) => setInvitationCode(value)
        }}
        type="input"
      />
      <AlertModal
        open={isVerifyDialogOpen && isVerified}
        onOpenChange={setIsVerifyDialogOpen}
        title="Verified"
        description="Are you sure you want to register this course?"
        onClose={() => setIsVerifyDialogOpen(false)}
        primaryButton={{
          text: 'Register',
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
            <PersonFillIcon className="text-primary h-4" />
            <p className="text-sm font-medium text-[#8A8A8A]">
              Prof. {foundCourse?.courseInfo?.professor}
            </p>
          </div>
        </div>
      </AlertModal>
      <Modal
        open={isEnrollmentModalOpen}
        onOpenChange={setIsEnrollmentModalOpen}
        size="sm"
        title="Verify Your Enrollment"
        headerDescription="This course is restricted to registered students. Enter your Student ID to confirm you're on the roster."
        footerDescription={enrollmentNotice}
        primaryButton={{
          text: 'Verify & Enter',
          onClick: handleVerifyEnrollment
        }}
        inputProps={{
          type: 'text',
          placeholder: 'Student ID (e.g. 2024310001)',
          value: manualStudentId,
          onChange: (value) => setManualStudentId(value)
        }}
        type="input"
      />
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
