'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Separator } from '@/components/shadcn/separator'
import { Toggle } from '@/components/shadcn/toggle'
import { CREATE_COURSE } from '@/graphql/course/mutation'
import { INVITE_USER, ISSUE_INVITATION } from '@/graphql/user/mutation'
import { fetcherWithAuth } from '@/libs/utils'
import type { MemberRole, SemesterSeason } from '@/types/type'
import { useMutation } from '@apollo/client'
import { Role, type CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FiPlusCircle, FiX } from 'react-icons/fi'
import { IoCopyOutline } from 'react-icons/io5'
import { MdOutlineEmail } from 'react-icons/md'
import { RxReload } from 'react-icons/rx'
import { toast } from 'sonner'
import { findUserSchema, inviteUserSchema } from '../_libs/schema'

/**
 * 어드민 테이블의 삭제 버튼 컴포넌트
 * @desctiption 선택된 행들을 삭제하는 기능
 * @param target
 * 삭제 대상 (problem or contest)
 * @param deleteTarget
 * 아이디를 전달받아 삭제 요청하는 함수
 * @param getCanDelete
 * 선택된 행들이 삭제 가능한지를 반환하는 함수
 * @param onSuccess
 * 삭제 성공 시 호출되는 함수
 * @param className
 * tailwind 클래스명
 */

interface InviteButtonProps<TData extends { id: number }, TPromise> {
  onSuccess: () => void
  params: {
    courseId: number
  }
}

export function InviteButton<TData extends { id: number }, TPromise>({
  onSuccess,
  params
}: InviteButtonProps<TData, TPromise>) {
  const { courseId } = params
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setIsAlertDialogOpen(isOpen)
    if (!isOpen) {
      onSuccess() // 다이얼로그가 닫힐 때 실행
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsAlertDialogOpen(true)}
        className="flex gap-2"
      >
        <FiPlusCircle />
        Invite
      </Button>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="p-8">
          <AlertDialogCancel className="absolute right-4 top-4 border-none">
            <FiX className="h-5 w-5" />
          </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>Invite</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3">
            <InviteManually courseId={courseId} />
            <Separator />
            <InviteByCode courseId={courseId} />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface InviteUserInput {
  groupId: number
  userId: number
  isGroupLeader: boolean
}

interface FindUserInput {
  email: string
}

interface InviteManuallyProps {
  courseId: number
}

interface UserInfo {
  userName: string
  id: number
}

function InviteManually({ courseId }: InviteManuallyProps) {
  const roles: MemberRole[] = ['Instructor', 'Student']
  const [userId, setUserId] = useState(0)
  const [invitedList, setInvitedList] = useState<string[]>([''])

  useEffect(() => {
    if (userId) {
      inviteHandleSubmit(onInvite)()
    }
  }, [userId])

  const [inviteUser] = useMutation(INVITE_USER)
  const inviteTarget = (
    groupId: number,
    isGroupLeader: boolean,
    userId: number
  ) => {
    return inviteUser({
      variables: {
        groupId,
        isGroupLeader,
        userId
      }
    })
  }

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    const res = await fetcherWithAuth('user/email', {
      searchParams: {
        email: data.email
      }
    })
    if (res.ok) {
      const userInfo: UserInfo = await res.json()
      setUserId(userInfo.id)
    } else {
      toast.error('Failed to find user')
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = async (data) => {
    console.log('onInvite')
    const updatePromise = inviteTarget(
      Number(courseId),
      data.isGroupLeader,
      userId
    )

    try {
      const result = await updatePromise
      setInvitedList([...invitedList, result.data?.inviteUser.user.email ?? ''])
      toast.success('Invited successfully!')
    } catch {
      toast.error(`Failed to invite`)
    }
  }

  // email검증
  const {
    register: findRegister,
    handleSubmit: findHandleSubmit,
    formState: { errors: findErrors }
  } = useForm<FindUserInput>({
    resolver: valibotResolver(findUserSchema)
  })

  // 실제invite
  const {
    watch: inviteWatch,
    handleSubmit: inviteHandleSubmit,
    setValue: inviteSetValue,
    formState: { errors: inviteErrors }
  } = useForm<InviteUserInput>({
    resolver: valibotResolver(inviteUserSchema),
    defaultValues: {
      userId,
      groupId: courseId,
      isGroupLeader: false
    }
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        findHandleSubmit(onFind)()
      }}
      aria-label="Invite user"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        <span className="font-bold">Invite Manually</span>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="flex justify-between">
              <div className="flex items-center border border-gray-300 px-2">
                <MdOutlineEmail className="h-8 w-12 text-gray-400" />
                <Input
                  id="email"
                  {...findRegister('email')}
                  placeholder="Email Address"
                  className="border-none"
                />

                <Select
                  value={
                    inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'
                  }
                  onValueChange={(value) => {
                    inviteSetValue('isGroupLeader', value === 'Instructor')
                  }}
                >
                  <SelectTrigger className="border-none text-gray-500">
                    <SelectValue>
                      {inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-none bg-white shadow-md">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {invitedList.length > 0 && (
              <div className="flex flex-col rounded-md border border-gray-300">
                {invitedList.map((user) => (
                  <span key={user} className="text-gray-500">
                    {user}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary-strong">
            Invite
          </Button>
        </div>
        {findErrors.email && (
          <ErrorMessage message={findErrors.email.message} />
        )}
        {inviteErrors.groupId && (
          <ErrorMessage message={inviteErrors.groupId.message} />
        )}
        {inviteErrors.userId && (
          <ErrorMessage message={inviteErrors.userId.message} />
        )}
        {inviteErrors.isGroupLeader && (
          <ErrorMessage message={inviteErrors.isGroupLeader.message} />
        )}
      </div>
    </form>
  )
}

interface InviteByCodeProps {
  courseId: number
}

interface InvitationCodeInput {
  issueInvitation: string
}

function InviteByCode({ courseId }: InviteByCodeProps) {
  const [issueInvitation] = useMutation(ISSUE_INVITATION)
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid }
  } = useForm<InvitationCodeInput>()
  const handleUpdateButtonClick = async () => {
    try {
      const result = await issueInvitation({ variables: { groupId: courseId } })

      if (result.data) {
        const data = result.data.issueInvitation

        console.log('Issue Invitation:', data)
        // setWeek(data.courseInfo?.week ?? 0)
        reset({
          issueInvitation: data
        })
      }
    } catch (error) {
      console.error('Issue invitation error:', error)
    }
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleUpdateButtonClick()
      }}
      aria-label="Invite user"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        <span className="font-bold">Invite by Invitation Code</span>
        <div className="flex justify-between">
          <Input
            id="issueInvitation"
            className="w-[194px]"
            {...register('issueInvitation')}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-strong px-6"
            >
              <RxReload />
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary-strong px-6"
              onClick={() => {
                const invitationCode = getValues('issueInvitation') // 현재 입력된 값 가져오기
                console.log(invitationCode)
                navigator.clipboard.writeText(invitationCode) // 클립보드에 복사
              }}
            >
              <IoCopyOutline />
            </Button>
          </div>
          {/* <Toggle
            size="sm"
            pressed={editor?.isActive('bold')}
            onPressedChange={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-[14px] w-[14px]" />
          </Toggle> */}
        </div>
        {/* {findErrors.email && (
          <ErrorMessage message={findErrors.email.message} />
        )} */}
      </div>
    </form>
  )
}
