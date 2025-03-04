'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import infoIcon from '@/public/icons/info.svg'
import personFillIcon from '@/public/icons/person-fill.svg'
import plusCircleIcon from '@/public/icons/plus-circle.svg'
import type { Course } from '@/types/type'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function RegisterCourseButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="border-primary flex h-8 w-[127px] items-center justify-center gap-2 rounded-full border hover:bg-[#EAF3FF]"
      >
        <Image src={plusCircleIcon} alt="plusIcon" />
        <span className="text-primary text-lg font-semibold">Register</span>
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="h-[254px] w-[416px] px-10 py-[52px] sm:rounded-2xl"
          title="register course"
        >
          <DialogTitle className="text-center text-xl font-medium">
            Course Register
          </DialogTitle>
          <RegisterCourse />
        </DialogContent>
      </Dialog>
    </>
  )
}

function RegisterCourse() {
  const [isDialogOpened, setIsDialogOpened] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  return (
    <div className="flex flex-col items-center gap-7">
      <Input
        type="text"
        className="focus-visible:border-primary focus-visible:ring-0"
        placeholder="Invitation Code"
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value)}
      />
      <Button className="w-full" onClick={() => setIsDialogOpened(true)}>
        <span className="text-white">Register</span>
      </Button>
      <Dialog open={isDialogOpened} onOpenChange={setIsDialogOpened}>
        <DialogContent className="w-fit rounded-2xl p-0 px-0 py-6">
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <RegisterResult
            invitationCode={invitationCode}
            setInvitationCode={setInvitationCode}
            setIsDialogOpened={setIsDialogOpened}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RegisterResult({
  invitationCode,
  setInvitationCode,
  setIsDialogOpened
}: {
  invitationCode: string
  setInvitationCode: (value: string) => void
  setIsDialogOpened: (value: boolean) => void
}) {
  const [isVerified, setIsVerified] = useState(false)
  const [subTitle, setSubTitle] = useState('')
  const [description, setDescription] = useState('')
  const [foundCourse, setFoundCourse] = useState<null | Course>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleFindCourseByInvitation = async () => {
      try {
        const data = await safeFetcherWithAuth
          .get('course/invite', {
            searchParams: { invitation: invitationCode }
          })
          .json<Course>()
        setIsVerified(true)
        setFoundCourse(data)
      } catch (error) {
        if (isHttpError(error) && error.response.status === 404) {
          setSubTitle('Invalid Code')
          setDescription(
            'The instructor of this course has not approved the enrollment for this student ID. If the issue persists, please contact the instructor or administrator.'
          )
        } else {
          setSubTitle('Invalid Request')
          setDescription('')
        }
        setInvitationCode('')
      }
    }
    handleFindCourseByInvitation()
  }, [])

  const handleRegisterCourse = async () => {
    try {
      await safeFetcherWithAuth.post(`course/${foundCourse?.id}/join`, {
        searchParams: { invitation: invitationCode }
      })
      queryClient.invalidateQueries({ queryKey: ['joinedCourses'] })
      toast.success('Successfully registered course.')
      setIsDialogOpened(false)
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setSubTitle('Already requested or joined the group')
        setDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      } else if (isHttpError(error) && error.response.status === 404) {
        setSubTitle('Group not found')
        setDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      } else if (isHttpError(error) && error.response.status === 403) {
        setSubTitle('Not authorized for this course')
        setDescription(
          'The instructor of this course has not approved the enrollment for this student ID. If the issue persists, please contact the instructor or administrator.'
        )
      } else {
        setSubTitle('Invalid Code')
        setDescription(
          'If the issue persists, please contact the instructor or administrator.'
        )
      }
      setIsVerified(false)
      setInvitationCode('')
    }
  }

  return (
    <div className="flex w-fit justify-center">
      {isVerified ? (
        <div className="flex w-full flex-col gap-3 px-10 pb-6">
          <p className="text-center text-xl font-medium">Verified</p>
          <div className="flex w-full flex-col gap-2 rounded-[10px] bg-[#F2F6F7] px-6 py-4">
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
                Prof. {foundCourse?.courseInfo.professor}
              </p>
            </div>
          </div>

          <p className="text-sm font-normal text-[#737373]">
            Are you sure you want to register this course?
          </p>

          <div className="flex w-full justify-between">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpened(false)}
              className="h-[44px] w-[166px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegisterCourse}
              className="h-[44px] w-[166px]"
            >
              Register
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-[512px] flex-col items-center justify-center">
          <Image
            src={infoIcon}
            alt="info"
            width={50}
            height={50}
            className="mb-3"
          />
          <div className="flex flex-col gap-3 text-center">
            <p className="text-xl font-medium">{subTitle}</p>
            <span className="w-[436px] text-xs font-normal text-[#737373]">
              {description}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
