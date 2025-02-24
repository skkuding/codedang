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
import { CREATE_COURSE } from '@/graphql/course/mutation'
import { INVITE_USER } from '@/graphql/user/mutation'
import { fetcherWithAuth } from '@/libs/utils'
import type { MemberRole, SemesterSeason } from '@/types/type'
import { useMutation } from '@apollo/client'
import { Role, type CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FiPlusCircle } from 'react-icons/fi'
import { MdOutlineEmail } from 'react-icons/md'
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
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Invite</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col">
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
  userId: number
}

function InviteManually({ courseId }: InviteManuallyProps) {
  // email검증
  const {
    register: findRegister,
    handleSubmit: findHandleSubmit,
    formState: { errors: findErrors, isValid: findIsValid }
  } = useForm<FindUserInput>({
    resolver: valibotResolver(findUserSchema)
  })

  // 실제invite
  const {
    watch: inviteWatch,
    handleSubmit: inviteHandleSubmit,
    setValue: inviteSetValue,
    formState: { errors: inviteErrors, isValid: inviteIsValid }
  } = useForm<InviteUserInput>({
    resolver: valibotResolver(inviteUserSchema),
    defaultValues: {
      isGroupLeader: false
    }
  })

  const roles: MemberRole[] = ['Instructor', 'Student']
  const [userId, setUserId] = useState(0)
  const [invitedList, setInvitedList] = useState<string[]>([])

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

  const handleSubmit = () => {
    findHandleSubmit(onFind)
    inviteHandleSubmit(onInvite)
  }

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    const res = await fetcherWithAuth('user/email', {
      searchParams: {
        email: data.email
      }
    })
    if (res.ok) {
      const userInfo: UserInfo = await res.json()
      setUserId(userInfo.userId)
      console.log(userId)
    } else {
      toast.error('Failed to find user')
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = async (data) => {
    const updatePromise = inviteTarget(
      Number(courseId),
      data.isGroupLeader,
      userId
    )

    try {
      await updatePromise
      setInvitedList([...invitedList, data.userId.toString()])
      toast.success('Invited successfully!')
    } catch {
      toast.error(`Failed to invite`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Invite user"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        <span className="font-bold">Invite Manually</span>
        <div className="flex justify-between">
          <div className="flex border-black p-1">
            <MdOutlineEmail />
            <Input
              id="email"
              {...findRegister('email')}
              placeholder="Email Address"
            />

            <Select
              value={inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'}
              onValueChange={(value) => {
                inviteSetValue('isGroupLeader', value === 'Instructor')
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  {inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary-strong">
            Invite
          </Button>
        </div>
        <div>
          {invitedList.map((user) => (
            <span key={user}>{user}</span>
          ))}
        </div>
        {findErrors.email && <ErrorMessage />}
      </div>
    </form>
  )
}

interface InviteByCodeProps {
  courseId: number
}
function InviteByCode({ courseId }: InviteByCodeProps) {
  // return (
  //   <form
  //     onSubmit={handleSubmit(onSubmit)}
  //     aria-label="Invite user"
  //     className="flex flex-col gap-3"
  //   >
  //     <div className="flex flex-col gap-2">
  //       <div className="flex gap-2">
  //         <span className="font-bold">Invite Manually</span>
  //       </div>
  //       <Input id="email" {...register('professor')} />
  //       {errors.professor && <ErrorMessage />}
  //     </div>

  //     <div className="flex justify-between gap-4">
  //       <div className="flex w-2/3 flex-col gap-2">
  //         <div className="flex gap-2">
  //           <span className="font-bold">Course Code</span>
  //           <span className="text-red-500">*</span>
  //         </div>

  //         <div className="flex gap-2">
  //           <Input
  //             type="text"
  //             placeholder="SWE"
  //             value={prefix}
  //             onChange={handlePrefixChange}
  //             maxLength={3}
  //             className="w-full rounded border p-2"
  //           />
  //           <Input
  //             type="text"
  //             placeholder="0000"
  //             value={courseCode}
  //             onChange={handleCourseCodeChange}
  //             maxLength={4}
  //             className="w-full rounded border p-2"
  //           />
  //         </div>
  //         {errors.courseNum && <ErrorMessage />}
  //       </div>
  //       <div className="flex w-1/3 flex-col gap-2">
  //         <div className="flex gap-2">
  //           <span className="font-bold">Class Section</span>
  //         </div>

  //         <Input
  //           {...register('classNum', {
  //             setValueAs: (v) => parseInt(v)
  //           })}
  //           type="number"
  //           maxLength={2}
  //           className="w-full rounded border p-2"
  //         />

  //         {errors.classNum && (
  //           <ErrorMessage message={errors.classNum.message} />
  //         )}
  //       </div>
  //     </div>

  //     <div className="flex flex-col gap-2">
  //       <div className="flex gap-2">
  //         <span className="font-bold">Semester</span>
  //         <span className="text-red-500">*</span>
  //       </div>
  //       <Select
  //         onValueChange={(value) => {
  //           setValue('semester', value)
  //         }}
  //       >
  //         <SelectTrigger>
  //           <SelectValue placeholder="Choose" />
  //         </SelectTrigger>
  //         <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
  //           {seasons.map((season) => (
  //             <SelectItem
  //               key={`${currentYear} ${season}`}
  //               value={`${currentYear} ${season}`}
  //             >
  //               {currentYear} {season}
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     </div>

  //     <div className="flex flex-col gap-2">
  //       <div className="flex gap-2">
  //         <span className="font-bold">Week</span>
  //         <span className="text-red-500">*</span>
  //       </div>
  //       <Select
  //         onValueChange={(weekCount) => {
  //           const parsedWeekCount = parseInt(weekCount, 10)
  //           setValue('week', parsedWeekCount)
  //         }}
  //       >
  //         <SelectTrigger>
  //           <SelectValue placeholder="Choose" />
  //         </SelectTrigger>
  //         <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
  //           {Array.from({ length: 16 }, (_, i) => {
  //             const week = i + 1
  //             return (
  //               <SelectItem key={week} value={week.toString()}>
  //                 {week} {week === 1 ? 'Week' : 'Weeks'}
  //               </SelectItem>
  //             )
  //           })}
  //         </SelectContent>
  //       </Select>
  //     </div>
  //   </form>
  // )
  return <>dd</>
}
