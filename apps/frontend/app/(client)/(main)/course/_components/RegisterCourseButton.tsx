'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { cn, isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import type { Course } from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface JoinErrorBody {
  reason?: 'WHITELIST_VIOLATION' | 'ENROLLMENT_LOCKED'
  attemptsRemaining?: number
}

const LOCKED_TITLE = 'Verification Failed'
const LOCKED_DESCRIPTION =
  "We couldn't match your Student ID to this course's roster. Access is not available. If you believe this is a mistake, please contact the instructor or administrator."

type Step = 'code' | 'verify' | 'blocked' | 'success'

const cardButtonClass =
  'w-full h-16 rounded-full border-none bg-[#4478f5] text-[19px] font-bold text-white shadow-[0_10px_22px_rgba(68,120,245,0.32)] transition-colors hover:bg-[#3a6cf0]'

const cardInputClass = (hasError: boolean) =>
  cn(
    'w-full h-[60px] rounded-[14px] border bg-white px-[22px] text-lg outline-none',
    hasError ? 'border-[#f0a3a3] animate-[shake_0.4s_ease]' : 'border-[#e3e3e8]'
  )

export function RegisterCourseButton() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState<Step>('code')

  const [invitationCode, setInvitationCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeShakeKey, setCodeShakeKey] = useState(0)

  const [foundCourseId, setFoundCourseId] = useState<number | null>(null)

  const [manualStudentId, setManualStudentId] = useState('')
  const [sidError, setSidError] = useState('')
  const [sidShakeKey, setSidShakeKey] = useState(0)

  const [blockedTitle, setBlockedTitle] = useState('')
  const [blockedDescription, setBlockedDescription] = useState('')

  const queryClient = useQueryClient()

  const resetState = () => {
    setStep('code')
    setInvitationCode('')
    setCodeError('')
    setFoundCourseId(null)
    setManualStudentId('')
    setSidError('')
  }

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetState()
    }
  }

  const onJoinSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['joinedCourses'] })
    setStep('success')
  }

  const showBlocked = (title: string, description: string) => {
    setBlockedTitle(title)
    setBlockedDescription(description)
    setStep('blocked')
  }

  /** Falls back to generic copy when the 403 isn't a whitelist-related one
   *  (or the body couldn't be read). */
  const handleGenericJoinError = (error: unknown) => {
    if (isHttpError(error) && error.response.status === 409) {
      showBlocked(
        'Already Requested or Joined',
        'If the issue persists, please contact the instructor or administrator.'
      )
    } else if (isHttpError(error) && error.response.status === 404) {
      showBlocked(
        'Group Not Found',
        'If the issue persists, please contact the instructor or administrator.'
      )
    } else if (isHttpError(error) && error.response.status === 403) {
      showBlocked(
        'Not Authorized for This Course',
        'The instructor of this course has not approved the enrollment for this student ID. If the issue persists, please contact the instructor or administrator.'
      )
    } else {
      showBlocked(
        'Invalid Request',
        'If the issue persists, please contact the instructor or administrator.'
      )
    }
  }

  const joinCourse = (
    groupId: number,
    stage: 'auto' | 'manual',
    studentId?: string
  ) =>
    safeFetcherWithAuth.post(`course/${groupId}/join`, {
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

  const handleSubmitCode = async () => {
    let groupId: number
    try {
      const data = await safeFetcherWithAuth
        .get('course/invite', { searchParams: { invitation: invitationCode } })
        .json<Course>()
      groupId = data.id
      setFoundCourseId(groupId)
      setCodeError('')
    } catch {
      setCodeError(
        "This invitation code doesn't exist. Please check and try again."
      )
      setCodeShakeKey((k) => k + 1)
      return
    }

    try {
      await joinCourse(groupId, 'auto')
      onJoinSuccess()
    } catch (error) {
      const body = await readJoinErrorBody(error)
      if (body?.reason === 'ENROLLMENT_LOCKED') {
        showBlocked(LOCKED_TITLE, LOCKED_DESCRIPTION)
        return
      }
      if (body?.reason === 'WHITELIST_VIOLATION') {
        setManualStudentId('')
        setSidError('')
        setStep('verify')
        return
      }
      handleGenericJoinError(error)
    }
  }

  const handleVerifyEnrollment = async () => {
    if (!foundCourseId) {
      return
    }
    try {
      await joinCourse(foundCourseId, 'manual', manualStudentId)
      onJoinSuccess()
    } catch (error) {
      const body = await readJoinErrorBody(error)
      if (body?.reason === 'ENROLLMENT_LOCKED') {
        showBlocked(LOCKED_TITLE, LOCKED_DESCRIPTION)
        return
      }
      if (body?.reason === 'WHITELIST_VIOLATION') {
        const remaining = body.attemptsRemaining
        setSidError(
          remaining === 1
            ? 'This is your last attempt before access is locked.'
            : `Please check your ID and try again. ${remaining} attempts remaining.`
        )
        setSidShakeKey((k) => k + 1)
        return
      }
      handleGenericJoinError(error)
    }
  }

  const onEnterKey =
    (submit: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        submit()
      }
    }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-primary flex h-9 w-[90px] items-center justify-center rounded-full border hover:bg-[#EAF3FF]"
        >
          <span className="text-primary text-sm font-medium tracking-[-0.42px]">
            Register
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="w-[calc(100%-40px)]! max-w-[640px]! gap-0! rounded-[22px]! border-[#ececf0]! p-0! shadow-[0_22px_60px_rgba(24,24,50,0.12)]! bg-white"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => handleOpenChange(false)}
          className="absolute right-[34px] top-[30px] cursor-pointer border-none bg-transparent p-1.5 text-2xl leading-none text-[#c2c2cc] hover:text-[#8b8b93]"
        >
          ✕
        </button>

        <div className="px-14 pb-14 pt-[52px]">
          {step === 'code' && (
            <div>
              <h1 className="m-0 text-center text-[32px] font-bold tracking-[-0.02em]">
                Course Register
              </h1>
              <input
                key={codeShakeKey}
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                onKeyDown={onEnterKey(handleSubmitCode)}
                placeholder="Invitation Code"
                className={cn(cardInputClass(Boolean(codeError)), 'mt-[38px]')}
              />
              {codeError && (
                <p className="mx-1 mt-3 text-sm text-[#ef4444]">{codeError}</p>
              )}
              <button
                type="button"
                onClick={handleSubmitCode}
                className={cn(cardButtonClass, 'mt-11')}
              >
                Register
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <h1 className="m-0 text-center text-[30px] font-bold tracking-[-0.02em]">
                Verify Your Enrollment
              </h1>
              <p className="mx-auto mt-[14px] max-w-[420px] text-center text-base leading-[1.55] text-[#a1a1aa]">
                This course is restricted to registered students. Enter your
                Student ID to confirm you&apos;re on the roster.
              </p>
              <input
                key={sidShakeKey}
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value)}
                onKeyDown={onEnterKey(handleVerifyEnrollment)}
                placeholder="Student ID (e.g. 2024310001)"
                inputMode="numeric"
                className={cn(
                  cardInputClass(Boolean(sidError)),
                  'mt-[34px] tabular-nums'
                )}
              />
              {sidError && (
                <div className="mt-[14px] flex items-start gap-[10px] rounded-xl border border-[#fddada] bg-[#fef2f2] px-4 py-3.5">
                  <span className="mt-px flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#ef4444] text-[13px] font-bold leading-none text-white">
                    !
                  </span>
                  <div>
                    <p className="m-0 text-[14.5px] font-semibold text-[#dc2626]">
                      Student ID not found on this course&apos;s roster.
                    </p>
                    <p className="mt-[5px] text-[13.5px] text-[#e07a7a]">
                      {sidError}
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleVerifyEnrollment}
                className={cn(cardButtonClass, 'mt-[30px]')}
              >
                Verify & Enter
              </button>
            </div>
          )}

          {step === 'blocked' && (
            <div className="text-center">
              <div className="mx-auto mt-1.5 flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#ef4444]">
                <span className="text-[38px] font-extrabold leading-none text-white">
                  !
                </span>
              </div>
              <h1 className="m-0 mt-[22px] text-[30px] font-bold tracking-[-0.02em]">
                {blockedTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-[440px] text-base leading-[1.6] text-[#a1a1aa]">
                {blockedDescription}
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="mx-auto mt-1.5 flex h-[66px] w-[66px] items-center justify-center rounded-full bg-[#22c55e]">
                <span className="text-[34px] leading-none text-white">✓</span>
              </div>
              <h1 className="m-0 mt-[22px] text-[30px] font-bold tracking-[-0.02em]">
                You&apos;re Enrolled
              </h1>
              <p className="mx-auto mt-4 max-w-[400px] text-base leading-[1.6] text-[#a1a1aa]">
                Your Student ID was verified against the roster. Welcome to the
                course.
              </p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className={cn(cardButtonClass, 'mt-[30px]')}
              >
                Go to course
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
